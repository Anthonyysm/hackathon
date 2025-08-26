from django.urls import path
from .views import create_post_view, list_post_view

urlpatterns = [
    path('posts/', list_post_view),
    path('posts/create/', create_post_view),
]
