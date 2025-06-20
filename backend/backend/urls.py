from django.urls import path, include
from django.contrib import admin
from rest_framework.routers import DefaultRouter
from newsBack.views import NewsViewSet
from rest_framework.authtoken.views import obtain_auth_token

router = DefaultRouter()
router.register(r'news', NewsViewSet)

urlpatterns = [
    path('admin/', admin.site.urls),
    path('', include(router.urls)),
    path('api-token-auth/', obtain_auth_token, name='api_token_auth'),
]