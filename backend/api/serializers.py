from rest_framework import serializers
from django.contrib.auth.hashers import check_password
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError
from .models import User, Company, Interest
from .models import TechSector, MainOffice, Entity, FinanceStage

class InterestSerializer(serializers.ModelSerializer):
    class Meta:
        model = Interest
        fields = ['id', 'name']


class UserSerializer(serializers.ModelSerializer):
    interests = InterestSerializer(many=True)
    class Meta:
        model = User
        fields = ['id', 'email', 'password', 'first_name', 'last_name',
                  'company', 'interests', 'profile_pic', 'contact_number']
        extra_kwargs = {'password': {'write_only': True}}

    def create(self, validated_data):
        interests_data = validated_data.pop('interests', [])
        user =  User.objects.create_user(**validated_data)

        for interest_data in interests_data:
            interest_id = interest_data.get('id')
            interest = Interest.objects.get(id=interest_id)
            user.interests.add(interest)
        return user

    def update(self, instance, validated_data):
        password = validated_data.pop('password', None)

        # check if password is getting updated and if it is the same as the current one.
        if password and check_password(password, instance.password):
            password_error_dict = {'password': ['New password must be different from the current one.']}
            raise serializers.ValidationError(password_error_dict)
        else:
            # Validate the password before updating.
            if password:
                try:
                    validate_password(password)
                except ValidationError as e:
                    raise ValueError(str(e))

            user = super().update(instance, validated_data)

        if password:
            user.set_password(password)
            user.save()
        
        return user
        
# Serializer for TechSector
class TechSectorSerializer(serializers.ModelSerializer):
    class Meta:
        model = TechSector
        fields = ['id', 'sector_name']
        # fields = ['sector_name']

# Serializer for MainOffice
class MainOfficeSerializer(serializers.ModelSerializer):
    class Meta:
        model = MainOffice
        fields = ['id' ,'hq_name']
        # fields = ['hq_name']


# Serializer for Entity
class EntitySerializer(serializers.ModelSerializer):
    class Meta:
        model = Entity
        fields = ['id', 'entity_name']
        # fields = ['entity_name']

# Serializer for FinanceStage
class FinanceStageSerializer(serializers.ModelSerializer):
    class Meta:
        model = FinanceStage
        fields = ['id', 'stage_name']
        # fields = ['stage_name']
        
class CompanySerializer(serializers.ModelSerializer):
    tech_sector = TechSectorSerializer(many=True, read_only=True)
    vertex_entity = EntitySerializer(many=True, read_only=True)
    class Meta:
        model = Company
        fields = ['id', 'company', 'description', 'tech_sector', 'hq_main_office', 'vertex_entity', 'finance_stage', 'status', 'website']
