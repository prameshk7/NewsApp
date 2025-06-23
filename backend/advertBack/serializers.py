from rest_framework import serializers
from .models import Advert, AdvertMedia

class AdvertMediaSerializer(serializers.ModelSerializer):
    class Meta:
        model = AdvertMedia
        fields = ['id', 'file', 'uploaded_at']

class AdvertSerializer(serializers.ModelSerializer):
    media = AdvertMediaSerializer(many=True, required=False, read_only=True)
    media_files = serializers.ListField(child=serializers.FileField(), write_only=True, required=False)

    class Meta:
        model = Advert
        fields = ['id', 'ad_name', 'created_at', 'created_by', 'media', 'media_files']

    def create(self, validated_data):
        media_files = validated_data.pop('media_files', [])
        advert = Advert.objects.create(created_by=self.context['request'].user, **validated_data)
        for file in media_files:
            AdvertMedia.objects.create(advert=advert, file=file)
        return advert

    def update(self, instance, validated_data):
        media_files = validated_data.pop('media_files', [])
        instance.ad_name = validated_data.get('ad_name', instance.ad_name)
        instance.save()
        if media_files:
            instance.media.all().delete()  # Replace existing media (optional)
            for file in media_files:
                AdvertMedia.objects.create(advert=instance, file=file)
        return instance
    