#!/usr/bin/env python
import os
import sys
import django
import json

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'lyriczfashion.settings')
django.setup()

from products.models import Order, Product, OrderItem

print("=== Checking Orders and Design Data ===")

# Check all orders
orders = Order.objects.all().select_related('user')
print(f"Total orders: {len(orders)}")

for order in orders:
    print(f"\nOrder {order.id}: Status = {order.status}, User = {order.user.username}")
    
    # Check order items
    order_items = OrderItem.objects.filter(order=order).select_related('product')
    print(f"  Order items: {len(order_items)}")
    
    for item in order_items:
        product = item.product
        print(f"    Product {product.id}: {product.name}")
        print(f"    Product kind: {product.kind}")
        print(f"    Product design_data: {product.design_data}")
        
        if product.kind == 'custom' and product.design_data:
            design_data = product.design_data
            if isinstance(design_data, str):
                try:
                    design_data = json.loads(design_data)
                    print(f"    Parsed design_data: {design_data}")
                except Exception as e:
                    print(f"    Error parsing design_data: {e}")
            else:
                print(f"    Design_data type: {type(design_data)}")
            
            # Check for library design IDs
            if isinstance(design_data, dict):
                legacy_id = design_data.get('library_design_id')
                if legacy_id:
                    print(f"    Found legacy_id: {legacy_id}")
                
                sides = design_data.get('sides') or {}
                for side_key in ['front', 'back']:
                    side = sides.get(side_key) or {}
                    side_id = side.get('library_design_id') or side.get('design_library_item_id')
                    if side_id:
                        print(f"    Found {side_key} side design_id: {side_id}")

print("\n=== Check Complete ===")
