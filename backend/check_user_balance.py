#!/usr/bin/env python
import os
import sys
import django

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'lyriczfashion.settings')
django.setup()

from django.contrib.auth.models import User
from products.models import UserProfile, DesignCommission

# Check user balances and commissions
users = User.objects.all()
print("=== User Balances and Commissions ===")

for user in users:
    profile, created = UserProfile.objects.get_or_create(user=user)
    commissions = DesignCommission.objects.filter(owner=user)
    
    print(f"\nUser: {user.username}")
    print(f"Profile Balance: {profile.balance}")
    print(f"Total Commissions: {len(commissions)}")
    
    pending_total = 0
    paid_total = 0
    
    for commission in commissions:
        if commission.status == 'pending':
            pending_total += commission.amount
        elif commission.status == 'paid':
            paid_total += commission.amount
        
        print(f"  Commission {commission.id}: {commission.amount} - {commission.status} (Design: {commission.design.name})")
    
    print(f"Pending Total: {pending_total}")
    print(f"Paid Total: {paid_total}")
    print(f"Profile Balance Should Be: {paid_total}")
    
    if profile.balance != paid_total:
        print(f"⚠️  MISMATCH: Profile balance ({profile.balance}) != Paid total ({paid_total})")
        print(f"Updating profile balance to {paid_total}")
        profile.balance = paid_total
        profile.save()
        print(f"✅ Updated profile balance to {paid_total}")

print("\n=== Balance Check Complete ===")
