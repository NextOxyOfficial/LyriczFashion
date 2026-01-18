from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from .models import PromotionalBanner, SiteSettings
from .serializers import PromotionalBannerSerializer, SiteSettingsSerializer


@api_view(['GET'])
@permission_classes([AllowAny])
def promotional_banners(request):
    """Get all active promotional banners"""
    banners = PromotionalBanner.objects.filter(active=True)
    serializer = PromotionalBannerSerializer(banners, many=True)
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([AllowAny])
def contact_info(request):
    """Get site contact information and settings"""
    settings = SiteSettings.load()
    serializer = SiteSettingsSerializer(settings)
    return Response(serializer.data)
