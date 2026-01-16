#!/usr/bin/env python
import os
import sys
import django
from datetime import datetime, timedelta

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'lyriczfashion.settings')
django.setup()

from products.models import DesignLibraryItem

# Check all logos in database
all_items = DesignLibraryItem.objects.all().order_by('-created_at')
print(f"Total logos in database: {len(all_items)}")
print()

for item in all_items:
    print(f"ID: {item.id}")
    print(f"Name: '{item.name}'")
    print(f"Owner: {item.owner.username}")
    print(f"Category: '{item.category}'")
    print(f"Keywords: '{item.search_keywords}'")
    print(f"Is Active: {item.is_active}")
    print(f"Created: {item.created_at}")
    print(f"Updated: {item.updated_at}")
    print(f"Image: {item.image}")
    print("-" * 60)

# Check very recent uploads (last 10 minutes)
very_recent = datetime.now() - timedelta(minutes=10)
recent_items = DesignLibraryItem.objects.filter(created_at__gte=very_recent).order_by('-created_at')
print(f"\nLogos created in the last 10 minutes: {len(recent_items)}")
for item in recent_items:
    print(f"Recent: ID {item.id}, Name: '{item.name}', Active: {item.is_active}")

# Check if there are any inactive logos
inactive_items = DesignLibraryItem.objects.filter(is_active=False)
print(f"\nInactive logos: {len(inactive_items)}")
for item in inactive_items:
    print(f"Inactive: ID {item.id}, Name: '{item.name}'")

# Activate all logos just in case
print(f"\nActivating all logos...")
updated_count = DesignLibraryItem.objects.all().update(is_active=True)
print(f"Updated {updated_count} logos to active status")
