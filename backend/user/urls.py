from django.urls import path
from .views import create_user_view

urlpatterns = [
    path('register/', create_user_view, name='user-register'),
]


