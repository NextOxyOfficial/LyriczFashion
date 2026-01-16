import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'lyriczfashion.settings')
django.setup()

from products.mockup_models import MockupType, MockupVariant

def create_mockup_data():
    """Create dummy mockup types and variants with front/back images"""
    
    # Mockup types data
    mockup_types_data = [
        {
            'name': 'T-Shirt',
            'slug': 't-shirt',
            'base_price': 699,
            'description': 'Classic cotton t-shirt',
        },
        {
            'name': 'Hoodie',
            'slug': 'hoodie',
            'base_price': 1299,
            'description': 'Comfortable pullover hoodie',
        },
        {
            'name': 'Long Sleeve',
            'slug': 'long-sleeve',
            'base_price': 899,
            'description': 'Long sleeve t-shirt',
        },
        {
            'name': 'Tank Top',
            'slug': 'tank-top',
            'base_price': 499,
            'description': 'Sleeveless tank top',
        },
        {
            'name': 'Polo Shirt',
            'slug': 'polo-shirt',
            'base_price': 999,
            'description': 'Classic polo shirt',
        },
        {
            'name': 'Sweatshirt',
            'slug': 'sweatshirt',
            'base_price': 1199,
            'description': 'Crew neck sweatshirt',
        },
    ]
    
    # Colors for variants
    colors = [
        {'name': 'White', 'hex': '#FFFFFF'},
        {'name': 'Black', 'hex': '#000000'},
        {'name': 'Navy', 'hex': '#001F3F'},
        {'name': 'Heather Grey', 'hex': '#B0B0B0'},
        {'name': 'Red', 'hex': '#FF4136'},
        {'name': 'Royal Blue', 'hex': '#0074D9'},
        {'name': 'Forest Green', 'hex': '#2ECC40'},
        {'name': 'Maroon', 'hex': '#85144B'},
    ]
    
    created_types = 0
    created_variants = 0
    
    for mockup_data in mockup_types_data:
        # Create or get mockup type
        mockup_type, created = MockupType.objects.get_or_create(
            slug=mockup_data['slug'],
            defaults={
                'name': mockup_data['name'],
                'base_price': mockup_data['base_price'],
                'description': mockup_data['description'],
                'is_active': True,
            }
        )
        
        if created:
            created_types += 1
            print(f"✓ Created MockupType: {mockup_data['name']}")
        else:
            print(f"- Skipped (already exists): {mockup_data['name']}")
        
        # Create variants for each color
        for color in colors:
            # Use placeholder images with appropriate colors
            front_url = f"https://via.placeholder.com/800x900/{color['hex'][1:]}/{'000000' if color['name'] == 'White' else 'FFFFFF'}?text={mockup_data['name']}+Front"
            back_url = f"https://via.placeholder.com/800x900/{color['hex'][1:]}/{'000000' if color['name'] == 'White' else 'FFFFFF'}?text={mockup_data['name']}+Back"
            thumb_url = f"https://via.placeholder.com/200x200/{color['hex'][1:]}/{'000000' if color['name'] == 'White' else 'FFFFFF'}?text={color['name']}"
            
            # For now, we'll use image_url field since we don't have actual image files
            # In production, you would upload actual mockup images
            variant, v_created = MockupVariant.objects.get_or_create(
                mockup_type=mockup_type,
                color_name=color['name'],
                defaults={
                    'color_hex': color['hex'],
                    'price_modifier': 0,  # No extra charge for different colors
                    'is_active': True,
                }
            )
            
            if v_created:
                created_variants += 1
    
    print(f"\n✅ Done!")
    print(f"📦 Created {created_types} new mockup type(s)")
    print(f"🎨 Created {created_variants} new variant(s)")
    print(f"📊 Total mockup types: {MockupType.objects.filter(is_active=True).count()}")
    print(f"📊 Total variants: {MockupVariant.objects.filter(is_active=True).count()}")

if __name__ == '__main__':
    create_mockup_data()
