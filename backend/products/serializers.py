from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Category, SellerProfile, Store, Product, Order, OrderItem


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name']


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
        fields = ['id', 'user', 'is_seller', 'phone', 'created_at', 'updated_at']


class StoreSerializer(serializers.ModelSerializer):
    slug = serializers.CharField(read_only=True)
    owner = UserSerializer(read_only=True)

    class Meta:
        model = Store
        fields = ['id', 'owner', 'name', 'slug', 'logo', 'banner', 'description', 'is_active', 'created_at', 'updated_at']


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = '__all__'


class ProductSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source='category.name', read_only=True)
    effective_price = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)
    discount_percentage = serializers.IntegerField(read_only=True)
    profit_per_unit = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)
    store_name = serializers.CharField(source='store.name', read_only=True)
    store_slug = serializers.CharField(source='store.slug', read_only=True)
     
    class Meta:
        model = Product
        fields = '__all__'
        extra_kwargs = {
            'created_by': {'read_only': True},
        }


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
