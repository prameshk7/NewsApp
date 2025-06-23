from rest_framework import serializers
from .models import User

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'firstname', 'lastname', 'email', 'password', 'profile_image', 'created_by', 'created_at', 'is_staff', 'is_superuser']
        extra_kwargs = {
            'password': {'write_only': True},
            'created_by': {'read_only': True},
            'is_staff': {'read_only': True},  # Controlled by view/admin
            'is_superuser': {'read_only': True},
        }

    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password'],
            firstname=validated_data['firstname'],
            lastname=validated_data['lastname'],
            is_staff=False  # Ensure normal users
        )
        request = self.context.get('request')
        if request and hasattr(request, 'user'):
            user.created_by = request.user
            user.save()
        return user

    def update(self, instance, validated_data):
        instance.firstname = validated_data.get('firstname', instance.firstname)
        instance.lastname = validated_data.get('lastname', instance.lastname)
        instance.email = validated_data.get('email', instance.email)
        if 'profile_image' in validated_data:
            instance.profile_image = validated_data['profile_image']
        if 'password' in validated_data:
            instance.set_password(validated_data['password'])
        instance.save()
        return instance
    
    