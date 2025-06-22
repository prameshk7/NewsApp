from rest_framework import serializers
from .models import News, Category, Type

class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = '__all__'

class TypeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Type
        fields = '__all__'

class NewsSerializer(serializers.ModelSerializer):
    category = serializers.PrimaryKeyRelatedField(queryset=Category.objects.all())
    type = serializers.PrimaryKeyRelatedField(queryset=Type.objects.all())
    image_files = serializers.ImageField(max_length=None, allow_empty_file=False, use_url=True, required=False)

    class Meta:
        model = News
        fields = '__all__'

    def create(self, validated_data):
        image_files = validated_data.pop('image_files', None)
        news = News.objects.create(**validated_data)
        if image_files:
            news.image_files = image_files
            news.save()
        return news
    
    def update(self, instance, validated_data):
        validated_data.pop('image_files', None)  # Handle file separately
        instance.title = validated_data.get('title', instance.title)
        instance.desc = validated_data.get('desc', instance.desc)
        instance.category = validated_data.get('category', instance.category)
        instance.type = validated_data.get('type', instance.type)
        if 'image_files' in validated_data and validated_data['image_files']:
            instance.image_files = validated_data['image_files']
        instance.save()
        return instance
    
    