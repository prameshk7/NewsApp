from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.authtoken.models import Token
from rest_framework.permissions import IsAuthenticated, BasePermission
from .models import User
from .serializers import UserSerializer
from django.contrib.auth import authenticate
from django.core.exceptions import PermissionDenied

class IsManagerUser(BasePermission):
    def has_permission(self, request, view):
        if not request.user.is_authenticated:
            return False
        if view.__class__.__name__ == 'UserRegistrationView':
            return request.user.is_staff and not request.user.is_superuser
        return True

class IsSelfOrManager(BasePermission):
    def has_permission(self, request, view):
        if not request.user.is_authenticated:
            return False
        if hasattr(view, 'kwargs') and 'pk' in view.kwargs:
            pk = view.kwargs['pk']
            return request.user.id == int(pk) or (request.user.is_staff and not request.user.is_superuser)
        return True

class UserRegistrationView(APIView):
    permission_classes = [IsAuthenticated, IsManagerUser]

    def post(self, request):
        if not request.user.is_staff or request.user.is_superuser:
            raise PermissionDenied("Only managers can create staff users.")
        # Default to is_staff=False for staff users created by managers
        data = request.data.copy()
        data['is_staff'] = False  # Ensure staff users are not managers
        serializer = UserSerializer(data=data, context={'created_by': request.user})
        if serializer.is_valid():
            user = serializer.save()
            token, _ = Token.objects.get_or_create(user=user)
            return Response({'token': token.key, 'message': 'Staff user created successfully'}, status=201)
        return Response(serializer.errors, status=400)

class UserLoginView(APIView):
    def post(self, request):
        username = request.data.get('username')
        password = request.data.get('password')
        print(f"Attempting login with username: {username}, password: {password}")
        user = authenticate(request, username=username, password=password)
        if user is not None:
            token, created = Token.objects.get_or_create(user=user)
            return Response({'token': token.key, 'message': 'Login successful'})
        return Response({'error': 'Invalid username or password'}, status=401)

class UserProfileView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        serializer = UserSerializer(request.user)
        print(f"User profile data: {serializer.data}")  # Debug log
        return Response(serializer.data)

    def put(self, request):
        serializer = UserSerializer(request.user, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=400)

    def delete(self, request):
        request.user.delete()
        return Response(status=204)

class ManagerUserProfileView(APIView):
    permission_classes = [IsAuthenticated, IsSelfOrManager]

    def get(self, request, pk):
        user = User.objects.get(pk=pk)
        if request.user.id != user.pk and not (request.user.is_staff and not request.user.is_superuser):
            raise PermissionDenied("You do not have permission to view this user's profile.")
        serializer = UserSerializer(user)
        return Response(serializer.data)

    def put(self, request, pk):
        user = User.objects.get(pk=pk)
        if request.user.id != user.pk and not (request.user.is_staff and not request.user.is_superuser):
            raise PermissionDenied("You do not have permission to update this user's profile.")
        serializer = UserSerializer(user, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=400)

    def delete(self, request, pk):
        user = User.objects.get(pk=pk)
        if request.user.id != user.pk and not (request.user.is_staff and not request.user.is_superuser):
            raise PermissionDenied("You do not have permission to delete this user's profile.")
        user.delete()
        return Response(status=204)

class UserListView(APIView):
    permission_classes = [IsAuthenticated, IsManagerUser]

    def get(self, request):
        if request.user.is_staff and not request.user.is_superuser:
            users = User.objects.all().exclude(is_superuser=True)
        else:
            users = User.objects.filter(id=request.user.id)
        serializer = UserSerializer(users, many=True)
        return Response(serializer.data)
    
    