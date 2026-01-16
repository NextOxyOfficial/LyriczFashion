#!/usr/bin/env python
import os
import sys
import django
from django.utils.text import slugify

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'lyriczfashion.settings')
django.setup()

from products.models import DesignCategory

# Create default categories
categories = [
    {'name': 'Business', 'description': 'Corporate and business logos'},
    {'name': 'Sports', 'description': 'Sports teams and athletic logos'},
    {'name': 'Tech', 'description': 'Technology and software logos'},
    {'name': 'Fashion', 'description': 'Fashion and lifestyle logos'},
    {'name': 'Art', 'description': 'Artistic and creative logos'},
    {'name': 'Gaming', 'description': 'Gaming and esports logos'},
    {'name': 'Music', 'description': 'Music and entertainment logos'},
    {'name': 'Food', 'description': 'Restaurant and food service logos'},
    {'name': 'Health', 'description': 'Healthcare and wellness logos'},
    {'name': 'Education', 'description': 'Educational and academic logos'},
]

for cat_data in categories:
    slug = slugify(cat_data['name'])
    category, created = DesignCategory.objects.get_or_create(
        name=cat_data['name'],
        defaults={
            'slug': slug,
            'description': cat_data['description'],
            'is_active': True
        }
    )
    if created:
        print(f"Created category: {category.name}")
    else:
        print(f"Category already exists: {category.name}")

print("Categories setup complete!")
