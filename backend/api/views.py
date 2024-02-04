from django.db import DatabaseError, IntegrityError
from rest_framework import viewsets
from rest_framework.views import APIView
from .models import User
from .serializers import UserSerializer
from rest_framework import status
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, BasePermission, IsAuthenticated
from django.contrib.auth import authenticate
from rest_framework_simplejwt.tokens import RefreshToken, UntypedToken
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_protect
from django.middleware.csrf import get_token


class IsUser(BasePermission):
    # Custom permission to only allow users to view and edit their own profile.
    def has_object_permission(self, request, view, obj):
        return obj.id == request.user.id

# @method_decorator(csrf_protect, name='dispatch')


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
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        try:
            serializer.save()  # This will call the create method in the serializers.py file
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        except IntegrityError as e:
            return Response({"detail": str(e)}, status=status.HTTP_400_BAD_REQUEST)
        except ValueError as e:
            return Response({"detail": str(e)}, status=status.HTTP_400_BAD_REQUEST)
        except DatabaseError as e:
            return Response({"detail": str(e)}, status=status.HTTP_400_BAD_REQUEST)


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
