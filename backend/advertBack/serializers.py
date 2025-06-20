from rest_framework import serializers
from .models import Advert

class AdvertSerializer(serializers.ModelSerializer):
    class Meta:
        model = Advert
        fields = '__all__'

    def create(self, validated_data):
        advert = Advert.objects.create(created_by=self.context['request'].user, **validated_data)
        return advert