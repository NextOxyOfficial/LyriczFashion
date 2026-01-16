#!/usr/bin/env python
import os
import sys
import django
from datetime import datetime, timedelta

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'lyriczfashion.settings')
django.setup()

from products.models import DesignLibraryItem

# Check all logos created in the last 24 hours
recent_cutoff = datetime.now() - timedelta(hours=24)
recent_items = DesignLibraryItem.objects.filter(created_at__gte=recent_cutoff).order_by('-created_at')

print(f"Logos created in the last 24 hours: {len(recent_items)}")
for item in recent_items:
    print(f"ID: {item.id}, Name: '{item.name}', Active: {item.is_active}, Category: '{item.category}', Keywords: '{item.search_keywords}', Created: {item.created_at}")

# Also check all logos regardless of date
all_items = DesignLibraryItem.objects.all().order_by('-created_at')
print(f"\nAll logos in database: {len(all_items)}")
for item in all_items:
    print(f"ID: {item.id}, Name: '{item.name}', Active: {item.is_active}, Category: '{item.category}', Keywords: '{item.search_keywords}', Created: {item.created_at}")

# Activate all logos to fix the display issue
print("\nActivating all logos...")
DesignLibraryItem.objects.all().update(is_active=True)
print("All logos activated!")

# Check again
active_items = DesignLibraryItem.objects.filter(is_active=True)
print(f"\nActive logos after update: {len(active_items)}")
