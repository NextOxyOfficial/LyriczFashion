from rest_framework import serializers
from .models import PromotionalBanner, SiteSettings


class PromotionalBannerSerializer(serializers.ModelSerializer):
    class Meta:
        model = PromotionalBanner
        fields = ['id', 'text', 'link', 'active', 'order']


class SiteSettingsSerializer(serializers.ModelSerializer):
    logo_url = serializers.SerializerMethodField()
    favicon_url = serializers.SerializerMethodField()
    og_image_absolute = serializers.SerializerMethodField()

    class Meta:
        model = SiteSettings
        fields = [
            'site_name',
            'logo', 'logo_url',
            'favicon', 'favicon_url',
            'hotline', 'email', 'address', 'business_hours',
            'facebook_url', 'instagram_url', 'twitter_url', 'youtube_url', 'tiktok_url',
            'meta_title', 'meta_description', 'meta_keywords',
            'og_title', 'og_description', 'og_image', 'og_image_url', 'og_image_absolute',
            'twitter_card_type', 'twitter_site_handle',
            'free_shipping_threshold', 'shipping_fee',
        ]

    def _build_absolute(self, request, file_field):
        if file_field and hasattr(file_field, 'url'):
            if request:
                return request.build_absolute_uri(file_field.url)
            return file_field.url
        return None

    def get_logo_url(self, obj):
        return self._build_absolute(self.context.get('request'), obj.logo)

    def get_favicon_url(self, obj):
        return self._build_absolute(self.context.get('request'), obj.favicon)

    def get_og_image_absolute(self, obj):
        if obj.og_image_url:
            return obj.og_image_url
        return self._build_absolute(self.context.get('request'), obj.og_image)
