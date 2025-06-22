from django.db import models
from django.contrib.auth.models import AbstractUser

class User(AbstractUser):
    firstname = models.CharField(max_length=100)
    lastname = models.CharField(max_length=100)
    email = models.EmailField(unique=True)
    username = models.CharField(max_length=150, unique=True)
    profile_image = models.ImageField(upload_to='profile_images/', null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    created_by = models.ForeignKey('self', on_delete=models.SET_NULL, null=True, blank=True)

    USERNAME_FIELD = 'username'
    REQUIRED_FIELDS = ['firstname', 'lastname', 'email']

    def __str__(self):
        return self.username
    