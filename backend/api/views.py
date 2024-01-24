from django.db import DatabaseError, IntegrityError
from rest_framework import viewsets
from rest_framework.views import APIView
from .models import User
from .serializers import UserSerializer
from rest_framework import status
from rest_framework.response import Response
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_protect
from django.middleware.csrf import get_token


@method_decorator(csrf_protect, name='dispatch')
class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.filter(is_active=True)
    serializer_class = UserSerializer

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


class CSRFToken(APIView):
    def get(self, request, format=None):
        return Response({'csrfToken': get_token(request)})
