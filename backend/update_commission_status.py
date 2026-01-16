#!/usr/bin/env python
import os
import sys
import django

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'lyriczfashion.settings')
django.setup()

from products.models import DesignCommission

# Update existing 'paid' status to 'completed'
commissions = DesignCommission.objects.filter(status='paid')
print(f"Updating {len(commissions)} commissions from 'paid' to 'completed'")

for commission in commissions:
    commission.status = 'completed'
    commission.save()
    print(f"Updated commission {commission.id} to 'completed'")

print("Status update complete!")
