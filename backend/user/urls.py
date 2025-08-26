from django.urls import path
from .views import (
    create_user_view,
    login_view,
    update_user_view,
    delete_user_view,
)

urlpatterns = [
    path('register/', create_user_view, name='user-register'),
    path('update/<int:user_id>/', update_user_view, name='user-update'),
    path('delete/<int:user_id>/', delete_user_view, name='user-delete'),
    path('login/', login_view, name='user-login'),
]
