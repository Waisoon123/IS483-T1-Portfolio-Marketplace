from rest_framework import viewsets, serializers
from rest_framework.views import APIView
from .models import User, Company, Interest
from .models import TechSector, MainOffice, Entity, FinanceStage
from .serializers import UserSerializer, CompanySerializer, InterestSerializer
from .serializers import TechSectorSerializer, MainOfficeSerializer, EntitySerializer, FinanceStageSerializer
from rest_framework import status
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, BasePermission, IsAuthenticated
from django.contrib.auth import authenticate
from rest_framework_simplejwt.tokens import RefreshToken, UntypedToken
from rest_framework.pagination import PageNumberPagination
from django.db import transaction
from rest_framework.exceptions import ValidationError
from api.semantic_search.semantic_search import search_model
import json
from django.http import QueryDict

from django.db.models import Q


class IsUser(BasePermission):
    # Custom permission to only allow users to view and edit their own profile.
    def has_object_permission(self, request, view, obj):
        return obj.id == request.user.id

# Custom pagination class


class CustomPagination(PageNumberPagination):
    page_size = 6  # Set the number of items per page


class CompanyViewSet(viewsets.ModelViewSet):
    queryset = Company.objects.all()
    serializer_class = CompanySerializer
    pagination_class = CustomPagination  # Use your custom pagination class

    # filter companies by tech sectors and main offices
    def get_queryset(self):
        queryset = super().get_queryset()
        tech_sectors = self.request.query_params.getlist('tech_sectors')
        hq_main_offices = self.request.query_params.getlist('hq_main_offices')

        if tech_sectors:
            queryset = queryset.filter(tech_sector__id__in=tech_sectors).distinct()

        if hq_main_offices:
            queryset = queryset.filter(hq_main_office__id__in=hq_main_offices).distinct()

        return queryset

# ViewSet for TechSector


class TechSectorViewSet(viewsets.ModelViewSet):
    queryset = TechSector.objects.all()
    serializer_class = TechSectorSerializer
    pagination_class = CustomPagination

# ViewSet for MainOffice


class MainOfficeViewSet(viewsets.ModelViewSet):
    queryset = MainOffice.objects.all()
    serializer_class = MainOfficeSerializer
    pagination_class = CustomPagination

# ViewSet for Entity


class EntityViewSet(viewsets.ModelViewSet):
    queryset = Entity.objects.all()
    serializer_class = EntitySerializer
    pagination_class = CustomPagination

# ViewSet for FinanceStage


class FinanceStageViewSet(viewsets.ModelViewSet):
    queryset = FinanceStage.objects.all()
    serializer_class = FinanceStageSerializer
    pagination_class = CustomPagination


class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.filter(is_active=True)
    serializer_class = UserSerializer

    # Allow any user to create an account but check if the user is authenticated for other actions
    def get_permissions(self):
        if self.action == 'create':
            permission_classes = [AllowAny]
        else:
            permission_classes = [IsAuthenticated]
            permission_classes.append(IsUser)
        return [permission() for permission in permission_classes]

    def create(self, request, *args, **kwargs):
        interests_object_list = []

        # Expected input example: 'interests': '[1, 2, 3]'
        interests_id_list = json.loads(request.data['interests'])
        if not interests_id_list:
            return Response({"interests": ["This field may not be blank."]}, status=status.HTTP_400_BAD_REQUEST)
        else:
            for interest_id in interests_id_list:
                interest = Interest.objects.get(id=interest_id)
                interest_object = {"id": interest.id, "name": interest.name}
                interests_object_list.append(interest_object)

            data = request.data.dict()
            data['interests'] = (interests_object_list)
            serializer = self.get_serializer(data=data)
            serializer.is_valid(raise_exception=True)
            try:
                with transaction.atomic():
                    user = serializer.save()  # This will call the create method in the serializers.py file
                    serialized_user = UserSerializer(user, context=self.get_serializer_context()).data
                    return Response(serialized_user, status=status.HTTP_201_CREATED)
            except Exception as e:
                return Response({"detail": str(e)}, status=status.HTTP_400_BAD_REQUEST)

    def partial_update(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)

        # Expected input example: 'interests': '[1, 2, 3]'
        interests_id_list = json.loads(request.data['interests'])
        if not interests_id_list:
            return Response({"interests": ["This field may not be blank."]}, status=status.HTTP_400_BAD_REQUEST)
        else:
            existing_interests = Interest.objects.filter(id__in=interests_id_list)

        if len(existing_interests) != len(interests_id_list):
            return Response({"interests": ["One or more interests do not exist."]}, status=status.HTTP_400_BAD_REQUEST)

        instance.interests.set(existing_interests)
        try:
            with transaction.atomic():
                updated_instance = serializer.save()  # Update the user instance with the new data
                serialized_instance = UserSerializer(updated_instance, context=self.get_serializer_context()).data
                return Response(serialized_instance, status=status.HTTP_200_OK)  # Return the serialized updated user data
        except serializers.ValidationError as e:
            return Response(e.detail, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({"detail": str(e)}, status=status.HTTP_400_BAD_REQUEST)

class InterestViewSet(viewsets.ModelViewSet):
    queryset = Interest.objects.all()
    serializer_class = InterestSerializer


class GetInterestIDFromName(APIView):
    def get(self, request):
        interest_name = request.query_params.get('name')
        if not interest_name:
            return Response({'error': 'Interest name not provided'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            interest = Interest.objects.get(name=interest_name)
            return Response({'id': interest.id}, status=status.HTTP_200_OK)
        except Interest.DoesNotExist:
            return Response({'error': 'Interest not found'}, status=status.HTTP_404_NOT_FOUND)


class LoginView(APIView):
    '''
        The LoginView class is used to authenticate a user and return a JWT token pair.
        Expected input:
        'body': {
            "email": ""
            "password": ""
        }
    '''
    permission_classes = (AllowAny, )

    def post(self, request, *args, **kwargs):
        email = request.data.get('email')
        password = request.data.get('password')
        if email is None or password is None:
            return Response({'detail': 'Please provide both email and password'}, status=status.HTTP_400_BAD_REQUEST)
        try:
            user = authenticate(email=email, password=password)

            if not user:
                return Response({'detail': 'Invalid Credentials'}, status=status.HTTP_404_NOT_FOUND)

            refresh = RefreshToken.for_user(user)
            access = refresh.access_token
            untyped_token = UntypedToken(str(access))
            user_id = untyped_token['user_id']

            return Response({
                'refresh': str(refresh),
                'access': str(access),
                'user_id': user_id
            }, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({'detail': str(e)}, status=status.HTTP_400_BAD_REQUEST)


class GetUserIDFromToken(APIView):
    '''
        The GetUserIDFromToken class is used to get the user_id from a JWT token.
        Expected input:
        'headers': { 
            'Authorization': <access_token> 
        }
    '''

    def get(self, request, format=None):
        access_token = request.headers.get('Authorization')
        untyped_token = UntypedToken(access_token)
        user_id = untyped_token['user_id']
        return Response({'user_id': user_id})


class SemanticSearchPortfolioCompanies(APIView):
    def get(self, request, format=None):
        query = request.query_params.get('query')
        if query is None or query == "":
            return Response({'detail': 'Please provide a query'}, status=status.HTTP_400_BAD_REQUEST)
        try:
            result_list = search_model(query)
            response = {"company": result_list}
            return Response(response, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({'detail': str(e)}, status=status.HTTP_400_BAD_REQUEST)
