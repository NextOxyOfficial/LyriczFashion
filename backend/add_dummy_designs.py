import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'lyriczfashion.settings')
django.setup()

from products.models import Product, Category
from django.contrib.auth.models import User

def create_dummy_designs():
    """Create dummy design products for the Design Library"""
    
    # Get or create a category
    category, _ = Category.objects.get_or_create(
        name='Designs',
        defaults={'description': 'Pre-made design templates'}
    )
    
    # Get or create admin user
    admin_user = User.objects.filter(is_superuser=True).first()
    if not admin_user:
        admin_user = User.objects.create_superuser('admin', 'admin@example.com', 'admin123')
    
    # Dummy design data
    dummy_designs = [
        {
            'name': 'Cool Skull Design',
            'description': 'Edgy skull graphic perfect for t-shirts',
            'price': 299,
            'stock': 100,
            'image_url': 'https://via.placeholder.com/500x500/1a1a1a/ffffff?text=Skull+Design',
        },
        {
            'name': 'Abstract Waves',
            'description': 'Modern abstract wave pattern',
            'price': 249,
            'stock': 100,
            'image_url': 'https://via.placeholder.com/500x500/10b981/ffffff?text=Abstract+Waves',
        },
        {
            'name': 'Vintage Logo',
            'description': 'Retro vintage style logo',
            'price': 349,
            'stock': 100,
            'image_url': 'https://via.placeholder.com/500x500/f59e0b/1a1a1a?text=Vintage+Logo',
        },
        {
            'name': 'Geometric Pattern',
            'description': 'Clean geometric shapes design',
            'price': 199,
            'stock': 100,
            'image_url': 'https://via.placeholder.com/500x500/3b82f6/ffffff?text=Geometric',
        },
        {
            'name': 'Nature Inspired',
            'description': 'Beautiful nature and leaf motifs',
            'price': 279,
            'stock': 100,
            'image_url': 'https://via.placeholder.com/500x500/059669/ffffff?text=Nature',
        },
        {
            'name': 'Street Art Style',
            'description': 'Urban graffiti inspired design',
            'price': 329,
            'stock': 100,
            'image_url': 'https://via.placeholder.com/500x500/ef4444/ffffff?text=Street+Art',
        },
    ]
    
    created_count = 0
    for design_data in dummy_designs:
        # Check if design already exists
        if not Product.objects.filter(name=design_data['name'], kind='design').exists():
            Product.objects.create(
                name=design_data['name'],
                description=design_data['description'],
                price=design_data['price'],
                stock=design_data['stock'],
                image_url=design_data['image_url'],
                category=category,
                kind='design',
                is_published=True,
                is_active=True,
                created_by=admin_user,
                buy_price=100,  # Cost price
            )
            created_count += 1
            print(f"✓ Created: {design_data['name']}")
        else:
            print(f"- Skipped (already exists): {design_data['name']}")
    
    print(f"\n✅ Done! Created {created_count} new design(s)")
    print(f"📚 Total designs in library: {Product.objects.filter(kind='design', is_published=True).count()}")

if __name__ == '__main__':
    create_dummy_designs()
