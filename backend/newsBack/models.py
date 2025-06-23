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

class Category(models.Model):
    name = models.CharField(max_length=100, unique=True)
    created_at = models.DateTimeField(auto_now_add=True)
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)

    def __str__(self):
        return self.name

class Type(models.Model):
    name = models.CharField(max_length=100, unique=True)
    created_at = models.DateTimeField(auto_now_add=True)
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)

    def __str__(self):
        return self.name

class Video(models.Model):
    video_url = models.URLField(max_length=200, help_text="URL of the video (e.g., YouTube)")
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Video {self.pk} - {self.video_url}"

    class Meta:
        verbose_name = "Video"
        verbose_name_plural = "Videos"

class NewsMedia(models.Model):
    news = models.ForeignKey('News', related_name='media', on_delete=models.CASCADE)
    file = models.FileField(upload_to='news_media/', validators=[validate_media_file], null=True, blank=True)
    uploaded_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.news.title} - {self.file.name}"

class News(models.Model):
    title = models.CharField(max_length=200)
    desc = models.TextField()
    category = models.ForeignKey(Category, on_delete=models.SET_NULL, null=True, blank=True)
    type = models.ForeignKey(Type, on_delete=models.SET_NULL, null=True, blank=True)
    video = models.ForeignKey(Video, on_delete=models.SET_NULL, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)

    def __str__(self):
        return self.title
    
    