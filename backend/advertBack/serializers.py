from rest_framework import serializers
from .models import Advert, AdvertMedia

class AdvertMediaSerializer(serializers.ModelSerializer):
    class Meta:
        model = AdvertMedia
        fields = ['id', 'file', 'uploaded_at']

class AdvertSerializer(serializers.ModelSerializer):
    media = AdvertMediaSerializer(many=True, required=False)

    class Meta:
        model = Advert
        fields = ['id', 'ad_name', 'created_at', 'created_by', 'media']

    def create(self, validated_data):
        media_data = validated_data.pop('media', [])
        advert = Advert.objects.create(created_by=self.context['request'].user, **validated_data)
        for media_item in media_data:
            AdvertMedia.objects.create(advert=advert, **media_item)
        return advert

    def update(self, instance, validated_data):
        media_data = validated_data.pop('media', [])
        instance.ad_name = validated_data.get('ad_name', instance.ad_name)
        instance.save()
        if media_data:
            instance.media.all().delete()  # Optional: Replace existing media
            for media_item in media_data:
                AdvertMedia.objects.create(advert=instance, **media_item)
        return instance