import json, urllib.request
req = urllib.request.Request('https://lyriczfashion.com/api/products/', headers={'Host': 'lyriczfashion.com'})
data = json.loads(urllib.request.urlopen(req).read())
for p in data:
    print(p['id'], '|', p.get('category_name', 'NONE'), '|', p.get('mockup_type_name', 'NONE'), '|', p.get('name', ''))
