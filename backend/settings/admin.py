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
        ('🏷️ Branding & Logo', {
            'fields': ('site_name', 'logo', 'favicon'),
            'description': '📌 Upload your site logo and favicon. Logo: 200x50px PNG. Favicon: 32x32px ICO/PNG.',
        }),
        ('📞 Contact Information', {
            'fields': ('hotline', 'email', 'address', 'business_hours'),
            'description': '📌 Customer contact details displayed on the site.',
            'classes': ('collapse',),
        }),
        ('🔍 SEO Meta Tags (Google Search)', {
            'fields': ('meta_title', 'meta_description', 'meta_keywords'),
            'description': '📌 Controls how your site appears in Google search results. Title: max 70 chars | Description: max 160 chars.',
            'classes': ('collapse',),
        }),
        ('📣 Open Graph (Facebook/WhatsApp/LinkedIn Preview)', {
            'fields': ('og_title', 'og_description', 'og_image', 'og_image_url'),
            'description': '📌 When someone shares your link on social media, this controls the preview card. Image: 1200×630px recommended.',
            'classes': ('collapse',),
        }),
        ('🐦 Twitter/X Card', {
            'fields': ('twitter_card_type', 'twitter_site_handle'),
            'description': '📌 Controls Twitter/X link preview.',
            'classes': ('collapse',),
        }),
        ('📱 Social Media Links', {
            'fields': ('facebook_url', 'instagram_url', 'twitter_url', 'youtube_url', 'tiktok_url'),
            'description': '📌 Add your social media profile URLs.',
            'classes': ('collapse',),
        }),
        ('🚚 Shipping Settings', {
            'fields': ('free_shipping_threshold', 'shipping_fee'),
            'description': '📌 Configure shipping costs (in BDT).',
            'classes': ('collapse',),
        }),
    )

    def has_add_permission(self, request):
        return not SiteSettings.objects.exists()

    def has_delete_permission(self, request, obj=None):
        return False
