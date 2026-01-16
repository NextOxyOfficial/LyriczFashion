#!/usr/bin/env python
import os
import sys
import django
import json

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'lyriczfashion.settings')
django.setup()

from django.contrib.auth.models import User
from products.models import Product, Order, OrderItem, DesignLibraryItem, DesignCommission
from decimal import Decimal

print("=== Creating Test Pending Commission ===")

# Get users
admin_user = User.objects.get(username='admin')
admin2_user = User.objects.get(username='admin2')

# Get admin2's design (the one that should receive commissions)
admin2_design = DesignLibraryItem.objects.filter(owner=admin2_user, is_active=True).first()
if not admin2_design:
    print("No design found for admin2")
    sys.exit(1)

print(f"Using admin2's design: {admin2_design.name} (ID: {admin2_design.id})")

# Create a custom product that uses admin2's design (created by admin user)
design_data = {
    "type": "logo_on_mockup",
    "sides": {
        "front": {
            "hasLogo": True,
            "hasText": False,
            "library_design_id": admin2_design.id,
            "design_library_item_id": admin2_design.id,
            "imagePlacement": {
                "x": 0.5,
                "y": 0.4,
                "scale": 0.6,
                "rotation": 0
            }
        },
        "back": {
            "hasLogo": False,
            "hasText": False
        }
    },
    "variant": {"size": "M", "color": "Black"},
    "mockupType": "hoodie",
    "mockupTypeId": 3,
    "mockupVariantId": 10
}

# Create custom product (admin user creates product using admin2's design)
product = Product.objects.create(
    created_by=admin_user,
    name="Test Pending Commission Product",
    description="Test product using admin2's design",
    buy_price=Decimal('350'),
    price=Decimal('500'),
    kind='custom',
    is_published=True,
    is_active=True,
    design_data=design_data
)

print(f"Created product: {product.name} (ID: {product.id})")

# Create a pending order with this product
order = Order.objects.create(
    user=admin_user,  # Admin user places order using admin2's design
    total_amount=Decimal('600'),
    status='pending',  # Keep as pending
    payment_method='cod',
    shipping_address='Test Address for Pending Order',
    customer_name='Test Customer',
    customer_phone='1234567890'
)

# Create order item
order_item = OrderItem.objects.create(
    order=order,
    product=product,
    quantity=1,
    buy_price=product.buy_price,
    price=product.price
)

print(f"Created pending order: {order.id} with item: {order_item.id}")

# Manually create commission (simulate the order creation logic)
print(f"Creating commission for admin2's design usage...")

commission = DesignCommission.objects.create(
    design=admin2_design,
    owner=admin2_design.owner,  # admin2
    used_by=admin_user,         # admin placed the order
    order=order,
    order_item=order_item,
    quantity=order_item.quantity,
    amount=Decimal('49.00'),
    status='pending'  # This should be pending since order is pending
)

print(f"Created pending commission: {commission.id} - ৳{commission.amount} to {admin2_design.owner.username}")

# Verify the commission was created
print(f"\n=== Verification ===")
print(f"Commission ID: {commission.id}")
print(f"Design: {commission.design.name}")
print(f"Owner: {commission.owner.username}")
print(f"Amount: ৳{commission.amount}")
print(f"Status: {commission.status}")
print(f"Order ID: {commission.order.id}")
print(f"Order Status: {commission.order.status}")
print(f"Used by: {commission.used_by.username}")

# Check all commissions for admin2
admin2_commissions = DesignCommission.objects.filter(owner=admin2_user)
print(f"\nAll commissions for admin2: {len(admin2_commissions)}")
for comm in admin2_commissions:
    print(f"  {comm.design.name}: ৳{comm.amount} - {comm.status} (Order #{comm.order.id} - {comm.order.status})")

print(f"\n=== Test Complete ===")
print(f"Now admin2 should see this pending commission in their commission history!")
