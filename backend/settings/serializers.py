from rest_framework import serializers
from .models import PromotionalBanner, SiteSettings


class PromotionalBannerSerializer(serializers.ModelSerializer):
    class Meta:
        model = PromotionalBanner
        fields = ['id', 'text', 'link', 'active', 'order']


class SiteSettingsSerializer(serializers.ModelSerializer):
    class Meta:
        model = SiteSettings
        fields = [
            'site_name',
            'logo',
            'favicon',
            'hotline',
            'email',
            'address',
            'facebook_url',
            'instagram_url',
            'twitter_url',
            'business_hours',
            'free_shipping_threshold',
            'shipping_fee',
        ]
