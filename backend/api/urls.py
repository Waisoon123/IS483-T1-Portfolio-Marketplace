from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import UserViewSet, CSRFToken

router = DefaultRouter()
router.register(r'users', UserViewSet)

urlpatterns = [
    path('', include(router.urls), name='api'),
    path('csrf_token/', CSRFToken.as_view(), name='csrf'),
]
