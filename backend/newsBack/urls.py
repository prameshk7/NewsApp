from django.urls import path
from .views import NewsListCreateView, NewsRetrieveUpdateDestroyView, CategoryListCreateView, TypeListCreateView

urlpatterns = [
    path('news/', NewsListCreateView.as_view(), name='news-list-create'),
    path('news/<int:pk>/', NewsRetrieveUpdateDestroyView.as_view(), name='news-detail'),
    path('categories/', CategoryListCreateView.as_view(), name='category-list-create'),
    path('types/', TypeListCreateView.as_view(), name='type-list-create'),
]
