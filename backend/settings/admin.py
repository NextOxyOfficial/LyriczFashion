from django.contrib import admin
from .models import PromotionalBanner, SiteSettings


@admin.register(PromotionalBanner)
class PromotionalBannerAdmin(admin.ModelAdmin):
    list_display = ['text_preview', 'link', 'active', 'order', 'created_at']
    list_filter = ['active', 'created_at']
    search_fields = ['text', 'link']
    list_editable = ['active', 'order']
    ordering = ['order', '-created_at']
    
    fieldsets = (
        ('Banner Content', {
            'fields': ('text', 'link')
        }),
        ('Display Settings', {
            'fields': ('active', 'order')
        }),
    )
    
    def text_preview(self, obj):
        """Show truncated text in list view"""
        return f"{obj.text[:60]}{'...' if len(obj.text) > 60 else ''}"
    text_preview.short_description = 'Banner Text'


@admin.register(SiteSettings)
class SiteSettingsAdmin(admin.ModelAdmin):
    fieldsets = (
        ('Contact Information', {
            'fields': ('hotline', 'email', 'address'),
            'description': 'Customer contact details displayed on the site'
        }),
        ('Social Media', {
            'fields': ('facebook_url', 'instagram_url', 'twitter_url'),
            'classes': ('collapse',),
        }),
        ('Business Information', {
            'fields': ('business_hours',),
            'classes': ('collapse',),
        }),
        ('Shipping Settings', {
            'fields': ('free_shipping_threshold', 'shipping_fee'),
            'description': 'Configure shipping costs and free shipping threshold'
        }),
    )
    
    def has_add_permission(self, request):
        # Only allow one instance
        return not SiteSettings.objects.exists()
    
    def has_delete_permission(self, request, obj=None):
        # Prevent deletion
        return False
