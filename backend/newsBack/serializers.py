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
    category = CategorySerializer()
    type = TypeSerializer()

    class Meta:
        model = News
        fields = '__all__'

    def create(self, validated_data):
        category_data = validated_data.pop('category')
        type_data = validated_data.pop('type')
        category, _ = Category.objects.get_or_create(**category_data)
        type_obj, _ = Type.objects.get_or_create(**type_data)
        news = News.objects.create(category=category, type=type_obj, **validated_data)
        return news