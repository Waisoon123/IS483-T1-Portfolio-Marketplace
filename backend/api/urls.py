from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenRefreshView
from .views import UserViewSet, LoginView, GetUserIDFromToken, CompanyViewSet, InterestViewSet, SemanticSearchPortfolioCompanies
from .views import TechSectorViewSet, MainOfficeViewSet, EntityViewSet, FinanceStageViewSet

router = DefaultRouter()
router.register(r'users', UserViewSet, basename='user')
router.register(r'companies', CompanyViewSet, basename='company')
router.register(r'interests', InterestViewSet, basename='interests')
router.register(r'tech-sectors', TechSectorViewSet, basename='tech-sectors')
router.register(r'main-offices', MainOfficeViewSet, basename='main-offices')
router.register(r'entities', EntityViewSet, basename='entities')
router.register(r'finance-stages', FinanceStageViewSet, basename='finance-stages')

urlpatterns = [
    path('', include(router.urls), name='api'),
    path('login/', LoginView.as_view(), name='login'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('access/user-id', GetUserIDFromToken.as_view(), name='id_from_access_token'),
    path('semantic-search-portfolio-companies/', SemanticSearchPortfolioCompanies.as_view(),
         name='semantic_search_portfolio_companies'),
]
