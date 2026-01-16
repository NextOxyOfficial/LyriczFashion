from rest_framework import serializers
from .mockup_models import MockupType, MockupVariant


class MockupVariantSerializer(serializers.ModelSerializer):
    effective_price = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)
    mockup_type_name = serializers.CharField(source='mockup_type.name', read_only=True)
    mockup_type_slug = serializers.CharField(source='mockup_type.slug', read_only=True)
    front_image = serializers.SerializerMethodField()
    back_image = serializers.SerializerMethodField()
    thumbnail = serializers.SerializerMethodField()
    
    class Meta:
        model = MockupVariant
        fields = [
            'id',
            'mockup_type',
            'mockup_type_name',
            'mockup_type_slug',
            'color_name',
            'color_hex',
            'front_image',
            'back_image',
            'thumbnail',
            'price_modifier',
            'effective_price',
            'is_active',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['created_at', 'updated_at']
    
    def get_front_image(self, obj):
        if obj.front_image:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.front_image.url)
            return obj.front_image.url
        return None
    
    def get_back_image(self, obj):
        if obj.back_image:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.back_image.url)
            return obj.back_image.url
        return None
    
    def get_thumbnail(self, obj):
        if obj.thumbnail:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.thumbnail.url)
            return obj.thumbnail.url
        return None


class MockupTypeSerializer(serializers.ModelSerializer):
    variants = MockupVariantSerializer(many=True, read_only=True)
    variant_count = serializers.SerializerMethodField()
    preview_image = serializers.SerializerMethodField()
    
    class Meta:
        model = MockupType
        fields = [
            'id',
            'name',
            'slug',
            'base_price',
            'description',
            'preview_image',
            'is_active',
            'variants',
            'variant_count',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['created_at', 'updated_at']
    
    def get_variant_count(self, obj):
        return obj.variants.filter(is_active=True).count()
    
    def get_preview_image(self, obj):
        if obj.preview_image:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.preview_image.url)
            return obj.preview_image.url
        return None


class MockupTypeListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for listing mockup types without variants"""
    variant_count = serializers.SerializerMethodField()
    preview_image = serializers.SerializerMethodField()
    
    class Meta:
        model = MockupType
        fields = [
            'id',
            'name',
            'slug',
            'base_price',
            'description',
            'preview_image',
            'is_active',
            'variant_count',
        ]
    
    def get_variant_count(self, obj):
        return obj.variants.filter(is_active=True).count()
    
    def get_preview_image(self, obj):
        if obj.preview_image:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.preview_image.url)
            return obj.preview_image.url
        return None
