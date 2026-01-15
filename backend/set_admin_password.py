import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'lyriczfashion.settings')
django.setup()

from django.contrib.auth.models import User

admin = User.objects.get(username='admin')
admin.set_password('admin123')
admin.save()

print("✅ Admin password set to: admin123")
print("Username: admin")
print("Email: admin@lyriczfashion.com")
