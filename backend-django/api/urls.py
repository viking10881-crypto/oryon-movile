from django.urls import path
from . import views

urlpatterns = [
    # Health
    path('health/', views.HealthView.as_view()),

    # Auth
    path('auth/register/', views.RegisterView.as_view()),
    path('auth/login/', views.LoginView.as_view()),

    # Accounts
    path('accounts/', views.AccountListCreateView.as_view()),
    path('accounts/total-liquidity/', views.TotalLiquidityView.as_view()),
    path('accounts/<uuid:pk>/balance/', views.AccountBalanceView.as_view()),

    # Transactions
    path('transactions/', views.TransactionListCreateView.as_view()),
    path('transactions/summary/', views.TransactionSummaryView.as_view()),
    path('transactions/<uuid:pk>/', views.TransactionDetailView.as_view()),

    # Debts
    path('debts/', views.DebtListCreateView.as_view()),
    path('debts/<uuid:pk>/', views.DebtDetailView.as_view()),

    # Tasks
    path('tasks/', views.TaskListCreateView.as_view()),
    path('tasks/<uuid:pk>/', views.TaskDetailView.as_view()),
]
