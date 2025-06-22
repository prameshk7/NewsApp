from django.db import models
from userBack.models import User

class BlogImage(models.Model):
    blog = models.ForeignKey('Blog', related_name='images', on_delete=models.CASCADE)
    image = models.ImageField(upload_to='blog_images/', null=True, blank=True)
    uploaded_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.blog.blg_title} - {self.image.name}"

class Blog(models.Model):
    blg_id = models.AutoField(primary_key=True)
    blg_title = models.CharField(max_length=200)
    blg_desc = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)

    def __str__(self):
        return self.blg_title