from django.urls import path
from .views import AdvertListCreateView, AdvertRetrieveUpdateDestroyView

urlpatterns = [
    path('adverts/', AdvertListCreateView.as_view(), name='advert-list-create'),
    path('adverts/<int:pk>/', AdvertRetrieveUpdateDestroyView.as_view(), name='advert-detail'),
]