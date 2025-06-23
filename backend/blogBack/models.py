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

class BlogImage(models.Model):
    blog = models.ForeignKey('Blog', related_name='images', on_delete=models.CASCADE)
    image = models.FileField(upload_to='blog_media/', validators=[validate_media_file], null=True, blank=True)
    uploaded_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.image.name}"

class Blog(models.Model):
    blg_id = models.AutoField(primary_key=True)
    blg_title = models.CharField(max_length=200)
    blg_desc = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)

    def __str__(self):
        return self.blg_title
    