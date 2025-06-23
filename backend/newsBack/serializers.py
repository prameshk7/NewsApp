from rest_framework import serializers
from .models import News, Category, Type, Video, NewsMedia

class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ['id', 'name', 'created_at', 'created_by']

class TypeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Type
        fields = ['id', 'name', 'created_at', 'created_by']

class NewsMediaSerializer(serializers.ModelSerializer):
    class Meta:
        model = NewsMedia
        fields = ['id', 'file', 'uploaded_at']

class VideoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Video
        fields = ['id', 'video_url', 'created_by', 'created_at']
        extra_kwargs = {
            'created_by': {'read_only': True},
        }

    def create(self, validated_data):
        request = self.context.get('request')
        if request and hasattr(request, 'user') and request.user.is_authenticated:
            validated_data['created_by'] = request.user
        return super().create(validated_data)

class NewsSerializer(serializers.ModelSerializer):
    category = serializers.PrimaryKeyRelatedField(queryset=Category.objects.all())
    type = serializers.PrimaryKeyRelatedField(queryset=Type.objects.all())
    video = serializers.PrimaryKeyRelatedField(queryset=Video.objects.all(), allow_null=True, required=False)
    media = NewsMediaSerializer(many=True, read_only=True)
    media_files = serializers.ListField(child=serializers.FileField(), write_only=True, required=False)
    video_url = serializers.URLField(write_only=True, required=False, allow_blank=True)

    class Meta:
        model = News
        fields = ['id', 'title', 'desc', 'category', 'type', 'video', 'media', 'media_files', 'video_url', 'created_at', 'created_by']
        extra_kwargs = {
            'created_by': {'read_only': True},
        }

    def create(self, validated_data):
        media_files = validated_data.pop('media_files', [])
        video_url = validated_data.pop('video_url', '')
        validated_data.pop('created_by', None)  # Remove created_by if present
        video = None
        if video_url:
            video = Video.objects.create(video_url=video_url, created_by=self.context['request'].user)
        news = News.objects.create(created_by=self.context['request'].user, video=video, **validated_data)
        for file in media_files:
            NewsMedia.objects.create(news=news, file=file)
        return news

    def update(self, instance, validated_data):
        media_files = validated_data.pop('media_files', [])
        video_url = validated_data.pop('video_url', '')
        validated_data.pop('created_by', None)  # Remove created_by if present
        instance.title = validated_data.get('title', instance.title)
        instance.desc = validated_data.get('desc', instance.desc)
        instance.category = validated_data.get('category', instance.category)
        instance.type = validated_data.get('type', instance.type)
        if video_url:
            if instance.video:
                instance.video.video_url = video_url
                instance.video.save()
            else:
                instance.video = Video.objects.create(video_url=video_url, created_by=self.context['request'].user)
        elif video_url == '':
            instance.video = None
        instance.save()
        if media_files:
            instance.media.all().delete()  # Optional: Replace existing media
            for file in media_files:
                NewsMedia.objects.create(news=instance, file=file)
        return instance
    