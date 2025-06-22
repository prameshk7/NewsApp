from django.urls import path
from .views import NewsListCreateView, NewsRetrieveUpdateDestroyView, CategoryListCreateView, TypeListCreateView, CategoryRetrieveUpdateDestroyView, TypeRetrieveUpdateDestroyView, VideoDetailView, VideoListCreateView

urlpatterns = [
    path('news/', NewsListCreateView.as_view(), name='news-list-create'),
    path('news/<int:pk>/', NewsRetrieveUpdateDestroyView.as_view(), name='news-detail'),
    path('categories/', CategoryListCreateView.as_view(), name='category-list-create'),
    path('categories/<int:pk>/', CategoryRetrieveUpdateDestroyView.as_view(), name='category-detail'),
    path('types/', TypeListCreateView.as_view(), name='type-list-create'),
    path('types/<int:pk>/', TypeRetrieveUpdateDestroyView.as_view(), name='type-detail'),
    path('videos/', VideoListCreateView.as_view(), name='video-list'),
    path('videos/<int:pk>/', VideoDetailView.as_view(), name='video-detail'),
]
