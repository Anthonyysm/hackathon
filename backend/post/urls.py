from django.urls import path
from .views import post_view

urlpatterns = [
    path('create/', post_view, name='create-post'),
]
