import requests
import json

try:
    r = requests.get('http://localhost:8000/mockup-types/', timeout=5)
    data = r.json()
    print(f"Status: {r.status_code}")
    print(f"Total mockup types: {len(data)}")
    print("\nFirst 3 mockup types:")
    for i, item in enumerate(data[:3], 1):
        print(f"\n{i}. {item['name']}")
        print(f"   Slug: {item['slug']}")
        print(f"   Price: {item['base_price']}")
        print(f"   Preview: {item.get('preview_image', 'NO IMAGE')}")
except Exception as e:
    print(f"Error: {e}")
