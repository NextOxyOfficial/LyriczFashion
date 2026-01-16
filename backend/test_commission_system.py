#!/usr/bin/env python
import os
import sys
import django

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'lyriczfashion.settings')
django.setup()

from django.contrib.auth.models import User
from products.models import Order, DesignCommission, UserProfile, DesignLibraryItem
from decimal import Decimal

print("=== Testing Commission Payment System ===")

# Check existing orders
orders = Order.objects.all()
print(f"\nTotal orders: {len(orders)}")

for order in orders:
    print(f"Order {order.id}: Status = {order.status}, User = {order.user.username}")
    
    # Check commissions for this order
    commissions = DesignCommission.objects.filter(order=order)
    print(f"  Commissions: {len(commissions)}")
    
    for commission in commissions:
        print(f"    Commission {commission.id}: {commission.amount} to {commission.owner.username} - Status: {commission.status}")

# Test commission payment by changing order status to delivered
print(f"\n=== Testing Commission Payment ===")

# Find a non-delivered order to test with
test_order = Order.objects.filter(status__in=['pending', 'processing', 'shipped']).first()

if test_order:
    print(f"Testing with Order {test_order.id} (current status: {test_order.status})")
    
    # Check user balance before
    user_profiles = UserProfile.objects.all()
    print("\nUser balances BEFORE delivery:")
    for profile in user_profiles:
        print(f"  {profile.user.username}: {profile.balance}")
    
    # Change order status to delivered (this should trigger commission payment)
    test_order.status = 'delivered'
    test_order.save()
    
    print(f"\nChanged Order {test_order.id} status to 'delivered'")
    
    # Check user balance after
    user_profiles = UserProfile.objects.all()
    print("\nUser balances AFTER delivery:")
    for profile in user_profiles:
        print(f"  {profile.user.username}: {profile.balance}")
    
    # Check commission status
    commissions = DesignCommission.objects.filter(order=test_order)
    print(f"\nCommissions for Order {test_order.id}:")
    for commission in commissions:
        print(f"  Commission {commission.id}: {commission.amount} to {commission.owner.username} - Status: {commission.status}")

else:
    print("No orders found to test with")

print("\n=== Commission System Test Complete ===")
