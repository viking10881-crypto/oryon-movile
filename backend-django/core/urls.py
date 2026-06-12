from django.urls import path, include
from rest_framework_simplejwt.views import TokenRefreshView

urlpatterns = [
    path('auth/', include('api.urls')),
    path('auth/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('', include('api.urls')),
]
