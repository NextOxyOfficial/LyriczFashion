#!/usr/bin/env python
import os
import sys
import django

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'lyriczfashion.settings')
django.setup()

from products.models import DesignLibraryItem

# Check all design library items
items = DesignLibraryItem.objects.all()
print(f"Total design library items: {len(items)}")
print()

for item in items:
    print(f"ID: {item.id}")
    print(f"Name: {item.name}")
    print(f"Owner: {item.owner.username}")
    print(f"Category: '{item.category}'")
    print(f"Keywords: '{item.search_keywords}'")
    print(f"Is Active: {item.is_active}")
    print(f"Created: {item.created_at}")
    print(f"Image: {item.image}")
    print("-" * 50)

# Check specifically for "Family" logo
family_logos = DesignLibraryItem.objects.filter(name__icontains='family')
print(f"\nFamily logos found: {len(family_logos)}")
for logo in family_logos:
    print(f"Family logo - ID: {logo.id}, Active: {logo.is_active}, Category: '{logo.category}', Keywords: '{logo.search_keywords}'")
