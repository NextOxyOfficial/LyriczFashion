from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Category, SellerProfile, Store, Product, Order, OrderItem, DesignLibraryItem, DesignCommission, DesignCategory, UserProfile, WholesaleInquiry


class UserSerializer(serializers.ModelSerializer):
    balance = serializers.DecimalField(max_digits=10, decimal_places=2, source='profile.balance', read_only=True)
    
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'balance']


class UserCreateSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    
    class Meta:
        model = User
        fields = ['username', 'email', 'password', 'first_name', 'last_name']
    
    def create(self, validated_data):
        user = User.objects.create_user(**validated_data)
        return user


class SellerProfileSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)

    class Meta:
        model = SellerProfile
        fields = ['id', 'user', 'is_seller', 'status', 'phone', 'created_at', 'updated_at']


class StoreSerializer(serializers.ModelSerializer):
    slug = serializers.CharField(read_only=True)
    owner = UserSerializer(read_only=True)

    class Meta:
        model = Store
        fields = ['id', 'owner', 'name', 'slug', 'logo', 'banner', 'description', 'is_active', 'created_at', 'updated_at']


class CategorySerializer(serializers.ModelSerializer):
    product_count = serializers.IntegerField(read_only=True)
    
    class Meta:
        model = Category
        fields = ['id', 'name', 'slug', 'description', 'image', 'image_url', 'is_active', 'order', 'product_count']


class ProductSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source='category.name', read_only=True)
    mockup_type_name = serializers.CharField(source='mockup_variant.mockup_type.name', read_only=True)
    effective_price = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)
    discount_percentage = serializers.IntegerField(read_only=True)
    profit_per_unit = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)
    store_name = serializers.CharField(source='store.name', read_only=True)
    store_slug = serializers.CharField(source='store.slug', read_only=True)
    designer_name = serializers.SerializerMethodField()
    creator_store_slug = serializers.SerializerMethodField()
    available_stock = serializers.SerializerMethodField()
    admin_buy_price = serializers.SerializerMethodField()
     
    class Meta:
        model = Product
        fields = '__all__'
        extra_kwargs = {
            'created_by': {'read_only': True},
        }

    def get_available_stock(self, obj: Product):
        try:
            if getattr(obj, 'mockup_variant_id', None) and getattr(obj, 'mockup_variant', None):
                return int(obj.mockup_variant.stock or 0)
        except Exception:
            pass
        try:
            return int(obj.stock or 0)
        except Exception:
            return 0

    def get_designer_name(self, obj: Product):
        if obj.created_by:
            full_name = f"{obj.created_by.first_name} {obj.created_by.last_name}".strip()
            return full_name if full_name else obj.created_by.username
        return None

    def get_creator_store_slug(self, obj: Product):
        if obj.store and obj.store.slug:
            return obj.store.slug
        if obj.created_by:
            try:
                store = obj.created_by.stores.filter(is_active=True).first()
                if store:
                    return store.slug
            except Exception:
                pass
        return None

    def get_admin_buy_price(self, obj: Product):
        try:
            if getattr(obj, 'mockup_variant_id', None) and getattr(obj, 'mockup_variant', None):
                return str(obj.mockup_variant.effective_price)
        except Exception:
            pass
        try:
            return str(obj.buy_price)
        except Exception:
            return '0'


class OrderItemSerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(source='product.name', read_only=True)
    total_profit = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)
     
    class Meta:
        model = OrderItem
        fields = '__all__'


class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, read_only=True)
    user_email = serializers.CharField(source='user.email', read_only=True)
    total_profit = serializers.SerializerMethodField()
     
    class Meta:
        model = Order
        fields = '__all__'

    def get_total_profit(self, obj: Order):
        total = 0
        for item in obj.items.all():
            try:
                total += float(item.total_profit)
            except Exception:
                pass
        return total


class DesignLibraryItemSerializer(serializers.ModelSerializer):
    owner = UserSerializer(read_only=True)

    class Meta:
        model = DesignLibraryItem
        fields = '__all__'
        read_only_fields = ['owner', 'is_featured', 'created_at', 'updated_at']


class DesignCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = DesignCategory
        fields = '__all__'
        read_only_fields = ['slug', 'created_at', 'updated_at']

class DesignCommissionSerializer(serializers.ModelSerializer):
    design = DesignLibraryItemSerializer(read_only=True)
    owner = UserSerializer(read_only=True)
    used_by = UserSerializer(read_only=True)
    order_status = serializers.CharField(source='order.status', read_only=True)

    class Meta:
        model = DesignCommission
        fields = '__all__'
        read_only_fields = ['design', 'owner', 'used_by', 'order', 'order_item', 'created_at']


class WholesaleInquirySerializer(serializers.ModelSerializer):
    class Meta:
        model = WholesaleInquiry
        fields = '__all__'
        read_only_fields = ['created_at']
