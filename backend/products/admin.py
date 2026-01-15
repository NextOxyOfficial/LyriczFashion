from django.contrib import admin
from .models import Category, SellerProfile, Store, Product, Order, OrderItem


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ['name', 'created_at']
    search_fields = ['name']


@admin.register(SellerProfile)
class SellerProfileAdmin(admin.ModelAdmin):
    list_display = ['user', 'is_seller', 'phone', 'created_at']
    list_filter = ['is_seller', 'created_at']
    search_fields = ['user__username', 'user__email', 'phone']


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


class OrderItemInline(admin.TabularInline):
    model = OrderItem
    extra = 0


@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = ['id', 'user', 'total_amount', 'payment_method', 'status', 'created_at']
    list_filter = ['payment_method', 'status', 'created_at']
    search_fields = ['user__username', 'user__email']
    inlines = [OrderItemInline]
