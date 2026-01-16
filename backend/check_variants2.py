import requests

try:
    r = requests.get('http://localhost:8000/mockup-variants/', timeout=5)
    data = r.json()
    variants = data.get('results', data) if isinstance(data, dict) else data
    
    print(f"Total variants: {len(variants)}\n")
    
    has_images = 0
    no_images = 0
    
    for v in variants[:10]:
        front = v.get('front_image')
        back = v.get('back_image')
        if front and back:
            has_images += 1
            print(f"✓ {v['mockup_type_name']} - {v['color_name']}: HAS IMAGES")
        else:
            no_images += 1
            print(f"✗ {v['mockup_type_name']} - {v['color_name']}: MISSING IMAGES (front={front}, back={back})")
    
    print(f"\nSummary: {has_images} with images, {no_images} without images")
    
except Exception as e:
    print(f"Error: {e}")
