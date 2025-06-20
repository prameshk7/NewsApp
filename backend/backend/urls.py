from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/v1/', include('userBack.urls')),
    path('api/v1/', include('newsBack.urls')),
]