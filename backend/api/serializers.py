from rest_framework import serializers
from django.contrib.auth.hashers import check_password
from .models import User


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'email', 'password', 'first_name', 'last_name',
                  'company', 'interests', 'profile_pic', 'contact_number']
        extra_kwargs = {'password': {'write_only': True}}

    def create(self, validated_data):
        return User.objects.create_user(**validated_data)

    def update(self, instance, validated_data):
        password = validated_data.pop('password', None)

        # check if password is getting updated and if it is the same as the current one.
        if password and check_password(password, instance.password):
            password_error_dict = {'password': ['New password must be different from the current one.']}
            raise serializers.ValidationError(password_error_dict)
        else:
            user = super().update(instance, validated_data)
            if password:
                user.set_password(password)
                user.save()

            return user
