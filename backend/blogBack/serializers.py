from rest_framework import serializers
from .models import Blog, BlogImage

class BlogImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = BlogImage
        fields = ['id', 'image', 'uploaded_at']

class BlogSerializer(serializers.ModelSerializer):
    images = BlogImageSerializer(many=True, required=False, read_only=True)
    media_files = serializers.ListField(child=serializers.FileField(), write_only=True, required=False)

    class Meta:
        model = Blog
        fields = ['blg_id', 'blg_title', 'blg_desc', 'created_at', 'created_by', 'images', 'media_files']

    def create(self, validated_data):
        media_files = validated_data.pop('media_files', [])
        blog = Blog.objects.create(created_by=self.context['request'].user, **validated_data)
        for file in media_files:
            BlogImage.objects.create(blog=blog, image=file)
        return blog

    def update(self, instance, validated_data):
        media_files = validated_data.pop('media_files', [])
        instance.blg_title = validated_data.get('blg_title', instance.blg_title)
        instance.blg_desc = validated_data.get('blg_desc', instance.blg_desc)
        instance.save()
        if media_files:
            instance.images.all().delete()  # Replace existing media (optional)
            for file in media_files:
                BlogImage.objects.create(blog=instance, image=file)
        return instance
    
    