from django.db import models
from userBack.models import User

class Blog(models.Model):
    blg_id = models.AutoField(primary_key=True)
    blg_title = models.CharField(max_length=200)
    blg_desc = models.TextField()
    blg_image = models.JSONField(default=list)  # Store multiple image URLs
    created_at = models.DateTimeField(auto_now_add=True)
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)

    def __str__(self):
        return self.blg_title
    
