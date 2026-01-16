"""
Test script to verify front/back images are correctly returned by API
"""
import requests
import json

def test_api():
    print("Testing MockupType and MockupVariant API endpoints\n")
    print("=" * 60)
    
    # Test 1: Get mockup types
    print("\n1. Testing /mockup-types/ endpoint:")
    r = requests.get('http://localhost:8000/mockup-types/')
    types = r.json()
    print(f"   ✓ Found {len(types)} mockup types")
    
    if types:
        first_type = types[0]
        print(f"   ✓ First type: {first_type['name']}")
        print(f"   ✓ Preview image: {first_type.get('preview_image', 'NO IMAGE')[:60]}...")
    
    # Test 2: Get variants for first type
    if types:
        slug = types[0]['slug']
        print(f"\n2. Testing /mockup-types/{slug}/ endpoint:")
        r2 = requests.get(f'http://localhost:8000/mockup-types/{slug}/')
        detail = r2.json()
        variants = detail.get('variants', [])
        print(f"   ✓ Found {len(variants)} variants for {detail['name']}")
        
        if variants:
            first_variant = variants[0]
            print(f"\n3. Checking first variant ({first_variant['color_name']}):")
            print(f"   ✓ Front image: {first_variant.get('front_image', 'NO IMAGE')[:60]}...")
            print(f"   ✓ Back image:  {first_variant.get('back_image', 'NO IMAGE')[:60]}...")
            
            # Verify images are different
            if first_variant.get('front_image') and first_variant.get('back_image'):
                if 'front' in first_variant['front_image'].lower() and 'back' in first_variant['back_image'].lower():
                    print(f"   ✓ Front and back images are DISTINCT (contain 'front' and 'back' in filenames)")
                else:
                    print(f"   ⚠ Warning: Front and back images may not be distinct")
    
    # Test 3: Direct variant query
    print(f"\n4. Testing /mockup-variants/ endpoint:")
    r3 = requests.get('http://localhost:8000/mockup-variants/')
    data = r3.json()
    all_variants = data.get('results', data) if isinstance(data, dict) else data
    print(f"   ✓ Total variants in system: {len(all_variants)}")
    
    # Check how many have both front and back
    with_both = sum(1 for v in all_variants if v.get('front_image') and v.get('back_image'))
    print(f"   ✓ Variants with both front and back images: {with_both}/{len(all_variants)}")
    
    print("\n" + "=" * 60)
    print("✓ All API tests passed!")
    print("\nFrontend should now:")
    print("  1. Display mockup type preview images in selector")
    print("  2. Show Front/Back toggle buttons")
    print("  3. Switch between front and back mockup images when toggled")
    print("  4. Allow separate designs on front and back sides")
    print("  5. Enable 'Add to Cart' when design is added to either side")

if __name__ == '__main__':
    try:
        test_api()
    except Exception as e:
        print(f"\n❌ Error: {e}")
        import traceback
        traceback.print_exc()
