from rest_framework import serializers
from .models import User

class UserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=False)
    confirm_password = serializers.CharField(write_only=True, required=False)

    class Meta:
        model = User
        fields = ['id', 'username', 'firstname', 'lastname', 'email', 'password', 'confirm_password', 'profile_image', 'created_by', 'created_at', 'is_staff', 'is_superuser']
        extra_kwargs = {
            'created_by': {'read_only': True},
            'is_staff': {'read_only': True},
            'is_superuser': {'read_only': True},
        }

    def validate(self, data):
        # Validate password and confirm_password match
        if 'password' in data or 'confirm_password' in data:
            if data.get('password') != data.get('confirm_password'):
                raise serializers.ValidationError({"confirm_password": "Passwords do not match."})
            if not data.get('password'):  # Ensure password isn't empty if provided
                raise serializers.ValidationError({"password": "Password cannot be empty."})
        return data

    def create(self, validated_data):
        validated_data.pop('confirm_password', None)
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password'],
            firstname=validated_data['firstname'],
            lastname=validated_data['lastname'],
            is_staff=False
        )
        request = self.context.get('request')
        if request and hasattr(request, 'user'):
            user.created_by = request.user
            user.save()
        return user

    def update(self, instance, validated_data):
        validated_data.pop('confirm_password', None)
        instance.firstname = validated_data.get('firstname', instance.firstname)
        instance.lastname = validated_data.get('lastname', instance.lastname)
        instance.email = validated_data.get('email', instance.email)
        instance.username = validated_data.get('username', instance.username)
        if 'profile_image' in validated_data:
            instance.profile_image = validated_data['profile_image']
        if 'password' in validated_data:
            instance.set_password(validated_data['password'])
        instance.save()
        return instance
    
    