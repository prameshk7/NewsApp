from django.urls import path
from .views import NewsListCreateView, NewsRetrieveUpdateDestroyView

urlpatterns = [
    path('news/', NewsListCreateView.as_view(), name='news-list-create'),
    path('news/<int:pk>/', NewsRetrieveUpdateDestroyView.as_view(), name='news-detail'),
]