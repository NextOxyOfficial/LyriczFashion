#!/usr/bin/env python
import os
import sys
import django

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'lyriczfashion.settings')
django.setup()

from products.models import DesignCommission, Order

# Check all commissions
commissions = DesignCommission.objects.all().select_related('design', 'owner', 'order')
print(f"Total commissions: {len(commissions)}")
print()

for commission in commissions:
    print(f"Commission ID: {commission.id}")
    print(f"Design: {commission.design.name}")
    print(f"Owner: {commission.owner.username}")
    print(f"Amount: {commission.amount}")
    print(f"Status: {commission.status}")
    print(f"Order ID: {commission.order.id}")
    print(f"Order Status: {commission.order.status}")
    print(f"Created: {commission.created_at}")
    print("-" * 50)

# Check orders with delivered status
delivered_orders = Order.objects.filter(status='delivered')
print(f"\nDelivered orders: {len(delivered_orders)}")

# Check pending commissions
pending_commissions = DesignCommission.objects.filter(status='pending')
print(f"Pending commissions: {len(pending_commissions)}")

# Check paid commissions  
paid_commissions = DesignCommission.objects.filter(status='paid')
print(f"Paid commissions: {len(paid_commissions)}")
