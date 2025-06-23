from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.authtoken.models import Token
from rest_framework.permissions import IsAuthenticated, BasePermission
from .models import User, OTP,Comment
from .serializers import UserSerializer,CommentSerializer
from django.contrib.auth import authenticate
from django.core.exceptions import PermissionDenied
from django.core.mail import send_mail
from django.utils import timezone
from rest_framework import status

class IsManagerUser(BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.is_staff and not request.user.is_superuser

class IsSelfOrManager(BasePermission):
    def has_permission(self, request, view):
        if not request.user.is_authenticated:
            return False
        if hasattr(view, 'kwargs') and 'pk' in view.kwargs:
            pk = view.kwargs['pk']
            try:
                user = User.objects.get(pk=pk)
                return request.user.id == int(pk) or (request.user.is_staff and not request.user.is_superuser and user.created_by == request.user)
            except User.DoesNotExist:
                return False
        return True

class UserRegistrationView(APIView):
    permission_classes = [IsAuthenticated, IsManagerUser]

    def post(self, request):
        serializer = UserSerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            user = serializer.save()
            token, _ = Token.objects.get_or_create(user=user)
            return Response({'token': token.key, 'message': 'User created successfully'}, status=201)
        return Response(serializer.errors, status=400)

class UserLoginView(APIView):
    def post(self, request):
        username = request.data.get('username')
        password = request.data.get('password')
        user = authenticate(request, username=username, password=password)
        if user:
            token, _ = Token.objects.get_or_create(user=user)
            return Response({'token': token.key, 'message': 'Login successful'})
        return Response({'error': 'Invalid username or password'}, status=401)

class UserProfileView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        serializer = UserSerializer(request.user)
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
        serializer = UserSerializer(user)
        return Response(serializer.data)

    def put(self, request, pk):
        user = User.objects.get(pk=pk)
        serializer = UserSerializer(user, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=400)

    def delete(self, request, pk):
        user = User.objects.get(pk=pk)
        user.delete()
        return Response(status=204)

class UserListView(APIView):
    permission_classes = [IsAuthenticated, IsManagerUser]

    def get(self, request):
        users = User.objects.filter(created_by=request.user, is_staff=False)
        serializer = UserSerializer(users, many=True)
        return Response(serializer.data)

class ForgotPasswordRequestView(APIView):
    def post(self, request):
        email = request.data.get('email')
        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            return Response({'error': 'No user found with this email.'}, status=status.HTTP_404_NOT_FOUND)

        # Invalidate previous OTPs
        OTP.objects.filter(user=user, is_used=False).update(is_used=True)

        # Create new OTP
        otp = OTP.objects.create(user=user)
        subject = 'Password Reset OTP'
        message = f'Your OTP for password reset is: {otp.code}\nThis OTP is valid for 10 minutes.'
        from_email = 'News App <your-email@gmail.com>'
        try:
            send_mail(subject, message, from_email, [user.email], fail_silently=False)
        except Exception as e:
            return Response({'error': f'Failed to send email: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        return Response({'message': 'OTP sent to your email.'}, status=status.HTTP_200_OK)

class VerifyOTPView(APIView):
    def post(self, request):
        email = request.data.get('email')
        code = request.data.get('code')
        try:
            user = User.objects.get(email=email)
            otp = OTP.objects.filter(user=user, code=code, is_used=False).first()
            if not otp:
                return Response({'error': 'Invalid OTP.'}, status=status.HTTP_400_BAD_REQUEST)
            if not otp.is_valid():
                return Response({'error': 'OTP has expired.'}, status=status.HTTP_400_BAD_REQUEST)
            otp.is_used = True
            otp.save()
            return Response({'message': 'OTP verified successfully.', 'email': email}, status=status.HTTP_200_OK)
        except User.DoesNotExist:
            return Response({'error': 'No user found with this email.'}, status=status.HTTP_404_NOT_FOUND)

class ResetPasswordView(APIView):
    def post(self, request):
        email = request.data.get('email')
        password = request.data.get('password')
        try:
            user = User.objects.get(email=email)
            # Verify that a valid OTP was recently used
            otp = OTP.objects.filter(user=user, is_used=True, expires_at__gte=timezone.now() - timezone.timedelta(minutes=10)).first()
            if not otp:
                return Response({'error': 'No valid OTP verification found. Please request a new OTP.'}, status=status.HTTP_400_BAD_REQUEST)
            user.set_password(password)
            user.save()
            return Response({'message': 'Password reset successfully.'}, status=status.HTTP_200_OK)
        except User.DoesNotExist:
            return Response({'error': 'No user found with this email.'}, status=status.HTTP_404_NOT_FOUND)
        
class CommentListView(APIView):
    def get(self, request):
        comments = Comment.objects.all()
        serializer = CommentSerializer(comments, many=True)
        return Response(serializer.data)

    def post(self, request):
        serializer = CommentSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class CommentDetailView(APIView):
    def get_object(self, pk):
        try:
            return Comment.objects.get(pk=pk)
        except Comment.DoesNotExist:
            return None

    def get(self, request, pk):
        comment = self.get_object(pk)
        if not comment:
            return Response({"error": "Comment not found."}, status=status.HTTP_404_NOT_FOUND)
        serializer = CommentSerializer(comment)
        return Response(serializer.data)

    def put(self, request, pk):
        comment = self.get_object(pk)
        if not comment:
            return Response({"error": "Comment not found."}, status=status.HTTP_404_NOT_FOUND)
        serializer = CommentSerializer(comment, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk):
        comment = self.get_object(pk)
        if not comment:
            return Response({"error": "Comment not found."}, status=status.HTTP_404_NOT_FOUND)
        comment.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
        