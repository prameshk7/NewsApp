from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .models import News, Category, Type, Video
from .serializers import NewsSerializer, CategorySerializer, TypeSerializer, VideoSerializer

class CategoryListCreateView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        categories = Category.objects.all()
        serializer = CategorySerializer(categories, many=True)
        return Response(serializer.data)

    def post(self, request):
        serializer = CategorySerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(created_by=request.user)
            return Response(serializer.data, status=201)
        return Response(serializer.errors, status=400)


class VideoListCreateView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if not request.user.is_staff or request.user.is_superuser:
            return Response({"error": "Only managers can view videos."}, status=403)
        videos = Video.objects.filter(created_by=request.user)
        serializer = VideoSerializer(videos, many=True)
        return Response(serializer.data)

    def post(self, request):
        if not request.user.is_staff or request.user.is_superuser:
            return Response({"error": "Only managers can create videos."}, status=403)
        serializer = VideoSerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=201)
        return Response(serializer.errors, status=400)

class VideoDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def get_object(self, pk):
        try:
            video = Video.objects.get(pk=pk, created_by=self.request.user)
            return video
        except Video.DoesNotExist:
            return None

    def get(self, request, pk):
        if not request.user.is_staff or request.user.is_superuser:
            return Response({"error": "Only managers can view videos."}, status=403)
        video = self.get_object(pk)
        if video is None:
            return Response({"error": "Video not found or not authorized."}, status=404)
        serializer = VideoSerializer(video)
        return Response(serializer.data)

    def put(self, request, pk):
        if not request.user.is_staff or request.user.is_superuser:
            return Response({"error": "Only managers can update videos."}, status=403)
        video = self.get_object(pk)
        if video is None:
            return Response({"error": "Video not found or not authorized."}, status=404)
        serializer = VideoSerializer(video, data=request.data, context={'request': request})
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=400)

    def delete(self, request, pk):
        if not request.user.is_staff or request.user.is_superuser:
            return Response({"error": "Only managers can delete videos."}, status=403)
        video = self.get_object(pk)
        if video is None:
            return Response({"error": "Video not found or not authorized."}, status=404)
        video.delete()
        return Response({"message": "Video deleted successfully."}, status=204)

class TypeListCreateView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        types = Type.objects.all()
        serializer = TypeSerializer(types, many=True)
        return Response(serializer.data)

    def post(self, request):
        serializer = TypeSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(created_by=request.user)
            return Response(serializer.data, status=201)
        return Response(serializer.errors, status=400)

class CategoryRetrieveUpdateDestroyView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, pk):
        category = Category.objects.get(pk=pk)
        serializer = CategorySerializer(category)
        return Response(serializer.data)

    def put(self, request, pk):
        category = Category.objects.get(pk=pk)
        serializer = CategorySerializer(category, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=400)

    def delete(self, request, pk):
        category = Category.objects.get(pk=pk)
        category.delete()
        return Response(status=204)

class TypeRetrieveUpdateDestroyView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, pk):
        type_obj = Type.objects.get(pk=pk)
        serializer = TypeSerializer(type_obj)
        return Response(serializer.data)

    def put(self, request, pk):
        type_obj = Type.objects.get(pk=pk)
        serializer = TypeSerializer(type_obj, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=400)

    def delete(self, request, pk):
        type_obj = Type.objects.get(pk=pk)
        type_obj.delete()
        return Response(status=204)

class NewsListCreateView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        news = News.objects.all()
        serializer = NewsSerializer(news, many=True)
        return Response(serializer.data)

    def post(self, request):
        serializer = NewsSerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            serializer.save(created_by=request.user)
            return Response(serializer.data, status=201)
        return Response(serializer.errors, status=400)

class NewsRetrieveUpdateDestroyView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, pk):
        news = News.objects.get(pk=pk)
        serializer = NewsSerializer(news)
        return Response(serializer.data)

    def put(self, request, pk):
        news = News.objects.get(pk=pk)
        serializer = NewsSerializer(news, data=request.data, context={'request': request})
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=400)

    def delete(self, request, pk):
        news = News.objects.get(pk=pk)
        news.delete()
        return Response(status=204)
    
    