from rest_framework import serializers
from .models import Blog

class BlogSerializer(serializers.ModelSerializer):
    class Meta:
        model = Blog
        fields = '__all__'

    def create(self, validated_data):
        blog = Blog.objects.create(created_by=self.context['request'].user, **validated_data)
        return blog
    
