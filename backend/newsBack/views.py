from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from .models import News
from .serializers import NewsSerializer
from rest_framework.authentication import TokenAuthentication

class NewsViewSet(viewsets.ModelViewSet):
    queryset = News.objects.all().order_by('-published_date')
    serializer_class = NewsSerializer
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)