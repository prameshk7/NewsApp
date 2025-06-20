from django.db import models
from userBack.models import User

class News(models.Model):
    news_title = models.CharField(max_length=200)
    news_desc = models.TextField()
    published_date = models.DateTimeField(auto_now_add=True)
    created_at = models.DateTimeField(auto_now_add=True)
    created_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name='news')

    def __str__(self):
        return self.news_title