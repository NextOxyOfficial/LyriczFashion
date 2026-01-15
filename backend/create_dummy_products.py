import os
import django
import random

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'lyriczfashion.settings')
django.setup()

from products.models import Product, Category
from django.contrib.auth import get_user_model

User = get_user_model()

# Product names and descriptions
product_names = [
    "Zone Sweatshirt", "Zoo Men's T-shirt", "Toddler T-shirt", "Fine Jersey Tee",
    "Kids Hoodie", "Youth Short Sleeve Tee", "Midweight Cotton Tee", "Hooded Sweatshirt",
    "Softstyle Tank Top", "Premium Pullover Hoodie", "Classic Crew Neck", "V-Neck Tee",
    "Long Sleeve Tee", "Raglan Baseball Tee", "Muscle Tank", "Zip Hoodie",
    "Crewneck Sweatshirt", "Oversized Tee", "Crop Top", "Polo Shirt",
    "Henley Shirt", "Graphic Tee", "Striped Tee", "Pocket Tee",
    "Ringer Tee", "Burnout Tee", "Tie-Dye Tee", "Vintage Wash Tee",
    "Performance Tee", "Moisture Wicking Tee", "Thermal Shirt", "Flannel Shirt",
    "Denim Jacket", "Bomber Jacket", "Track Jacket", "Windbreaker",
    "Puffer Vest", "Sleeveless Hoodie", "Quarter Zip Pullover", "Turtleneck",
    "Mock Neck Tee", "Scoop Neck Tee", "Boat Neck Tee", "Off-Shoulder Top",
    "Halter Top", "Cami Top", "Tube Top", "Peplum Top",
    "Wrap Top", "Asymmetric Top"
]

descriptions = [
    "Comfortable and stylish everyday wear",
    "Perfect for casual outings",
    "Soft fabric with great fit",
    "Classic design with modern touch",
    "Durable and long-lasting quality",
    "Ideal for all seasons",
    "Premium quality material",
    "Trendy and fashionable",
    "Great for layering",
    "Versatile wardrobe essential"
]

# Image URLs (using Unsplash)
image_urls = [
    "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab",
    "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a",
    "https://images.unsplash.com/photo-1618354691373-d851c5c3a990",
    "https://images.unsplash.com/photo-1576566588028-4147f3842f27",
    "https://images.unsplash.com/photo-1556821840-3a63f95609a7",
    "https://images.unsplash.com/photo-1622445275463-afa2ab738c34",
    "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c",
    "https://images.unsplash.com/photo-1614732414444-096e5f1122d5",
    "https://images.unsplash.com/photo-1581822261290-991b38693d1b",
    "https://images.unsplash.com/photo-1446776811953-b23d57bd21aa"
]

def create_dummy_products():
    # Get or create a default user (seller)
    try:
        seller = User.objects.filter(email='seller@test.com').first()
        if not seller:
            seller = User.objects.create_user(
                email='seller@test.com',
                password='testpass123',
                username='testseller'
            )
            print("Created test seller")
        
        # Check if seller profile exists
        if not hasattr(seller, 'seller_profile'):
            from products.models import SellerProfile
            SellerProfile.objects.create(user=seller)
            print("Created seller profile")
    except Exception as e:
        print(f"Error creating seller: {e}")
        return

    # Get or create default category
    category, _ = Category.objects.get_or_create(
        name='T-Shirts',
        defaults={'description': 'Custom T-Shirts'}
    )

    # Create 50 dummy products
    products_created = 0
    for i in range(50):
        try:
            name = product_names[i % len(product_names)]
            if i >= len(product_names):
                name = f"{name} #{i - len(product_names) + 2}"
            
            # Random pricing
            base_price = random.randint(15, 50)
            has_discount = random.choice([True, False])
            discount_price = base_price - random.randint(3, 10) if has_discount else None
            
            product = Product.objects.create(
                name=name,
                description=random.choice(descriptions),
                category=category,
                created_by=seller,
                price=base_price,
                discount_price=discount_price,
                stock=random.randint(10, 100),
                is_published=True,
                image_url=random.choice(image_urls) + f"?w=300&h=400&fit=crop&sig={i}"
            )
            products_created += 1
            print(f"Created product {products_created}: {product.name}")
        except Exception as e:
            print(f"Error creating product {i}: {e}")
    
    print(f"\nSuccessfully created {products_created} dummy products!")

if __name__ == '__main__':
    create_dummy_products()
