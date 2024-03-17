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
        user = User.objects.create_user(**validated_data)

        # Add interests to the user
        for interest_data in interests_data:
            name = dict(interest_data)['name']
            interest = Interest.objects.get(name=name)
            user.interests.add(interest)
        return user

    def update(self, instance, validated_data):
        password = validated_data.pop('password', None)

        if password:
            # Check if the new password is the same as the current one
            if check_password(password, instance.password):
                raise serializers.ValidationError(
                    {'password': ['New password must be different from the current one.']})

            # Validate the new password
            try:
                validate_password(password)
            except ValidationError as e:
                raise serializers.ValidationError({'password': list(e.messages)})

            instance.set_password(password)
            user = super().update(instance, validated_data)
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
        fields = ['id', 'hq_name']
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
    tech_sector = serializers.SlugRelatedField(
        slug_field='sector_name',
        queryset=TechSector.objects.all(),
        many=True
    )
    vertex_entity = serializers.SlugRelatedField(
        slug_field='entity_name',
        queryset=Entity.objects.all(),
        many=True
    )

    hq_main_office = serializers.SlugRelatedField(slug_field='hq_name', queryset=MainOffice.objects.all())
    finance_stage = serializers.SlugRelatedField(slug_field='stage_name', queryset=FinanceStage.objects.all())
    # tech_sector = serializers.PrimaryKeyRelatedField(
    #     queryset=TechSector.objects.all(),
    #     many=True,
    #     required=False  # This will make the field optional in the serializer
    # )

    # # This will return the names of the tech sectors instead of their IDs.
    # tech_sector = serializers.StringRelatedField(many=True)

    # vertex_entity = serializers.PrimaryKeyRelatedField(
    #     queryset=Entity.objects.all(),
    #     many=True  # Since you have a custom validation method, no need for required=True
    # )

    # # This will return the names of the vertex entities instead of their IDs.
    # vertex_entity = serializers.StringRelatedField(many=True)

    # hq_main_office = serializers.PrimaryKeyRelatedField(
    #     queryset=MainOffice.objects.all()
    # )
    # # This will return the names of the main offices instead of their IDs.
    # hq_main_office = serializers.StringRelatedField()

    # finance_stage = serializers.PrimaryKeyRelatedField(
    #     queryset=FinanceStage.objects.all()
    # )
    # # This will return the names of the finance stage instead of their IDs.
    # finance_stage = serializers.StringRelatedField()

    def validate_company(self, value):
        # If creating a new company, ensure the name is unique
        if not self.instance and Company.objects.filter(company__iexact=value).exists():
            raise serializers.ValidationError("A company with this name already exists.")
        # If updating an existing company, ensure the new name is unique
        elif self.instance and Company.objects.filter(company__iexact=value).exclude(pk=self.instance.pk).exists():
            raise serializers.ValidationError("A company with this name already exists.")
        return value

    def validate_vertex_entity(self, value):
        # Since it's no longer read_only, `value` is the list of validated data from the request
        if not value:
            raise serializers.ValidationError("This field is required.")
        return value

    class Meta:
        model = Company
        fields = ['id', 'company', 'description', 'tech_sector', 'hq_main_office',
                  'vertex_entity', 'finance_stage', 'status', 'website']


class CompanySerializerForModelTraining(serializers.ModelSerializer):
    # This will return the names of the tech sectors instead of their IDs.
    tech_sector = serializers.StringRelatedField(many=True)

    class Meta:
        model = Company
        fields = ('company', 'description', 'tech_sector')
