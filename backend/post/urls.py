from django.urls import path
from .views import create_post_view

urlpatterns = [
    path('create/', create_post_view, name='create-post'),
]
