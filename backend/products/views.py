from rest_framework import viewsets, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated, IsAdminUser, BasePermission, SAFE_METHODS
from rest_framework.exceptions import PermissionDenied, ValidationError
from rest_framework.decorators import action
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate
from django.contrib.auth.models import User
from django.db import transaction
from decimal import Decimal
import json
from .models import Category, SellerProfile, Store, Product, Order, OrderItem, DesignLibraryItem, DesignCommission, DesignCategory, WholesaleInquiry
from .mockup_models import MockupVariant
from .serializers import (
    UserSerializer, UserCreateSerializer, SellerProfileSerializer, StoreSerializer,
    CategorySerializer, ProductSerializer, OrderSerializer, DesignLibraryItemSerializer, DesignCommissionSerializer, DesignCategorySerializer, WholesaleInquirySerializer
)


class IsStoreOwnerOrReadOnly(BasePermission):
    def has_object_permission(self, request, view, obj):
        if request.method in SAFE_METHODS:
            return True
        return getattr(obj, 'owner_id', None) == request.user.id


class IsOwnerOrReadOnly(BasePermission):
    def has_object_permission(self, request, view, obj):
        if request.method in SAFE_METHODS:
            return True
        return getattr(obj, 'owner_id', None) == request.user.id


@api_view(['POST'])
@permission_classes([AllowAny])
def register(request):
    email = request.data.get('email')
    password = request.data.get('password')
    full_name = request.data.get('full_name') or request.data.get('fullName') or ''
    username = request.data.get('username')

    if not email or not password:
        return Response({'detail': 'Email and password are required'}, status=status.HTTP_400_BAD_REQUEST)

    if User.objects.filter(email=email).exists():
        return Response({'detail': 'Email already registered'}, status=status.HTTP_400_BAD_REQUEST)

    if not username:
        base = email.split('@')[0].strip() or 'user'
        candidate = base
        i = 1
        while User.objects.filter(username=candidate).exists():
            i += 1
            candidate = f"{base}{i}"
        username = candidate

    name_parts = [p for p in full_name.strip().split(' ') if p]
    first_name = name_parts[0] if len(name_parts) > 0 else ''
    last_name = ' '.join(name_parts[1:]) if len(name_parts) > 1 else ''

    user = User.objects.create_user(
        username=username,
        email=email,
        password=password,
        first_name=first_name,
        last_name=last_name,
    )

    refresh = RefreshToken.for_user(user)
    return Response({
        'user': UserSerializer(user).data,
        'access_token': str(refresh.access_token),
        'token_type': 'bearer',
        'refresh': str(refresh),
    }, status=status.HTTP_201_CREATED)


@api_view(['POST'])
@permission_classes([AllowAny])
def login(request):
    login_value = request.data.get('username') or request.data.get('email')
    password = request.data.get('password')

    if not login_value or not password:
        return Response({'detail': 'Username/email and password are required'}, status=status.HTTP_400_BAD_REQUEST)

    username = login_value
    if '@' in login_value:
        matched = User.objects.filter(email=login_value).first()
        if not matched:
            return Response({'detail': 'Invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)
        username = matched.username

    user = authenticate(username=username, password=password)
    if not user:
        return Response({'detail': 'Invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)

    refresh = RefreshToken.for_user(user)
    return Response({
        'access_token': str(refresh.access_token),
        'token_type': 'bearer',
        'user': UserSerializer(user).data
    })


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_current_user(request):
    user = request.user
    seller_status = None
    try:
        if hasattr(user, 'seller_profile') and user.seller_profile:
            seller_status = user.seller_profile.status
    except Exception:
        seller_status = None
    # Get user balance
    balance = Decimal('0.00')
    try:
        if hasattr(user, 'profile') and user.profile:
            balance = user.profile.balance
    except Exception:
        pass
    
    return Response({
        'id': user.id,
        'username': user.username,
        'email': user.email,
        'first_name': user.first_name,
        'last_name': user.last_name,
        'full_name': f"{user.first_name} {user.last_name}".strip() or user.username,
        'balance': str(balance),
        'is_admin': user.is_staff or user.is_superuser,
        'is_seller': hasattr(user, 'seller_profile') and user.seller_profile.is_seller,
        'seller_status': seller_status,
    })


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def become_seller(request):
    phone = request.data.get('phone')
    profile, _ = SellerProfile.objects.get_or_create(user=request.user)
    if profile.status != 'approved':
        profile.status = 'pending'
    if phone:
        profile.phone = phone
    profile.save()
    return Response(SellerProfileSerializer(profile).data)


@api_view(['GET'])
@permission_classes([AllowAny])
def feed(request):
    qs = Product.objects.filter(is_active=True, is_published=True, kind='design').select_related('store', 'category', 'mockup_variant', 'mockup_variant__mockup_type')
    data = ProductSerializer(qs, many=True, context={'request': request}).data
    return Response(data)


class CategoryViewSet(viewsets.ModelViewSet):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = [AllowAny]
    
    def get_queryset(self):
        from django.db.models import Count, Q
        return Category.objects.annotate(
            product_count=Count('products', filter=Q(products__is_published=True, products__is_active=True))
        ).filter(is_active=True)


class ProductViewSet(viewsets.ModelViewSet):
    serializer_class = ProductSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        qs = Product.objects.filter(is_active=True, is_published=True, kind='design').select_related('store', 'category', 'mockup_variant', 'mockup_variant__mockup_type')
        store_slug = self.request.query_params.get('store')
        category_id = self.request.query_params.get('category')
        if store_slug:
            qs = qs.filter(store__slug=store_slug)
        if category_id:
            qs = qs.filter(category_id=category_id)
        return qs

    def create(self, request, *args, **kwargs):
        raise PermissionDenied('Public product creation is not allowed')

    def update(self, request, *args, **kwargs):
        raise PermissionDenied('Public product update is not allowed')

    def partial_update(self, request, *args, **kwargs):
        raise PermissionDenied('Public product update is not allowed')

    def destroy(self, request, *args, **kwargs):
        raise PermissionDenied('Public product delete is not allowed')


class CustomProductViewSet(viewsets.ModelViewSet):
    serializer_class = ProductSerializer
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]

    def get_queryset(self):
        return Product.objects.filter(created_by=self.request.user, kind='custom', is_active=True).select_related('store', 'category')

    def perform_create(self, serializer):
        design_data = self.request.data.get('design_data')
        payload = {
            'created_by': self.request.user,
            'kind': 'custom',
            'store': None,
            'is_published': True,
            'is_active': True,
            'buy_price': Decimal('350'),
        }
        if isinstance(design_data, str) and design_data:
            try:
                serializer.save(**payload, design_data=json.loads(design_data))
                return
            except Exception:
                pass
        serializer.save(**payload)


class GuestCustomProductViewSet(viewsets.ModelViewSet):
    serializer_class = ProductSerializer
    permission_classes = [AllowAny]
    parser_classes = [MultiPartParser, FormParser]
    http_method_names = ['post']  # Only allow POST for creating products

    def get_queryset(self):
        return Product.objects.none()  # Guests can't list products

    def perform_create(self, serializer):
        design_data = self.request.data.get('design_data')
        payload = {
            'created_by': None,  # No user for guest products
            'kind': 'custom',
            'store': None,
            'is_published': True,
            'is_active': True,
            'buy_price': Decimal('350'),
        }
        if isinstance(design_data, str) and design_data:
            try:
                serializer.save(**payload, design_data=json.loads(design_data))
                return
            except Exception:
                pass
        serializer.save(**payload)


class StoreViewSet(viewsets.ModelViewSet):
    serializer_class = StoreSerializer
    lookup_field = 'slug'
    parser_classes = [MultiPartParser, FormParser]

    def get_queryset(self):
        if self.action in ['update', 'partial_update', 'destroy', 'my']:
            return Store.objects.filter(owner=self.request.user)
        return Store.objects.filter(is_active=True)

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy', 'my']:
            return [IsAuthenticated(), IsStoreOwnerOrReadOnly()]
        return [AllowAny()]

    def perform_create(self, serializer):
        profile, _ = SellerProfile.objects.get_or_create(user=self.request.user)
        if not profile.is_seller:
            raise PermissionDenied('Only sellers can create stores')
        if Store.objects.filter(owner=self.request.user).exists():
            raise ValidationError('Store already exists for this user')
        serializer.save(owner=self.request.user)

    @action(detail=False, methods=['get'], permission_classes=[IsAuthenticated])
    def my(self, request):
        store = Store.objects.filter(owner=request.user).first()
        if not store:
            return Response(None)
        return Response(StoreSerializer(store, context={'request': request}).data)


class WholesaleInquiryViewSet(viewsets.ModelViewSet):
    serializer_class = WholesaleInquirySerializer
    queryset = WholesaleInquiry.objects.all().order_by('-created_at')

    def get_permissions(self):
        if self.action == 'create':
            return [AllowAny()]
        return [IsAdminUser()]


class SellerProductViewSet(viewsets.ModelViewSet):
    serializer_class = ProductSerializer
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]

    def get_queryset(self):
        return Product.objects.filter(store__owner=self.request.user).select_related('store', 'category', 'mockup_variant', 'mockup_variant__mockup_type')

    def perform_create(self, serializer):
        profile, _ = SellerProfile.objects.get_or_create(user=self.request.user)
        if not profile.is_seller:
            raise PermissionDenied('Only sellers can create products')
        store = Store.objects.filter(owner=self.request.user).first()
        if not store:
            raise ValidationError('Create your store first')

        design_data_raw = self.request.data.get('design_data')
        parsed_design_data = None
        if isinstance(design_data_raw, str) and design_data_raw:
            try:
                parsed_design_data = json.loads(design_data_raw)
            except Exception:
                parsed_design_data = None

        mockup_variant_id = self.request.data.get('mockup_variant') or self.request.data.get('mockupVariant')
        if not mockup_variant_id and isinstance(parsed_design_data, dict):
            mockup_variant_id = (
                parsed_design_data.get('mockupVariantId') or
                parsed_design_data.get('mockup_variant_id') or
                parsed_design_data.get('mockup_variant')
            )

        variant = None
        if mockup_variant_id:
            try:
                mockup_variant_id = int(mockup_variant_id)
            except Exception:
                mockup_variant_id = None

        if mockup_variant_id:
            variant = (
                MockupVariant.objects
                .filter(pk=mockup_variant_id, is_active=True)
                .select_related('mockup_type')
                .first()
            )

        if not variant:
            raise ValidationError('mockup_variant is required')

        save_kwargs = {
            'store': store,
            'created_by': self.request.user,
            'kind': 'design',
            'is_published': True,
            'is_active': True,
        }
        if isinstance(parsed_design_data, dict):
            save_kwargs['design_data'] = parsed_design_data

        save_kwargs['mockup_variant'] = variant
        save_kwargs['buy_price'] = variant.effective_price
        save_kwargs['stock'] = int(variant.stock or 0)

        serializer.save(**save_kwargs)

    def perform_update(self, serializer):
        instance = getattr(serializer, 'instance', None)
        save_kwargs = {}
        if instance and getattr(instance, 'mockup_variant_id', None):
            variant = (
                MockupVariant.objects
                .filter(pk=instance.mockup_variant_id, is_active=True)
                .select_related('mockup_type')
                .first()
            )
            if variant:
                save_kwargs['mockup_variant'] = instance.mockup_variant
                save_kwargs['buy_price'] = variant.effective_price
                save_kwargs['stock'] = int(variant.stock or 0)
        serializer.save(**save_kwargs)

    @action(detail=False, methods=['get'], permission_classes=[AllowAny])
    def published(self, request):
        qs = Product.objects.filter(is_active=True, is_published=True, kind='design').select_related('store', 'category', 'mockup_variant', 'mockup_variant__mockup_type')
        return Response(ProductSerializer(qs, many=True, context={'request': request}).data)


class DesignLibraryItemViewSet(viewsets.ModelViewSet):
    serializer_class = DesignLibraryItemSerializer
    parser_classes = [MultiPartParser, FormParser]
    lookup_field = 'id'
    pagination_class = None

    def get_queryset(self):
        if self.action in ['update', 'partial_update', 'destroy', 'my']:
            return DesignLibraryItem.objects.filter(owner=self.request.user).select_related('owner')
        
        qs = DesignLibraryItem.objects.filter(is_active=True).select_related('owner')
        
        # Add filtering by category and search
        category = self.request.query_params.get('category')
        search = self.request.query_params.get('search')
        
        if category:
            qs = qs.filter(category__icontains=category)
        
        if search:
            qs = qs.filter(
                models.Q(name__icontains=search) |
                models.Q(search_keywords__icontains=search) |
                models.Q(category__icontains=search)
            )
        
        return qs

    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset()
        
        # Manual pagination
        page = int(request.query_params.get('page', 1))
        page_size = int(request.query_params.get('page_size', 20))
        
        start = (page - 1) * page_size
        end = start + page_size
        
        items = queryset[start:end]
        serializer = self.get_serializer(items, many=True)
        
        return Response({
            'results': serializer.data,
            'page': page,
            'page_size': page_size,
            'has_more': len(items) == page_size
        })

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy', 'my']:
            return [IsAuthenticated(), IsOwnerOrReadOnly()]
        return [AllowAny()]

    def perform_create(self, serializer):
        print(f"Creating design library item for user: {self.request.user.username}")
        print(f"Data received: {self.request.data}")
        try:
            instance = serializer.save(owner=self.request.user, is_active=True)
            print(f"Successfully created design library item: ID {instance.id}, Name: {instance.name}, Active: {instance.is_active}")
        except Exception as e:
            print(f"Error creating design library item: {e}")
            raise

    @action(detail=False, methods=['get'], permission_classes=[IsAuthenticated])
    def my(self, request):
        qs = DesignLibraryItem.objects.filter(owner=request.user).select_related('owner')
        return Response(DesignLibraryItemSerializer(qs, many=True, context={'request': request}).data)
    
    @action(detail=False, methods=['get'], permission_classes=[AllowAny])
    def featured(self, request):
        """Get featured logos for homepage"""
        qs = DesignLibraryItem.objects.filter(is_active=True, is_featured=True).select_related('owner')[:8]
        return Response(DesignLibraryItemSerializer(qs, many=True, context={'request': request}).data)


class DesignCategoryViewSet(viewsets.ModelViewSet):
    serializer_class = DesignCategorySerializer
    permission_classes = [AllowAny]
    
    def get_queryset(self):
        return DesignCategory.objects.filter(is_active=True)


class DesignCommissionViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = DesignCommissionSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return (
            DesignCommission.objects
            .filter(owner=self.request.user)
            .select_related('design', 'owner', 'used_by', 'order', 'order_item')
        )


class OrderViewSet(viewsets.ModelViewSet):
    serializer_class = OrderSerializer
    permission_classes = [AllowAny]

    def get_permissions(self):
        if self.action == 'create':
            return [AllowAny()]
        return [IsAuthenticated()]

    def get_queryset(self):
        if not self.request.user.is_authenticated:
            return Order.objects.none()
        return Order.objects.filter(user=self.request.user).order_by('-created_at')

    @action(detail=False, methods=['get'], permission_classes=[IsAuthenticated])
    def seller(self, request):
        profile = SellerProfile.objects.filter(user=request.user, is_seller=True).first()
        if not profile:
            raise PermissionDenied('Only sellers can view seller orders')

        store = Store.objects.filter(owner=request.user).first()
        if not store:
            return Response({
                'store_id': None,
                'orders': [],
                'stats': {
                    'orders_count': 0,
                    'items_sold': 0,
                    'seller_revenue': '0',
                    'seller_profit': '0',
                },
            })

        qs = (
            Order.objects
            .filter(items__product__store=store)
            .distinct()
            .prefetch_related('items__product', 'user')
        )

        orders = []
        total_revenue = Decimal('0')
        total_profit = Decimal('0')
        items_sold = 0

        for order in qs:
            relevant_items = [
                oi for oi in order.items.all()
                if oi.product and oi.product.store_id == store.id
            ]

            seller_total = Decimal('0')
            seller_profit = Decimal('0')

            items_payload = []
            for oi in relevant_items:
                try:
                    line_total = Decimal(str(oi.price)) * Decimal(str(oi.quantity))
                except Exception:
                    line_total = Decimal('0')

                try:
                    line_profit = (Decimal(str(oi.price)) - Decimal(str(oi.buy_price))) * Decimal(str(oi.quantity))
                except Exception:
                    line_profit = Decimal('0')

                seller_total += line_total
                seller_profit += line_profit
                items_sold += int(oi.quantity or 0)

                items_payload.append({
                    'id': oi.id,
                    'product_id': oi.product_id,
                    'product_name': oi.product.name,
                    'quantity': oi.quantity,
                    'buy_price': str(oi.buy_price),
                    'price': str(oi.price),
                    'line_total': str(line_total),
                    'line_profit': str(line_profit),
                })

            total_revenue += seller_total
            total_profit += seller_profit

            orders.append({
                'id': order.id,
                'created_at': order.created_at,
                'status': order.status,
                'payment_method': order.payment_method,
                'customer_name': order.customer_name,
                'customer_phone': order.customer_phone,
                'shipping_address': order.shipping_address,
                'buyer_email': getattr(order.user, 'email', ''),
                'items': items_payload,
                'seller_total': str(seller_total),
                'seller_profit': str(seller_profit),
            })

        return Response({
            'store_id': store.id,
            'orders': orders,
            'stats': {
                'orders_count': len(orders),
                'items_sold': items_sold,
                'seller_revenue': str(total_revenue),
                'seller_profit': str(total_profit),
            },
        })

    def create(self, request, *args, **kwargs):
        items = request.data.get('items') or []
        shipping_address = request.data.get('shipping_address') or request.data.get('shippingAddress')
        customer_name = request.data.get('customer_name') or request.data.get('customerName')
        customer_phone = request.data.get('customer_phone') or request.data.get('customerPhone')

        if not shipping_address:
            return Response({'detail': 'Shipping address is required'}, status=status.HTTP_400_BAD_REQUEST)

        if not isinstance(items, list) or len(items) == 0:
            return Response({'detail': 'Order items are required'}, status=status.HTTP_400_BAD_REQUEST)

        with transaction.atomic():
            order = Order.objects.create(
                user=request.user if request.user.is_authenticated else None,
                total_amount=0,
                payment_method='cod',
                shipping_address=shipping_address,
                customer_name=customer_name,
                customer_phone=customer_phone,
            )

            total = Decimal('0')
            for item in items:
                product_id = item.get('product_id') or item.get('productId') or item.get('product')
                quantity = item.get('quantity') or 1
                try:
                    quantity = int(quantity)
                except Exception:
                    quantity = 1
                if quantity < 1:
                    raise ValidationError('Quantity must be at least 1')
                if not product_id:
                    raise ValidationError('product_id is required')

                product = Product.objects.filter(pk=product_id, is_active=True).first()
                if not product:
                    raise ValidationError('Invalid product')

                if product.kind == 'design':
                    if not product.is_published:
                        raise ValidationError('Invalid product')
                elif product.kind == 'custom':
                    if request.user.is_authenticated and product.created_by_id != request.user.id:
                        raise ValidationError('Invalid product')
                    elif not request.user.is_authenticated:
                        # For guest users, allow ordering any custom product since they can't own products
                        pass
                else:
                    raise ValidationError('Invalid product')

                price = product.effective_price

                variant = None
                if getattr(product, 'mockup_variant_id', None):
                    variant = (
                        MockupVariant.objects
                        .select_for_update()
                        .filter(pk=product.mockup_variant_id, is_active=True)
                        .select_related('mockup_type')
                        .first()
                    )
                    if not variant:
                        raise ValidationError('Invalid product')
                    if int(variant.stock or 0) < int(quantity):
                        raise ValidationError('Out of stock')
                    variant.stock = int(variant.stock or 0) - int(quantity)
                    variant.save(update_fields=['stock'])

                buy_price = variant.effective_price if variant else product.buy_price
                order_item = OrderItem.objects.create(
                    order=order,
                    product=product,
                    quantity=quantity,
                    buy_price=buy_price,
                    price=price,
                )

                if product.kind == 'custom':
                    design_ids = set()
                    design_data = product.design_data or {}
                    if isinstance(design_data, str) and design_data:
                        try:
                            design_data = json.loads(design_data)
                        except Exception:
                            design_data = {}

                    legacy_id = design_data.get('library_design_id')
                    if legacy_id:
                        try:
                            design_ids.add(int(legacy_id))
                        except Exception:
                            pass

                    sides = design_data.get('sides') or {}
                    for side_key in ['front', 'back']:
                        side = sides.get(side_key) or {}
                        side_id = side.get('library_design_id') or side.get('design_library_item_id')
                        if side_id:
                            try:
                                design_ids.add(int(side_id))
                            except Exception:
                                pass

                    for design_id in design_ids:
                        design = DesignLibraryItem.objects.filter(pk=design_id, is_active=True).select_related('owner').first()
                        if not design:
                            continue
                        # Skip commission if guest user or if user owns the design
                        if request.user.is_authenticated and design.owner_id == request.user.id:
                            continue

                        try:
                            per_use = Decimal(str(design.commission_per_use))
                        except Exception:
                            per_use = Decimal('49')

                        amount = per_use * Decimal(str(quantity))
                        DesignCommission.objects.create(
                            design=design,
                            owner=design.owner,
                            used_by=request.user if request.user.is_authenticated else None,
                            order=order,
                            order_item=order_item,
                            quantity=quantity,
                            amount=amount,
                        )

                try:
                    total += Decimal(str(price)) * Decimal(str(quantity))
                except Exception:
                    pass

            shipping_fee = Decimal('0')
            if total > 0 and total <= Decimal('2000'):
                shipping_fee = Decimal('100')

            total = total + shipping_fee

            order.total_amount = total
            order.save()

        data = OrderSerializer(order, context={'request': request}).data
        return Response(data, status=status.HTTP_201_CREATED)


@api_view(['GET'])
@permission_classes([AllowAny])
def get_categories(request):
    """Get all active categories with product counts"""
    categories = Category.objects.filter(is_active=True)
    serializer = CategorySerializer(categories, many=True)
    return Response(serializer.data)
