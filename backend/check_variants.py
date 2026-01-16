import requests
import json

try:
    # Check mockup types
    r = requests.get('http://localhost:8000/mockup-types/', timeout=5)
    types_data = r.json()
    print(f"Total mockup types: {len(types_data)}\n")
    
    # Check first mockup type's variants
    if types_data:
        first_type = types_data[0]
        print(f"First mockup type: {first_type['name']} (slug: {first_type['slug']})")
        print(f"Variant count: {first_type.get('variant_count', 0)}\n")
        
        # Get detailed info with variants
        detail_url = f"http://localhost:8000/mockup-types/{first_type['slug']}/"
        r2 = requests.get(detail_url, timeout=5)
        detail = r2.json()
        
        print(f"Variants for {detail['name']}:")
        variants = detail.get('variants', [])
        if variants:
            for v in variants[:3]:
                print(f"\n  Color: {v['color_name']}")
                print(f"  Front: {v.get('front_image', 'NO IMAGE')[:80]}")
                print(f"  Back: {v.get('back_image', 'NO IMAGE')[:80]}")
                print(f"  Thumb: {v.get('thumbnail', 'NO IMAGE')[:80] if v.get('thumbnail') else 'None'}")
        else:
            print("  NO VARIANTS FOUND!")
            
        # Check if we can list variants directly
        print("\n\nChecking /mockup-variants/ endpoint:")
        r3 = requests.get(f'http://localhost:8000/mockup-variants/?mockup_type={first_type["slug"]}', timeout=5)
        variants_list = r3.json()
        if isinstance(variants_list, dict):
            variants_list = variants_list.get('results', [])
        print(f"Found {len(variants_list)} variants via /mockup-variants/ endpoint")
        
except Exception as e:
    print(f"Error: {e}")
    import traceback
    traceback.print_exc()
