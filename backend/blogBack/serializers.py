from rest_framework import serializers
from .models import Blog, BlogImage

class BlogImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = BlogImage
        fields = ['id', 'image', 'uploaded_at']

class BlogSerializer(serializers.ModelSerializer):
    images = BlogImageSerializer(many=True, required=False)

    class Meta:
        model = Blog
        fields = ['blg_id', 'blg_title', 'blg_desc', 'created_at', 'created_by', 'images']

    def create(self, validated_data):
        image_data = validated_data.pop('images', [])
        blog = Blog.objects.create(created_by=self.context['request'].user, **validated_data)
        for image_item in image_data:
            BlogImage.objects.create(blog=blog, **image_item)
        return blog

    def update(self, instance, validated_data):
        image_data = validated_data.pop('images', [])
        instance.blg_title = validated_data.get('blg_title', instance.blg_title)
        instance.blg_desc = validated_data.get('blg_desc', instance.blg_desc)
        instance.save()
        if image_data:
            instance.images.all().delete()  # Optional: Replace existing images
            for image_item in image_data:
                BlogImage.objects.create(blog=instance, **image_item)
        return instance
    
    