#!/usr/bin/env python
import os
import sys
import django

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'lyriczfashion.settings')
django.setup()

from django.contrib.auth.models import User
from products.models import UserProfile

# Create profiles for existing users
users = User.objects.all()
print(f"Creating profiles for {len(users)} users...")

for user in users:
    profile, created = UserProfile.objects.get_or_create(user=user)
    if created:
        print(f"Created profile for {user.username}")
    else:
        print(f"Profile already exists for {user.username} - Balance: {profile.balance}")

print("Profile creation complete!")
