# Mockup API Documentation

## Overview
Dynamic mockup system that allows uploading front and back images for different apparel types (T-Shirt, Hoodie, etc.) with color variants.

## Database Models

### MockupType
Represents a type of apparel (T-Shirt, Hoodie, Long Sleeve, etc.)

**Fields:**
- `id`: Auto-generated primary key
- `name`: Unique name (e.g., "T-Shirt", "Hoodie")
- `slug`: URL-friendly slug (e.g., "t-shirt", "hoodie")
- `base_price`: Base price for this mockup type
- `description`: Optional description
- `is_active`: Boolean flag
- `created_at`: Timestamp
- `updated_at`: Timestamp

### MockupVariant
Represents a specific color variant with front and back images

**Fields:**
- `id`: Auto-generated primary key
- `mockup_type`: Foreign key to MockupType
- `color_name`: Color name (e.g., "White", "Black", "Navy")
- `color_hex`: Optional hex code (e.g., "#FFFFFF")
- `front_image`: Image file for front view
- `back_image`: Image file for back view
- `thumbnail`: Optional thumbnail image
- `price_modifier`: Additional price for this color (default: 0)
- `effective_price`: Computed property (base_price + price_modifier)
- `is_active`: Boolean flag
- `created_at`: Timestamp
- `updated_at`: Timestamp

**Unique Constraint:** (mockup_type, color_name)

## API Endpoints

### 1. List Mockup Types
**GET** `/api/mockup-types/`

Returns list of all active mockup types (lightweight, without variants).

**Response:**
```json
[
  {
    "id": 1,
    "name": "T-Shirt",
    "slug": "t-shirt",
    "base_price": "699.00",
    "description": "Classic cotton t-shirt",
    "is_active": true,
    "variant_count": 8
  }
]
```

### 2. Get Mockup Type Details
**GET** `/api/mockup-types/{slug}/`

Returns detailed information including all variants.

**Response:**
```json
{
  "id": 1,
  "name": "T-Shirt",
  "slug": "t-shirt",
  "base_price": "699.00",
  "description": "Classic cotton t-shirt",
  "is_active": true,
  "variant_count": 8,
  "variants": [
    {
      "id": 1,
      "mockup_type": 1,
      "mockup_type_name": "T-Shirt",
      "mockup_type_slug": "t-shirt",
      "color_name": "White",
      "color_hex": "#FFFFFF",
      "front_image": "/media/mockups/front/tshirt_white_front.png",
      "back_image": "/media/mockups/back/tshirt_white_back.png",
      "thumbnail": "/media/mockups/thumbnails/tshirt_white_thumb.png",
      "price_modifier": "0.00",
      "effective_price": "699.00",
      "is_active": true,
      "created_at": "2026-01-15T10:00:00Z",
      "updated_at": "2026-01-15T10:00:00Z"
    }
  ]
}
```

### 3. Get Variants for Mockup Type
**GET** `/api/mockup-types/{slug}/variants/`

Returns only the variants for a specific mockup type.

### 4. List All Mockup Variants
**GET** `/api/mockup-variants/`

Returns all active mockup variants across all types.

**Query Parameters:**
- `mockup_type`: Filter by mockup type slug (e.g., `?mockup_type=t-shirt`)
- `color`: Filter by color name (e.g., `?color=white`)

**Response:**
```json
[
  {
    "id": 1,
    "mockup_type": 1,
    "mockup_type_name": "T-Shirt",
    "mockup_type_slug": "t-shirt",
    "color_name": "White",
    "color_hex": "#FFFFFF",
    "front_image": "/media/mockups/front/tshirt_white_front.png",
    "back_image": "/media/mockups/back/tshirt_white_back.png",
    "thumbnail": "/media/mockups/thumbnails/tshirt_white_thumb.png",
    "price_modifier": "0.00",
    "effective_price": "699.00",
    "is_active": true
  }
]
```

### 5. Get Available Colors
**GET** `/api/mockup-variants/colors/`

Returns all unique colors available across all mockup types.

**Response:**
```json
[
  {
    "color_name": "Black",
    "color_hex": "#000000"
  },
  {
    "color_name": "Navy",
    "color_hex": "#001F3F"
  },
  {
    "color_name": "White",
    "color_hex": "#FFFFFF"
  }
]
```

## Admin Panel Management

### Creating Mockup Types
1. Go to Django Admin: `/admin/`
2. Navigate to "Mockup Types"
3. Click "Add Mockup Type"
4. Fill in:
   - Name (e.g., "T-Shirt")
   - Slug (auto-generated from name)
   - Base Price (e.g., 699.00)
   - Description (optional)
5. Add variants inline:
   - Color Name
   - Color Hex (optional)
   - Upload Front Image
   - Upload Back Image
   - Upload Thumbnail (optional)
   - Price Modifier (default: 0)
6. Save

### Managing Variants
Variants can be managed:
1. **Inline** when editing a Mockup Type
2. **Separately** in the "Mockup Variants" section

## Setup Instructions

### 1. Run Migrations
```bash
cd backend
python manage.py migrate
```

### 2. Create Superuser (if not exists)
```bash
python manage.py createsuperuser
```

### 3. Access Admin Panel
Navigate to: `http://localhost:8000/admin/`

### 4. Add Mockup Types and Variants
Use the admin panel to upload mockup images for different types and colors.

## Frontend Integration

### Example: Fetching Mockup Types
```typescript
const response = await fetch('http://localhost:8000/api/mockup-types/');
const mockupTypes = await response.json();
```

### Example: Fetching Variants for T-Shirt
```typescript
const response = await fetch('http://localhost:8000/api/mockup-variants/?mockup_type=t-shirt');
const variants = await response.json();
```

### Example: Getting Specific Color Variant
```typescript
const response = await fetch('http://localhost:8000/api/mockup-variants/?mockup_type=t-shirt&color=white');
const whiteVariant = await response.json()[0];
// Access front_image and back_image URLs
console.log(whiteVariant.front_image);
console.log(whiteVariant.back_image);
```

## Permissions

- **Public Access:** List and retrieve mockup types and variants
- **Admin Only:** Create, update, delete mockup types and variants

## Image Upload Guidelines

### Recommended Specifications:
- **Format:** PNG with transparent background
- **Resolution:** 2000x2000 pixels minimum
- **File Size:** Under 5MB per image
- **Naming Convention:** 
  - Front: `{type}_{color}_front.png` (e.g., `tshirt_white_front.png`)
  - Back: `{type}_{color}_back.png` (e.g., `tshirt_white_back.png`)

### Example Mockup Structure:
```
media/
  mockups/
    front/
      tshirt_white_front.png
      tshirt_black_front.png
      hoodie_white_front.png
    back/
      tshirt_white_back.png
      tshirt_black_back.png
      hoodie_white_back.png
    thumbnails/
      tshirt_white_thumb.png
      tshirt_black_thumb.png
```

## Next Steps

1. **Run migrations** to create database tables
2. **Access admin panel** and create mockup types
3. **Upload images** for front and back views
4. **Update frontend** to fetch mockup data from API instead of hardcoded values
5. **Test** the design studio with dynamic mockups
