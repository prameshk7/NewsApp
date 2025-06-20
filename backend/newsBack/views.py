from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .models import News
from .serializers import NewsSerializer

class NewsListCreateView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        news = News.objects.all()
        serializer = NewsSerializer(news, many=True)
        return Response(serializer.data)

    def post(self, request):
        serializer = NewsSerializer(data=request.data)
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
        serializer = NewsSerializer(news, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=400)

    def delete(self, request, pk):
        news = News.objects.get(pk=pk)
        news.delete()
        return Response(status=204)