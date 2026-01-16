"""
Script to create dummy front and back mockup images for all variants
"""
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'lyriczfashion.settings')
django.setup()

from PIL import Image, ImageDraw, ImageFont
from products.mockup_models import MockupVariant
from django.core.files.base import ContentFile
from io import BytesIO

def hex_to_rgb(hex_color):
    """Convert hex color to RGB tuple"""
    if not hex_color or hex_color == 'None':
        return (255, 255, 255)
    hex_color = hex_color.lstrip('#')
    try:
        return tuple(int(hex_color[i:i+2], 16) for i in (0, 2, 4))
    except:
        return (255, 255, 255)

def create_mockup_image(mockup_name, color_name, color_hex, side='front'):
    """Create a mockup image with the specified color"""
    width, height = 800, 800
    
    # Background
    img = Image.new('RGB', (width, height), color='#F9FAFB')
    draw = ImageDraw.Draw(img)
    
    # Get garment color
    garment_color = hex_to_rgb(color_hex) if color_hex else (255, 255, 255)
    
    # Draw t-shirt/hoodie shape based on type
    if 'hoodie' in mockup_name.lower():
        # Hoodie with hood
        # Body
        body = [(200, 250), (600, 250), (600, 750), (200, 750)]
        draw.polygon(body, fill=garment_color, outline='#9CA3AF')
        
        # Hood
        hood = [(250, 150), (550, 150), (600, 250), (200, 250)]
        draw.polygon(hood, fill=garment_color, outline='#9CA3AF')
        
        # Sleeves
        left_sleeve = [(120, 250), (200, 250), (200, 450), (120, 500)]
        right_sleeve = [(600, 250), (680, 250), (680, 500), (600, 450)]
        draw.polygon(left_sleeve, fill=garment_color, outline='#9CA3AF')
        draw.polygon(right_sleeve, fill=garment_color, outline='#9CA3AF')
        
        # Pocket
        if side == 'front':
            pocket = (300, 400, 500, 500)
            draw.rectangle(pocket, outline='#9CA3AF', width=2)
    
    elif 'long sleeve' in mockup_name.lower() or 'longsleeve' in mockup_name.lower():
        # Long sleeve shirt
        body = [(200, 250), (600, 250), (600, 750), (200, 750)]
        draw.polygon(body, fill=garment_color, outline='#9CA3AF')
        
        # Long sleeves
        left_sleeve = [(100, 250), (200, 250), (200, 650), (100, 680)]
        right_sleeve = [(600, 250), (700, 250), (700, 680), (600, 650)]
        draw.polygon(left_sleeve, fill=garment_color, outline='#9CA3AF')
        draw.polygon(right_sleeve, fill=garment_color, outline='#9CA3AF')
        
        # Neck
        if side == 'front':
            neck = (350, 250, 450, 280)
            draw.ellipse(neck, fill='#F9FAFB', outline='#9CA3AF')
    
    elif 'tank' in mockup_name.lower():
        # Tank top (no sleeves)
        body = [(250, 250), (550, 250), (550, 750), (250, 750)]
        draw.polygon(body, fill=garment_color, outline='#9CA3AF')
        
        # Wide neck/straps
        if side == 'front':
            neck = (300, 250, 500, 280)
            draw.ellipse(neck, fill='#F9FAFB', outline='#9CA3AF')
    
    elif 'polo' in mockup_name.lower():
        # Polo shirt with collar
        body = [(200, 250), (600, 250), (600, 750), (200, 750)]
        draw.polygon(body, fill=garment_color, outline='#9CA3AF')
        
        # Short sleeves
        left_sleeve = [(150, 250), (200, 250), (200, 350), (150, 370)]
        right_sleeve = [(600, 250), (650, 250), (650, 370), (600, 350)]
        draw.polygon(left_sleeve, fill=garment_color, outline='#9CA3AF')
        draw.polygon(right_sleeve, fill=garment_color, outline='#9CA3AF')
        
        # Collar and buttons (front only)
        if side == 'front':
            collar_left = [(320, 250), (350, 230), (380, 250)]
            collar_right = [(420, 250), (450, 230), (480, 250)]
            draw.polygon(collar_left, fill=garment_color, outline='#9CA3AF')
            draw.polygon(collar_right, fill=garment_color, outline='#9CA3AF')
            
            # Buttons
            for y in [300, 350, 400]:
                draw.ellipse((395, y, 405, y+10), fill='#6B7280', outline='#4B5563')
    
    else:
        # Default t-shirt
        body = [(200, 250), (600, 250), (600, 750), (200, 750)]
        draw.polygon(body, fill=garment_color, outline='#9CA3AF')
        
        # Short sleeves
        left_sleeve = [(150, 250), (200, 250), (200, 350), (150, 370)]
        right_sleeve = [(600, 250), (650, 250), (650, 370), (600, 350)]
        draw.polygon(left_sleeve, fill=garment_color, outline='#9CA3AF')
        draw.polygon(right_sleeve, fill=garment_color, outline='#9CA3AF')
        
        # Neck
        if side == 'front':
            neck = (350, 250, 450, 280)
            draw.ellipse(neck, fill='#F9FAFB', outline='#9CA3AF')
    
    # Add side label
    try:
        font = ImageFont.truetype("arial.ttf", 20)
    except:
        font = ImageFont.load_default()
    
    label = f"{side.upper()}"
    bbox = draw.textbbox((0, 0), label, font=font)
    text_width = bbox[2] - bbox[0]
    draw.text(((width - text_width) // 2, 50), label, fill='#6B7280', font=font)
    
    # Save to BytesIO
    buffer = BytesIO()
    img.save(buffer, format='PNG')
    buffer.seek(0)
    
    filename = f"{mockup_name.lower().replace(' ', '_')}_{color_name.lower().replace(' ', '_')}_{side}.png"
    return ContentFile(buffer.read(), name=filename)

def main():
    variants = MockupVariant.objects.all()
    print(f"Found {variants.count()} variants\n")
    
    created = 0
    skipped = 0
    
    for variant in variants:
        needs_update = False
        
        if not variant.front_image:
            print(f"Creating front image for {variant.mockup_type.name} - {variant.color_name}...")
            front_img = create_mockup_image(
                variant.mockup_type.name,
                variant.color_name,
                variant.color_hex,
                'front'
            )
            variant.front_image.save(front_img.name, front_img, save=False)
            needs_update = True
            created += 1
        
        if not variant.back_image:
            print(f"Creating back image for {variant.mockup_type.name} - {variant.color_name}...")
            back_img = create_mockup_image(
                variant.mockup_type.name,
                variant.color_name,
                variant.color_hex,
                'back'
            )
            variant.back_image.save(back_img.name, back_img, save=False)
            needs_update = True
            created += 1
        
        if needs_update:
            variant.save()
            print(f"✓ Saved {variant.mockup_type.name} - {variant.color_name}")
        else:
            skipped += 1
    
    print(f"\nDone! Created {created} images, skipped {skipped} existing images.")

if __name__ == '__main__':
    main()
