from rest_framework import serializers
from .models import News

class NewsSerializer(serializers.ModelSerializer):
    created_by = serializers.ReadOnlyField(source='created_by.username')

    class Meta:
        model = News
        fields = ['id', 'news_title', 'news_desc', 'published_date', 'created_at', 'created_by']