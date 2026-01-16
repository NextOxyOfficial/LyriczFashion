#!/usr/bin/env python
import os
import sys
import django
import json

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'lyriczfashion.settings')
django.setup()

from django.contrib.auth.models import User
from products.models import Product, Order, OrderItem, DesignLibraryItem, DesignCommission, UserProfile
from decimal import Decimal

print("=== Creating Test Commission Scenario ===")

# Get users
admin_user = User.objects.get(username='admin')
admin2_user = User.objects.get(username='admin2')

# Check if we have design library items
designs = DesignLibraryItem.objects.filter(is_active=True)
print(f"Available design library items: {len(designs)}")

if len(designs) == 0:
    print("No design library items found. Cannot test commission system.")
    sys.exit(1)

design = designs.first()
print(f"Using design: {design.name} by {design.owner.username}")

# Create a custom product that uses the design library item
print(f"\nCreating custom product that uses design library item...")

# Create design data that references the library design
design_data = {
    "library_design_id": design.id,
    "sides": {
        "front": {
            "design_library_item_id": design.id,
            "library_design_id": design.id
        }
    }
}

# Create custom product
product = Product.objects.create(
    created_by=admin_user,
    name="Test Custom Product with Library Design",
    description="Test product using design library",
    buy_price=Decimal('350'),
    price=Decimal('500'),
    kind='custom',
    is_published=True,
    is_active=True,
    design_data=design_data
)

print(f"Created product: {product.name} (ID: {product.id})")
print(f"Product design_data: {product.design_data}")

# Create an order with this product
print(f"\nCreating order...")

order = Order.objects.create(
    user=admin_user,  # User who places the order
    total_amount=Decimal('600'),  # 500 + 100 shipping
    status='pending',
    payment_method='cod',
    shipping_address='Test Address',
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

print(f"Created order: {order.id} with item: {order_item.id}")

# Manually trigger commission creation (simulate the order creation logic)
print(f"\nCreating commission manually...")

if product.kind == 'custom':
    design_ids = set()
    design_data = product.design_data or {}
    
    if isinstance(design_data, str):
        try:
            design_data = json.loads(design_data)
        except Exception:
            design_data = {}
    
    # Check legacy_id
    legacy_id = design_data.get('library_design_id')
    if legacy_id:
        design_ids.add(int(legacy_id))
    
    # Check sides
    sides = design_data.get('sides') or {}
    for side_key in ['front', 'back']:
        side = sides.get(side_key) or {}
        side_id = side.get('library_design_id') or side.get('design_library_item_id')
        if side_id:
            design_ids.add(int(side_id))
    
    print(f"Found design IDs to commission: {design_ids}")
    
    for design_id in design_ids:
        design_item = DesignLibraryItem.objects.filter(pk=design_id, is_active=True).select_related('owner').first()
        if not design_item:
            continue
        if design_item.owner_id == admin_user.id:  # Skip if user owns the design
            print(f"Skipping commission for own design: {design_item.name}")
            continue
        
        per_use = Decimal(str(design_item.commission_per_use))
        amount = per_use * Decimal(str(order_item.quantity))
        
        commission = DesignCommission.objects.create(
            design=design_item,
            owner=design_item.owner,
            used_by=admin_user,
            order=order,
            order_item=order_item,
            quantity=order_item.quantity,
            amount=amount,
            status='pending'
        )
        
        print(f"Created commission: {commission.id} - {amount} to {design_item.owner.username}")

# Check current state
print(f"\n=== Current State ===")
commissions = DesignCommission.objects.filter(order=order)
print(f"Commissions for order {order.id}: {len(commissions)}")

for commission in commissions:
    print(f"  Commission {commission.id}: {commission.amount} to {commission.owner.username} - Status: {commission.status}")

# Check user balances before delivery
profiles = UserProfile.objects.all()
print(f"\nUser balances BEFORE delivery:")
for profile in profiles:
    print(f"  {profile.user.username}: {profile.balance}")

# Now test the delivery signal
print(f"\n=== Testing Delivery Signal ===")
order.status = 'delivered'
order.save()

print(f"Changed order {order.id} status to 'delivered'")

# Check user balances after delivery
profiles = UserProfile.objects.all()
print(f"\nUser balances AFTER delivery:")
for profile in profiles:
    print(f"  {profile.user.username}: {profile.balance}")

# Check commission status after delivery
commissions = DesignCommission.objects.filter(order=order)
print(f"\nCommissions after delivery:")
for commission in commissions:
    print(f"  Commission {commission.id}: {commission.amount} to {commission.owner.username} - Status: {commission.status}")

print(f"\n=== Test Complete ===")
