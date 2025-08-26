from rest_framework import serializers
from .models import Post


class PostSerializer(serializers.ModelSerializer):
    class Meta:
        model = Post
        fields = ['id', 'mood', 'feeling', 'motive', 'text', 'create_in']
        read_only_fields = ['id', 'create_in']
