#!/usr/bin/env python
import os
import sys
import django

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'lyriczfashion.settings')
django.setup()

from django.contrib.auth.models import User
from products.models import DesignCommission, Order, DesignLibraryItem

print("=== Checking Pending Commissions ===")

# Check all commissions
all_commissions = DesignCommission.objects.all().select_related('design', 'owner', 'order')
print(f"Total commissions in database: {len(all_commissions)}")

for commission in all_commissions:
    print(f"\nCommission ID: {commission.id}")
    print(f"Design: {commission.design.name}")
    print(f"Owner: {commission.owner.username}")
    print(f"Amount: {commission.amount}")
    print(f"Status: {commission.status}")
    print(f"Order ID: {commission.order.id}")
    print(f"Order Status: {commission.order.status}")
    print(f"Used by: {commission.used_by.username}")
    print(f"Created: {commission.created_at}")

# Check pending commissions specifically
pending_commissions = DesignCommission.objects.filter(status='pending')
print(f"\n=== Pending Commissions: {len(pending_commissions)} ===")

for commission in pending_commissions:
    print(f"Pending Commission {commission.id}: {commission.design.name} -> {commission.owner.username} (Order #{commission.order.id} - {commission.order.status})")

# Check completed commissions
completed_commissions = DesignCommission.objects.filter(status='completed')
print(f"\n=== Completed Commissions: {len(completed_commissions)} ===")

for commission in completed_commissions:
    print(f"Completed Commission {commission.id}: {commission.design.name} -> {commission.owner.username} (Order #{commission.order.id} - {commission.order.status})")

# Check orders that are not delivered
non_delivered_orders = Order.objects.exclude(status='delivered')
print(f"\n=== Non-delivered Orders: {len(non_delivered_orders)} ===")

for order in non_delivered_orders:
    print(f"Order {order.id}: Status = {order.status}, User = {order.user.username}")
    commissions = DesignCommission.objects.filter(order=order)
    print(f"  Commissions for this order: {len(commissions)}")
    for comm in commissions:
        print(f"    - {comm.design.name} -> {comm.owner.username} ({comm.status})")

print("\n=== Check Complete ===")
