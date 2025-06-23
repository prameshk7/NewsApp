from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from .models import Advert
from .serializers import AdvertSerializer

class AdvertListCreateView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        adverts = Advert.objects.all()
        serializer = AdvertSerializer(adverts, many=True)
        return Response(serializer.data)

    def post(self, request):
        serializer = AdvertSerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class AdvertRetrieveUpdateDestroyView(APIView):
    permission_classes = [IsAuthenticated]

    def get_object(self, pk):
        try:
            return Advert.objects.get(pk=pk)
        except Advert.DoesNotExist:
            return None

    def get(self, request, pk):
        advert = self.get_object(pk)
        if not advert:
            return Response({'error': 'Advert not found'}, status=status.HTTP_404_NOT_FOUND)
        serializer = AdvertSerializer(advert)
        return Response(serializer.data)

    def put(self, request, pk):
        advert = self.get_object(pk)
        if not advert:
            return Response({'error': 'Advert not found'}, status=status.HTTP_404_NOT_FOUND)
        serializer = AdvertSerializer(advert, data=request.data, context={'request': request})
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk):
        advert = self.get_object(pk)
        if not advert:
            return Response({'error': 'Advert not found'}, status=status.HTTP_404_NOT_FOUND)
        advert.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
    