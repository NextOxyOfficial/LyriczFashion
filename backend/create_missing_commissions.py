#!/usr/bin/env python
import os
import sys
import django
import json

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'lyriczfashion.settings')
django.setup()

from products.models import Order, OrderItem, DesignLibraryItem, DesignCommission
from decimal import Decimal

print("=== Creating Missing Commissions ===")

# Check all orders that don't have delivered status
non_delivered_orders = Order.objects.exclude(status='delivered')
print(f"Non-delivered orders: {len(non_delivered_orders)}")

for order in non_delivered_orders:
    print(f"\nProcessing Order {order.id} (Status: {order.status})")
    
    # Check if this order already has commissions
    existing_commissions = DesignCommission.objects.filter(order=order)
    if existing_commissions.exists():
        print(f"  Order {order.id} already has {len(existing_commissions)} commissions, skipping")
        continue
    
    # Get order items
    order_items = OrderItem.objects.filter(order=order).select_related('product')
    
    for order_item in order_items:
        product = order_item.product
        print(f"  Checking product {product.id}: {product.name}")
        
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
                try:
                    design_ids.add(int(legacy_id))
                    print(f"    Found legacy_id: {legacy_id}")
                except Exception:
                    pass
            
            # Check sides
            sides = design_data.get('sides') or {}
            for side_key in ['front', 'back']:
                side = sides.get(side_key) or {}
                side_id = side.get('library_design_id') or side.get('design_library_item_id')
                if side_id:
                    try:
                        design_ids.add(int(side_id))
                        print(f"    Found {side_key} side design_id: {side_id}")
                    except Exception:
                        pass
            
            # Create commissions for found design IDs
            for design_id in design_ids:
                design = DesignLibraryItem.objects.filter(pk=design_id, is_active=True).select_related('owner').first()
                if not design:
                    print(f"    Design {design_id} not found or inactive")
                    continue
                
                if design.owner_id == order.user.id:
                    print(f"    Skipping commission for own design: {design.name}")
                    continue
                
                try:
                    per_use = Decimal(str(design.commission_per_use))
                except Exception:
                    per_use = Decimal('49')
                
                amount = per_use * Decimal(str(order_item.quantity))
                
                commission = DesignCommission.objects.create(
                    design=design,
                    owner=design.owner,
                    used_by=order.user,
                    order=order,
                    order_item=order_item,
                    quantity=order_item.quantity,
                    amount=amount,
                    status='pending'
                )
                
                print(f"    ✅ Created commission {commission.id}: {amount} to {design.owner.username} for design '{design.name}'")

print("\n=== Missing Commissions Creation Complete ===")

# Show summary
all_commissions = DesignCommission.objects.all()
pending_commissions = DesignCommission.objects.filter(status='pending')
completed_commissions = DesignCommission.objects.filter(status='completed')

print(f"\nSummary:")
print(f"Total commissions: {len(all_commissions)}")
print(f"Pending commissions: {len(pending_commissions)}")
print(f"Completed commissions: {len(completed_commissions)}")

print(f"\nPending commissions:")
for commission in pending_commissions:
    print(f"  {commission.design.name} -> {commission.owner.username}: ৳{commission.amount} (Order #{commission.order.id})")
