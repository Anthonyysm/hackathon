from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from .models import Post
from .serializers import PostSerializer


@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def post_view(request):
    if request.method == 'POST':
        serializer = PostSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(user=request.user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    # get pata listar todos os posts, mais recente primeiro
    posts = Post.objects.all().order_by('-crate_in')
    serializer = PostSerializer(posts, many=True)
    return Response(serializer.data)


# Endpoint específico para listar apenas os posts do usuário logado
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def user_posts_view(request):
    posts = Post.objects.filter(user=request.user).order_by('-create_in')
    serializer = PostSerializer(posts, many=True)
    return Response(serializer.data)


# Futuro endpoint de filtragem por humor, sentimento ou motivo
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def filter_post_view(request):
    mood = request.query_params.get('mood')
    feeling = request.query_params.get('feeling')
    motive = request.query_params.get('motive')

    posts = Post.objects.all()

    if mood:
        posts = posts.filter(mood=mood)
    if feeling:
        posts = posts.filter(feeling=feeling)
    if motive:
        posts = posts.filter(motive=motive)

    posts = posts.order_by('-create_in')
    serializer = PostSerializer(posts, many=True)
    return Response(serializer.data)
