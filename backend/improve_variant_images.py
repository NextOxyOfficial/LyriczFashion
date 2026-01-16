"""
Script to improve mockup variant images with more distinct front/back views
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

def create_improved_mockup(mockup_name, color_name, color_hex, side='front'):
    """Create improved mockup with distinct front/back views"""
    width, height = 800, 800
    img = Image.new('RGB', (width, height), color='#F9FAFB')
    draw = ImageDraw.Draw(img)
    
    garment_color = hex_to_rgb(color_hex) if color_hex else (255, 255, 255)
    
    # Draw based on mockup type
    if 'hoodie' in mockup_name.lower():
        if side == 'front':
            # Front view - with hood and pocket
            body = [(200, 250), (600, 250), (600, 750), (200, 750)]
            draw.polygon(body, fill=garment_color, outline='#9CA3AF')
            
            hood = [(250, 150), (550, 150), (600, 250), (200, 250)]
            draw.polygon(hood, fill=garment_color, outline='#9CA3AF')
            
            left_sleeve = [(120, 250), (200, 250), (200, 450), (120, 500)]
            right_sleeve = [(600, 250), (680, 250), (680, 500), (600, 450)]
            draw.polygon(left_sleeve, fill=garment_color, outline='#9CA3AF')
            draw.polygon(right_sleeve, fill=garment_color, outline='#9CA3AF')
            
            # Kangaroo pocket
            pocket = (300, 400, 500, 520)
            draw.rectangle(pocket, outline='#6B7280', width=3)
            
            # Drawstrings
            draw.ellipse((370, 240, 380, 250), fill='#4B5563')
            draw.ellipse((420, 240, 430, 250), fill='#4B5563')
            draw.line([(375, 250), (360, 300)], fill='#4B5563', width=2)
            draw.line([(425, 250), (440, 300)], fill='#4B5563', width=2)
        else:
            # Back view - plain back with hood
            body = [(200, 250), (600, 250), (600, 750), (200, 750)]
            draw.polygon(body, fill=garment_color, outline='#9CA3AF')
            
            hood = [(250, 150), (550, 150), (600, 250), (200, 250)]
            draw.polygon(hood, fill=garment_color, outline='#9CA3AF')
            
            left_sleeve = [(120, 250), (200, 250), (200, 450), (120, 500)]
            right_sleeve = [(600, 250), (680, 250), (680, 500), (600, 450)]
            draw.polygon(left_sleeve, fill=garment_color, outline='#9CA3AF')
            draw.polygon(right_sleeve, fill=garment_color, outline='#9CA3AF')
    
    elif 'long sleeve' in mockup_name.lower():
        body = [(200, 250), (600, 250), (600, 750), (200, 750)]
        draw.polygon(body, fill=garment_color, outline='#9CA3AF')
        
        left_sleeve = [(100, 250), (200, 250), (200, 650), (100, 680)]
        right_sleeve = [(600, 250), (700, 250), (700, 680), (600, 650)]
        draw.polygon(left_sleeve, fill=garment_color, outline='#9CA3AF')
        draw.polygon(right_sleeve, fill=garment_color, outline='#9CA3AF')
        
        if side == 'front':
            neck = (350, 250, 450, 280)
            draw.ellipse(neck, fill='#F9FAFB', outline='#9CA3AF')
    
    elif 'polo' in mockup_name.lower():
        body = [(200, 250), (600, 250), (600, 750), (200, 750)]
        draw.polygon(body, fill=garment_color, outline='#9CA3AF')
        
        left_sleeve = [(150, 250), (200, 250), (200, 350), (150, 370)]
        right_sleeve = [(600, 250), (650, 250), (650, 370), (600, 350)]
        draw.polygon(left_sleeve, fill=garment_color, outline='#9CA3AF')
        draw.polygon(right_sleeve, fill=garment_color, outline='#9CA3AF')
        
        if side == 'front':
            # Collar
            collar_left = [(320, 250), (350, 230), (380, 250)]
            collar_right = [(420, 250), (450, 230), (480, 250)]
            draw.polygon(collar_left, fill=garment_color, outline='#9CA3AF')
            draw.polygon(collar_right, fill=garment_color, outline='#9CA3AF')
            
            # Buttons
            for y in [300, 350, 400]:
                draw.ellipse((395, y, 405, y+10), fill='#6B7280', outline='#4B5563')
    
    elif 'tank' in mockup_name.lower():
        body = [(250, 250), (550, 250), (550, 750), (250, 750)]
        draw.polygon(body, fill=garment_color, outline='#9CA3AF')
        
        if side == 'front':
            neck = (300, 250, 500, 280)
            draw.ellipse(neck, fill='#F9FAFB', outline='#9CA3AF')
    
    else:
        # Default t-shirt
        body = [(200, 250), (600, 250), (600, 750), (200, 750)]
        draw.polygon(body, fill=garment_color, outline='#9CA3AF')
        
        left_sleeve = [(150, 250), (200, 250), (200, 350), (150, 370)]
        right_sleeve = [(600, 250), (650, 250), (650, 370), (600, 350)]
        draw.polygon(left_sleeve, fill=garment_color, outline='#9CA3AF')
        draw.polygon(right_sleeve, fill=garment_color, outline='#9CA3AF')
        
        if side == 'front':
            neck = (350, 250, 450, 280)
            draw.ellipse(neck, fill='#F9FAFB', outline='#9CA3AF')
    
    # Add prominent side label
    try:
        font_large = ImageFont.truetype("arial.ttf", 32)
        font_small = ImageFont.truetype("arial.ttf", 18)
    except:
        font_large = ImageFont.load_default()
        font_small = ImageFont.load_default()
    
    # Side label with background
    label = side.upper()
    bbox = draw.textbbox((0, 0), label, font=font_large)
    text_width = bbox[2] - bbox[0]
    text_height = bbox[3] - bbox[1]
    
    label_x = (width - text_width) // 2
    label_y = 30
    
    # Background for label
    padding = 15
    draw.rectangle(
        (label_x - padding, label_y - padding, label_x + text_width + padding, label_y + text_height + padding),
        fill='#10B981' if side == 'front' else '#EF4444',
        outline='#ffffff',
        width=2
    )
    draw.text((label_x, label_y), label, fill='#ffffff', font=font_large)
    
    # Add color name at bottom
    color_label = f"{color_name}"
    bbox2 = draw.textbbox((0, 0), color_label, font=font_small)
    color_width = bbox2[2] - bbox2[0]
    draw.text(((width - color_width) // 2, height - 40), color_label, fill='#6B7280', font=font_small)
    
    # Save to BytesIO
    buffer = BytesIO()
    img.save(buffer, format='PNG')
    buffer.seek(0)
    
    filename = f"{mockup_name.lower().replace(' ', '_')}_{color_name.lower().replace(' ', '_')}_{side}.png"
    return ContentFile(buffer.read(), name=filename)

def main():
    variants = MockupVariant.objects.all()
    print(f"Updating {variants.count()} variants with improved images\n")
    
    updated = 0
    
    for variant in variants:
        print(f"Updating {variant.mockup_type.name} - {variant.color_name}...")
        
        # Always recreate for improved version
        front_img = create_improved_mockup(
            variant.mockup_type.name,
            variant.color_name,
            variant.color_hex,
            'front'
        )
        variant.front_image.save(front_img.name, front_img, save=False)
        
        back_img = create_improved_mockup(
            variant.mockup_type.name,
            variant.color_name,
            variant.color_hex,
            'back'
        )
        variant.back_image.save(back_img.name, back_img, save=False)
        
        variant.save()
        updated += 1
        print(f"✓ Updated {variant.mockup_type.name} - {variant.color_name}")
    
    print(f"\nDone! Updated {updated} variants with improved front/back images.")

if __name__ == '__main__':
    main()
