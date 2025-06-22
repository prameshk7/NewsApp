from django.db import models
from userBack.models import User

class AdvertMedia(models.Model):
    advert = models.ForeignKey('Advert', related_name='media', on_delete=models.CASCADE)
    file = models.FileField(upload_to='advert_media/', null=True, blank=True)
    uploaded_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.advert.ad_name} - {self.file.name}"

class Advert(models.Model):
    ad_name = models.CharField(max_length=200)
    created_at = models.DateTimeField(auto_now_add=True)
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)

    def __str__(self):
        return self.ad_name
    
    