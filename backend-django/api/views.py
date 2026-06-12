from django.db.models import Sum, Q
from django.utils import timezone
from rest_framework import generics, status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken

from .models import Account, Debt, Task, Transaction
from .serializers import (
    AccountSerializer, DebtSerializer, RegisterSerializer,
    TaskSerializer, TransactionSerializer, UserSerializer,
)


# ── Utilidad JWT ──────────────────────────────────────────────
def get_tokens_for_user(user):
    refresh = RefreshToken.for_user(user)
    return str(refresh.access_token)


# ── Auth ──────────────────────────────────────────────────────

class RegisterView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        user = serializer.save()
        token = get_tokens_for_user(user)
        return Response(
            {'token': token, 'user': UserSerializer(user).data},
            status=status.HTTP_201_CREATED,
        )


class LoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        from django.contrib.auth import authenticate
        email = request.data.get('email', '').strip()
        password = request.data.get('password', '')
        if not email or not password:
            return Response({'error': 'Correo y contraseña son requeridos'}, status=400)

        user = authenticate(request, username=email, password=password)
        if user is None:
            return Response({'error': 'Credenciales incorrectas'}, status=401)

        token = get_tokens_for_user(user)
        return Response({'token': token, 'user': UserSerializer(user).data})


# ── Accounts ──────────────────────────────────────────────────

class AccountListCreateView(generics.ListCreateAPIView):
    serializer_class = AccountSerializer

    def get_queryset(self):
        return Account.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class AccountBalanceView(APIView):
    def patch(self, request, pk):
        try:
            account = Account.objects.get(pk=pk, user=request.user)
        except Account.DoesNotExist:
            return Response({'error': 'Cuenta no encontrada'}, status=404)
        account.balance = request.data.get('balance', account.balance)
        account.save()
        return Response(AccountSerializer(account).data)


class TotalLiquidityView(APIView):
    def get(self, request):
        total = Account.objects.filter(user=request.user).aggregate(
            total=Sum('balance')
        )['total'] or 0
        return Response({'total': str(total)})


# ── Transactions ──────────────────────────────────────────────

class TransactionListCreateView(generics.ListCreateAPIView):
    serializer_class = TransactionSerializer

    def get_queryset(self):
        qs = Transaction.objects.filter(user=self.request.user)
        tx_type = self.request.query_params.get('type')
        if tx_type:
            qs = qs.filter(type=tx_type)
        limit = int(self.request.query_params.get('limit', 20))
        offset = int(self.request.query_params.get('offset', 0))
        return qs[offset: offset + limit]

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class TransactionDetailView(generics.DestroyAPIView):
    serializer_class = TransactionSerializer

    def get_queryset(self):
        return Transaction.objects.filter(user=self.request.user)


class TransactionSummaryView(APIView):
    def get(self, request):
        start = timezone.now().replace(day=1, hour=0, minute=0, second=0, microsecond=0)
        qs = Transaction.objects.filter(user=request.user, date__gte=start)
        income = qs.filter(type='income').aggregate(t=Sum('amount'))['t'] or 0
        expense = qs.filter(type='expense').aggregate(t=Sum('amount'))['t'] or 0
        return Response({
            'total_income': str(income),
            'total_expense': str(abs(expense)),
        })


# ── Debts ─────────────────────────────────────────────────────

class DebtListCreateView(generics.ListCreateAPIView):
    serializer_class = DebtSerializer

    def get_queryset(self):
        return Debt.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class DebtDetailView(generics.UpdateAPIView):
    serializer_class = DebtSerializer
    http_method_names = ['patch']

    def get_queryset(self):
        return Debt.objects.filter(user=self.request.user)


# ── Tasks ─────────────────────────────────────────────────────

class TaskListCreateView(generics.ListCreateAPIView):
    serializer_class = TaskSerializer

    def get_queryset(self):
        qs = Task.objects.filter(user=self.request.user)
        date = self.request.query_params.get('date')
        if date:
            qs = qs.filter(due_date__date=date)
        return qs.order_by('due_date', 'created_at')

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class TaskDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = TaskSerializer
    http_method_names = ['get', 'patch', 'delete']

    def get_queryset(self):
        return Task.objects.filter(user=self.request.user)


# ── Profile ───────────────────────────────────────────────────

class ProfileView(APIView):
    def get(self, request):
        return Response(UserSerializer(request.user).data)

    def patch(self, request):
        user = request.user
        if 'name' in request.data:
            user.first_name = request.data['name']
        if 'avatar_url' in request.data:
            user.avatar_url = request.data['avatar_url']
        user.save()
        return Response(UserSerializer(user).data)


# ── Health ────────────────────────────────────────────────────

class HealthView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        from django.db import connection
        try:
            connection.ensure_connection()
            return Response({'status': 'ok', 'db': 'connected'})
        except Exception:
            return Response({'status': 'error', 'db': 'disconnected'}, status=500)
