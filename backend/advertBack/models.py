from django.db import models
from django.core.exceptions import ValidationError
from userBack.models import User
import os

def validate_media_file(file):
    valid_extensions = ['jpg', 'jpeg', 'png', 'gif', 'mp4', 'webm', 'ogg']
    max_size = 10 * 1024 * 1024  # 10MB
    ext = os.path.splitext(file.name)[1].lower().lstrip('.')
    if ext not in valid_extensions:
        raise ValidationError(f'Unsupported file type: {ext}. Supported types: {valid_extensions}')
    if file.size > max_size:
        raise ValidationError(f'File size exceeds limit of 10MB.')

class AdvertMedia(models.Model):
    advert = models.ForeignKey('Advert', related_name='media', on_delete=models.CASCADE)
    file = models.FileField(upload_to='advert_media/', validators=[validate_media_file], null=True, blank=True)
    uploaded_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.advert.ad_name} - {self.file.name}"

class Advert(models.Model):
    ad_name = models.CharField(max_length=200)
    created_at = models.DateTimeField(auto_now_add=True)
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)

    def __str__(self):
        return self.ad_name
    
    