from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
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
            return Response(serializer.data, status=201)
        return Response(serializer.errors, status=400)

class AdvertRetrieveUpdateDestroyView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, pk):
        advert = Advert.objects.get(pk=pk)
        serializer = AdvertSerializer(advert)
        return Response(serializer.data)

    def put(self, request, pk):
        advert = Advert.objects.get(pk=pk)
        serializer = AdvertSerializer(advert, data=request.data, context={'request': request})
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=400)

    def delete(self, request, pk):
        advert = Advert.objects.get(pk=pk)
        advert.delete()
        return Response(status=204)