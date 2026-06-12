from rest_framework import serializers
from django.contrib.auth.password_validation import validate_password
from .models import User, Account, Category, Transaction, Debt, Task, Event


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=6)

    class Meta:
        model = User
        fields = ('id', 'name', 'email', 'password', 'plan', 'date_joined')
        read_only_fields = ('id', 'plan', 'date_joined')
        extra_kwargs = {'name': {'source': 'first_name'}}

    def create(self, validated_data):
        password = validated_data.pop('password')
        first_name = validated_data.pop('first_name', '')
        user = User(
            email=validated_data['email'],
            username=validated_data['email'],
            first_name=first_name,
        )
        user.set_password(password)
        user.save()
        return user


class UserSerializer(serializers.ModelSerializer):
    name = serializers.CharField(source='first_name')

    class Meta:
        model = User
        fields = ('id', 'name', 'email', 'plan', 'avatar_url', 'date_joined')
        read_only_fields = ('id', 'plan', 'date_joined')


class AccountSerializer(serializers.ModelSerializer):
    class Meta:
        model = Account
        fields = ('id', 'name', 'type', 'balance', 'currency', 'color', 'created_at', 'updated_at')
        read_only_fields = ('id', 'created_at', 'updated_at')


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ('id', 'name', 'type', 'icon', 'color', 'created_at')
        read_only_fields = ('id', 'created_at')


class TransactionSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source='category.name', read_only=True, default=None)
    category_icon = serializers.CharField(source='category.icon', read_only=True, default=None)

    class Meta:
        model = Transaction
        fields = (
            'id', 'account_id', 'category_id',
            'title', 'amount', 'type', 'status', 'date', 'notes',
            'category_name', 'category_icon', 'created_at',
        )
        read_only_fields = ('id', 'date', 'created_at', 'category_name', 'category_icon')


class DebtSerializer(serializers.ModelSerializer):
    paid_percentage = serializers.FloatField(read_only=True)

    class Meta:
        model = Debt
        fields = (
            'id', 'name', 'total_amount', 'remaining_amount',
            'monthly_payment', 'interest_rate', 'due_date',
            'paid_percentage', 'created_at', 'updated_at',
        )
        read_only_fields = ('id', 'paid_percentage', 'created_at', 'updated_at')


class TaskSerializer(serializers.ModelSerializer):
    class Meta:
        model = Task
        fields = (
            'id', 'title', 'priority', 'due_date',
            'is_completed', 'notes', 'created_at', 'updated_at',
        )
        read_only_fields = ('id', 'created_at', 'updated_at')


class EventSerializer(serializers.ModelSerializer):
    class Meta:
        model = Event
        fields = ('id', 'title', 'description', 'event_date', 'type', 'created_at')
        read_only_fields = ('id', 'created_at')
