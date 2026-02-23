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
    serializer = SiteSettingsSerializer(settings, context={'request': request})
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([AllowAny])
def site_info(request):
    """Get site name, description and logo for footer/header"""
    s = SiteSettings.load()
    logo_url = None
    if s.logo and hasattr(s.logo, 'url'):
        logo_url = request.build_absolute_uri(s.logo.url)
    return Response({
        'site_name': s.site_name,
        'site_description': s.meta_description or 'Design your style, wear your story. Create custom T-shirts with our easy-to-use design studio or shop from talented designers.',
        'logo_url': logo_url,
    })


@api_view(['GET'])
@permission_classes([AllowAny])
def meta_tags(request):
    """Get all SEO and social meta tag data for the frontend"""
    s = SiteSettings.load()
    site_url = request.build_absolute_uri('/').rstrip('/')

    def abs_url(field):
        if field and hasattr(field, 'url'):
            return request.build_absolute_uri(field.url)
        return None

    og_image = s.og_image_url or abs_url(s.og_image) or f"{site_url}/og-default.jpg"
    favicon = abs_url(s.favicon) or f"{site_url}/favicon.ico"
    logo = abs_url(s.logo)

    data = {
        'site_name': s.site_name,
        'logo_url': logo,
        'favicon_url': favicon,
        # SEO
        'meta_title': s.meta_title or s.site_name,
        'meta_description': s.meta_description or '',
        'meta_keywords': s.meta_keywords or '',
        # Open Graph
        'og_title': s.og_title or s.meta_title or s.site_name,
        'og_description': s.og_description or s.meta_description or '',
        'og_image': og_image,
        'og_url': site_url,
        'og_type': 'website',
        # Twitter Card
        'twitter_card': s.twitter_card_type,
        'twitter_site': s.twitter_site_handle or '',
        'twitter_title': s.og_title or s.meta_title or s.site_name,
        'twitter_description': s.og_description or s.meta_description or '',
        'twitter_image': og_image,
    }
    return Response(data)
