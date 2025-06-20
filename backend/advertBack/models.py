from django.db import models
from userBack.models import User

class Advert(models.Model):
    ad_name = models.CharField(max_length=200)
    ad_images_vids_gifs = models.JSONField(default=list)  # Store multiple URLs for images, videos, or GIFs
    created_at = models.DateTimeField(auto_now_add=True)
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)

    def __str__(self):
        return self.ad_name
    
