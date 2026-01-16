from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views
from . import mockup_views

router = DefaultRouter()
router.register(r'categories', views.CategoryViewSet)
router.register(r'products', views.ProductViewSet, basename='products')
router.register(r'custom-products', views.CustomProductViewSet, basename='custom-products')
router.register(r'guest-custom-products', views.GuestCustomProductViewSet, basename='guest-custom-products')
router.register(r'stores', views.StoreViewSet, basename='store')
router.register(r'seller-products', views.SellerProductViewSet, basename='seller-products')
router.register(r'design-library', views.DesignLibraryItemViewSet, basename='design-library')
router.register(r'design-categories', views.DesignCategoryViewSet, basename='design-category')
router.register(r'design-commissions', views.DesignCommissionViewSet, basename='design-commissions')
router.register(r'orders', views.OrderViewSet, basename='order')
router.register(r'mockup-types', mockup_views.MockupTypeViewSet, basename='mockup-types')
router.register(r'mockup-variants', mockup_views.MockupVariantViewSet, basename='mockup-variants')

urlpatterns = [
    path('auth/register', views.register, name='register'),
    path('auth/login', views.login, name='login'),
    path('auth/me', views.get_current_user, name='current-user'),
    path('seller/become', views.become_seller, name='become-seller'),
    path('feed', views.feed, name='feed'),
    path('', include(router.urls)),
]
