from django.contrib import admin
from django.utils.safestring import mark_safe
from urllib.parse import quote
from .models import Category, SellerProfile, Store, Product, Order, OrderItem, DesignLibraryItem, DesignCommission
from .mockup_models import MockupType, MockupVariant


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ['name', 'created_at']
    search_fields = ['name']


@admin.register(SellerProfile)
class SellerProfileAdmin(admin.ModelAdmin):
    list_display = ['user', 'status', 'is_seller', 'phone', 'created_at']
    list_filter = ['status', 'is_seller', 'created_at']
    list_editable = ['status']
    search_fields = ['user__username', 'user__email', 'phone']


@admin.register(DesignLibraryItem)
class DesignLibraryItemAdmin(admin.ModelAdmin):
    list_display = ['id', 'name', 'owner', 'commission_per_use', 'is_active', 'created_at']
    list_filter = ['is_active', 'created_at']
    search_fields = ['name', 'owner__username', 'owner__email']


@admin.register(DesignCommission)
class DesignCommissionAdmin(admin.ModelAdmin):
    list_display = ['id', 'design', 'owner', 'used_by', 'amount', 'quantity', 'status', 'created_at']
    list_filter = ['status', 'created_at']
    search_fields = ['owner__username', 'owner__email', 'used_by__username', 'used_by__email', 'design__name']


@admin.register(Store)
class StoreAdmin(admin.ModelAdmin):
    list_display = ['name', 'owner', 'slug', 'is_active', 'created_at']
    list_filter = ['is_active', 'created_at']
    search_fields = ['name', 'slug', 'owner__username', 'owner__email']


@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ['name', 'store', 'category', 'kind', 'is_published', 'buy_price', 'price', 'discount_price', 'stock', 'is_active', 'created_at']
    list_filter = ['kind', 'is_published', 'category', 'store', 'is_active', 'created_at']
    search_fields = ['name', 'description']
    list_editable = ['is_published', 'buy_price', 'price', 'discount_price', 'stock', 'is_active']
    
    def get_queryset(self, request):
        qs = super().get_queryset(request)
        # Show all products in admin
        return qs
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('name', 'description', 'category', 'kind', 'store', 'created_by')
        }),
        ('Pricing & Stock', {
            'fields': ('buy_price', 'price', 'discount_price', 'stock')
        }),
        ('Design/Images', {
            'fields': ('image', 'image_url', 'design_logo', 'design_preview', 'design_data'),
            'description': 'For Design Library: Upload design_logo. For regular products: Upload image or provide image_url.'
        }),
        ('Status', {
            'fields': ('is_published', 'is_active')
        }),
    )
    
    class Media:
        css = {
            'all': ('admin/css/custom_admin.css',)
        }


class OrderItemInline(admin.TabularInline):
    model = OrderItem
    extra = 0
    readonly_fields = ['product', 'quantity', 'price', 'total_price', 'design_files_display']
    fields = ['product', 'quantity', 'price', 'total_price', 'design_files_display']
    
    def design_files_display(self, obj):
        """Display design files with download links"""
        if not obj.product:
            return '-'
        
        html_parts = []

        logo_front = getattr(obj.product, 'design_logo_front', None) or None
        logo_back = getattr(obj.product, 'design_logo_back', None) or None
        preview_front = getattr(obj.product, 'design_preview_front', None) or None
        preview_back = getattr(obj.product, 'design_preview_back', None) or None

        if not logo_front and not logo_back and obj.product.design_logo:
            logo_front = obj.product.design_logo
        if not preview_front and not preview_back and obj.product.design_preview:
            preview_front = obj.product.design_preview

        if logo_front:
            url = logo_front.url
            html_parts.append(
                f'<div style="margin-bottom: 10px; padding: 10px; background: #ECFDF5; border-left: 4px solid #10B981; border-radius: 6px;">'
                f'<strong style="color: #065F46; font-size: 13px;">FRONT LOGO (PNG)</strong><br>'
                f'<a href="{url}" target="_blank" download style="color: #10B981; text-decoration: none; font-weight: 700; margin-top: 6px; display: inline-block; padding: 6px 10px; background: white; border-radius: 4px; border: 2px solid #10B981;">'
                f'📥 Download'
                f'</a> '
                f'<a href="{url}" target="_blank" style="color: #3B82F6; text-decoration: none; margin-left: 8px; padding: 6px 10px; background: white; border-radius: 4px; border: 2px solid #3B82F6;">'
                f'👁️ View'
                f'</a>'
                f'</div>'
            )

        if logo_back:
            url = logo_back.url
            html_parts.append(
                f'<div style="margin-bottom: 10px; padding: 10px; background: #FEF2F2; border-left: 4px solid #EF4444; border-radius: 6px;">'
                f'<strong style="color: #991B1B; font-size: 13px;">BACK LOGO (PNG)</strong><br>'
                f'<a href="{url}" target="_blank" download style="color: #EF4444; text-decoration: none; font-weight: 700; margin-top: 6px; display: inline-block; padding: 6px 10px; background: white; border-radius: 4px; border: 2px solid #EF4444;">'
                f'📥 Download'
                f'</a> '
                f'<a href="{url}" target="_blank" style="color: #3B82F6; text-decoration: none; margin-left: 8px; padding: 6px 10px; background: white; border-radius: 4px; border: 2px solid #3B82F6;">'
                f'👁️ View'
                f'</a>'
                f'</div>'
            )

        if preview_front:
            url = preview_front.url
            html_parts.append(
                f'<div style="margin-bottom: 10px; padding: 10px; background: #EFF6FF; border-left: 4px solid #3B82F6; border-radius: 6px;">'
                f'<strong style="color: #1E40AF; font-size: 13px;">FRONT PREVIEW (Reference)</strong><br>'
                f'<a href="{url}" target="_blank" download style="color: #3B82F6; text-decoration: none; font-weight: 700; margin-top: 6px; display: inline-block; padding: 6px 10px; background: white; border-radius: 4px; border: 2px solid #3B82F6;">'
                f'📥 Download'
                f'</a> '
                f'<a href="{url}" target="_blank" style="color: #10B981; text-decoration: none; margin-left: 8px; padding: 6px 10px; background: white; border-radius: 4px; border: 2px solid #10B981;">'
                f'👁️ View'
                f'</a>'
                f'</div>'
            )

        if preview_back:
            url = preview_back.url
            html_parts.append(
                f'<div style="margin-bottom: 10px; padding: 10px; background: #EEF2FF; border-left: 4px solid #6366F1; border-radius: 6px;">'
                f'<strong style="color: #3730A3; font-size: 13px;">BACK PREVIEW (Reference)</strong><br>'
                f'<a href="{url}" target="_blank" download style="color: #6366F1; text-decoration: none; font-weight: 700; margin-top: 6px; display: inline-block; padding: 6px 10px; background: white; border-radius: 4px; border: 2px solid #6366F1;">'
                f'📥 Download'
                f'</a> '
                f'<a href="{url}" target="_blank" style="color: #10B981; text-decoration: none; margin-left: 8px; padding: 6px 10px; background: white; border-radius: 4px; border: 2px solid #10B981;">'
                f'👁️ View'
                f'</a>'
                f'</div>'
            )
        
        # Design Data (JSON) - Enhanced with front/back info
        if obj.product.design_data:
            design_data = obj.product.design_data
            mockup_info = f"{design_data.get('mockupType', 'N/A')}"
            variant_info = design_data.get('variant', {})
            size = variant_info.get('size', 'N/A')
            color = variant_info.get('color', 'N/A')
            
            html_parts.append(
                f'<div style="margin-top: 8px; padding: 10px; background: #F3F4F6; border-radius: 4px;">'
                f'<strong>📋 Product Details:</strong><br>'
                f'<strong>Mockup:</strong> {mockup_info}<br>'
                f'<strong>Size:</strong> {size} | <strong>Color:</strong> {color}'
            )
            
            # Check for front/back side information
            sides = design_data.get('sides', {})
            if sides:
                front = sides.get('front', {})
                back = sides.get('back', {})
                
                html_parts.append('<br><br><strong>🎨 Design Sides:</strong>')
                
                # Front side
                if front.get('hasLogo') or front.get('hasText'):
                    html_parts.append('<br><span style="color: #10B981; font-weight: 600;">✓ FRONT:</span> ')
                    parts = []
                    if front.get('hasLogo'):
                        parts.append('Logo')
                    if front.get('hasText'):
                        text = front.get('text', '')[:30]
                        parts.append(f'Text: "{text}"')
                    html_parts.append(' + '.join(parts))
                else:
                    html_parts.append('<br><span style="color: #9CA3AF;">○ FRONT: Empty</span>')
                
                # Back side
                if back.get('hasLogo') or back.get('hasText'):
                    html_parts.append('<br><span style="color: #EF4444; font-weight: 600;">✓ BACK:</span> ')
                    parts = []
                    if back.get('hasLogo'):
                        parts.append('Logo')
                    if back.get('hasText'):
                        text = back.get('text', '')[:30]
                        parts.append(f'Text: "{text}"')
                    html_parts.append(' + '.join(parts))
                else:
                    html_parts.append('<br><span style="color: #9CA3AF;">○ BACK: Empty</span>')

                front_text = (front.get('text') or '').strip()
                back_text = (back.get('text') or '').strip()

                if front_text:
                    href = f"data:text/plain;charset=utf-8,{quote(front_text)}"
                    html_parts.append(
                        f'<br><a href="{href}" download="front_text.txt" style="display:inline-block;margin-top:10px;color:#10B981;text-decoration:none;font-weight:700;padding:6px 10px;background:white;border-radius:4px;border:2px solid #10B981;">'
                        f'📥 Download FRONT Text (.txt)'
                        f'</a>'
                    )

                if back_text:
                    href = f"data:text/plain;charset=utf-8,{quote(back_text)}"
                    html_parts.append(
                        f'<br><a href="{href}" download="back_text.txt" style="display:inline-block;margin-top:10px;color:#EF4444;text-decoration:none;font-weight:700;padding:6px 10px;background:white;border-radius:4px;border:2px solid #EF4444;">'
                        f'📥 Download BACK Text (.txt)'
                        f'</a>'
                    )
            
            html_parts.append('</div>')
        
        if not html_parts:
            return mark_safe('<span style="color: #9CA3AF;">No design files</span>')
        
        return mark_safe(''.join(html_parts))
    
    design_files_display.short_description = 'Design Files'


@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = ['id', 'user', 'total_amount', 'payment_method', 'status', 'created_at']
    list_filter = ['payment_method', 'status', 'created_at']
    search_fields = ['user__username', 'user__email', 'customer_name', 'customer_phone']
    inlines = [OrderItemInline]
    readonly_fields = ['created_at', 'updated_at']
    
    fieldsets = (
        ('Order Information', {
            'fields': ('user', 'total_amount', 'status', 'payment_method')
        }),
        ('Customer Details', {
            'fields': ('customer_name', 'customer_phone', 'shipping_address')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )


class MockupVariantInline(admin.TabularInline):
    model = MockupVariant
    extra = 1
    fields = ['color_name', 'color_hex', 'front_image', 'back_image', 'thumbnail', 'price_modifier', 'stock', 'is_active']


@admin.register(MockupType)
class MockupTypeAdmin(admin.ModelAdmin):
    list_display = ['name', 'slug', 'base_price', 'is_active', 'created_at']
    list_filter = ['is_active', 'created_at']
    search_fields = ['name', 'slug']
    prepopulated_fields = {'slug': ('name',)}
    inlines = [MockupVariantInline]
    fieldsets = (
        ('Basic Information', {
            'fields': ('name', 'slug', 'base_price', 'description')
        }),
        ('Preview Image', {
            'fields': ('preview_image',),
            'description': 'Upload a preview image for the mockup type selector'
        }),
        ('Status', {
            'fields': ('is_active',)
        }),
    )


@admin.register(MockupVariant)
class MockupVariantAdmin(admin.ModelAdmin):
    list_display = ['mockup_type', 'color_name', 'color_hex', 'effective_price', 'stock', 'is_active', 'created_at']
    list_filter = ['mockup_type', 'is_active', 'created_at']
    search_fields = ['mockup_type__name', 'color_name']
    list_select_related = ['mockup_type']
    fieldsets = (
        ('Basic Information', {
            'fields': ('mockup_type', 'color_name', 'color_hex')
        }),
        ('Mockup Images', {
            'fields': ('front_image', 'back_image', 'thumbnail'),
            'description': 'Upload front and back mockup images. Front image shows the front view, back image shows the back view.'
        }),
        ('Pricing', {
            'fields': ('price_modifier', 'stock'),
            'description': 'Additional price for this color variant (added to base price)'
        }),
        ('Status', {
            'fields': ('is_active',)
        }),
    )
