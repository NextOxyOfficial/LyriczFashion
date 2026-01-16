"""
Script to create dummy preview images for mockup types
"""
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'lyriczfashion.settings')
django.setup()

from PIL import Image, ImageDraw, ImageFont
from products.mockup_models import MockupType
from django.core.files.base import ContentFile
from io import BytesIO

def create_preview_image(text, color='#10B981'):
    """Create a simple preview image with text"""
    width, height = 400, 400
    img = Image.new('RGB', (width, height), color='#F3F4F6')
    draw = ImageDraw.Draw(img)
    
    # Draw a simple t-shirt shape
    # Body
    body_points = [
        (120, 150), (280, 150), (280, 380), (120, 380)
    ]
    draw.polygon(body_points, fill='white', outline='#D1D5DB')
    
    # Sleeves
    left_sleeve = [(80, 150), (120, 150), (120, 200), (80, 220)]
    right_sleeve = [(280, 150), (320, 150), (320, 220), (280, 200)]
    draw.polygon(left_sleeve, fill='white', outline='#D1D5DB')
    draw.polygon(right_sleeve, fill='white', outline='#D1D5DB')
    
    # Neck
    neck_points = [(170, 150), (230, 150), (230, 170), (170, 170)]
    draw.polygon(neck_points, fill='#F3F4F6', outline='#D1D5DB')
    
    # Add text
    try:
        font = ImageFont.truetype("arial.ttf", 24)
    except:
        font = ImageFont.load_default()
    
    bbox = draw.textbbox((0, 0), text, font=font)
    text_width = bbox[2] - bbox[0]
    text_height = bbox[3] - bbox[1]
    text_x = (width - text_width) // 2
    text_y = height - 50
    
    draw.text((text_x, text_y), text, fill='#374151', font=font)
    
    # Save to BytesIO
    buffer = BytesIO()
    img.save(buffer, format='PNG')
    buffer.seek(0)
    
    return ContentFile(buffer.read(), name=f'{text.lower().replace(" ", "_")}_preview.png')

def main():
    mockup_types = MockupType.objects.all()
    
    if not mockup_types.exists():
        print("No mockup types found. Creating sample mockup types...")
        # Create sample mockup types
        samples = [
            {'name': 'T-Shirt', 'slug': 't-shirt', 'base_price': 699},
            {'name': 'Hoodie', 'slug': 'hoodie', 'base_price': 1299},
            {'name': 'Long Sleeve', 'slug': 'long-sleeve', 'base_price': 899},
            {'name': 'Polo Shirt', 'slug': 'polo-shirt', 'base_price': 999},
            {'name': 'Sweatshirt', 'slug': 'sweatshirt', 'base_price': 1199},
            {'name': 'Tank Top', 'slug': 'tank-top', 'base_price': 499},
            {'name': 'Tshirt', 'slug': 'tshirt', 'base_price': 500},
        ]
        
        for sample in samples:
            MockupType.objects.get_or_create(
                slug=sample['slug'],
                defaults={
                    'name': sample['name'],
                    'base_price': sample['base_price'],
                    'description': f'{sample["name"]} mockup for custom designs'
                }
            )
        
        mockup_types = MockupType.objects.all()
    
    print(f"Found {mockup_types.count()} mockup types")
    
    for mockup_type in mockup_types:
        if not mockup_type.preview_image:
            print(f"Creating preview image for {mockup_type.name}...")
            preview_img = create_preview_image(mockup_type.name)
            mockup_type.preview_image.save(
                f'{mockup_type.slug}_preview.png',
                preview_img,
                save=True
            )
            print(f"✓ Created preview for {mockup_type.name}")
        else:
            print(f"✓ {mockup_type.name} already has a preview image")
    
    print("\nDone! All mockup types now have preview images.")

if __name__ == '__main__':
    main()
