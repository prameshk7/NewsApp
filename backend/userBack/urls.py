from django.urls import path
from .views import UserRegistrationView, UserLoginView, UserProfileView, ManagerUserProfileView, UserListView

urlpatterns = [
    path('register/', UserRegistrationView.as_view(), name='user-register'),
    path('login/', UserLoginView.as_view(), name='user-login'),
    path('profile/', UserProfileView.as_view(), name='user-profile'),  # Self-profile
    path('profile/<int:pk>/', ManagerUserProfileView.as_view(), name='manager-user-profile'),  # Manage staff
    path('users/', UserListView.as_view(), name='user-list'),
]