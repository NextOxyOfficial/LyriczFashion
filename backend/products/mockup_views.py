from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAdminUser
from rest_framework.parsers import MultiPartParser, FormParser
from .mockup_models import MockupType, MockupVariant
from .mockup_serializers import (
    MockupTypeSerializer,
    MockupTypeListSerializer,
    MockupVariantSerializer
)


class MockupTypeViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing mockup types (T-Shirt, Hoodie, etc.)
    Public can list and retrieve, only admins can create/update/delete
    """
    queryset = MockupType.objects.filter(is_active=True)
    permission_classes = [AllowAny]
    lookup_field = 'slug'

    def get_serializer_class(self):
        if self.action == 'list':
            return MockupTypeListSerializer
        return MockupTypeSerializer

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [IsAdminUser()]
        return [AllowAny()]

    @action(detail=True, methods=['get'])
    def variants(self, request, slug=None):
        """Get all variants for a specific mockup type"""
        mockup_type = self.get_object()
        variants = mockup_type.variants.filter(is_active=True)
        serializer = MockupVariantSerializer(variants, many=True)
        return Response(serializer.data)


class MockupVariantViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing mockup variants (specific colors with front/back images)
    Public can list and retrieve, only admins can create/update/delete
    """
    queryset = MockupVariant.objects.filter(is_active=True).select_related('mockup_type')
    serializer_class = MockupVariantSerializer
    permission_classes = [AllowAny]
    parser_classes = [MultiPartParser, FormParser]

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [IsAdminUser()]
        return [AllowAny()]

    def get_queryset(self):
        queryset = super().get_queryset()
        
        # Filter by mockup type
        mockup_type = self.request.query_params.get('mockup_type')
        if mockup_type:
            queryset = queryset.filter(mockup_type__slug=mockup_type)
        
        # Filter by color
        color = self.request.query_params.get('color')
        if color:
            queryset = queryset.filter(color_name__iexact=color)
        
        return queryset

    @action(detail=False, methods=['get'])
    def colors(self, request):
        """Get all available colors across all mockup types"""
        colors = MockupVariant.objects.filter(is_active=True).values(
            'color_name', 'color_hex'
        ).distinct().order_by('color_name')
        return Response(colors)
