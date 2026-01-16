# Mockup System Implementation Guide

## Overview
The DesignStudio now has a fully dynamic mockup system with front and back side support. Mockup types and variants are managed through Django Admin and displayed dynamically in the frontend.

## Backend Implementation

### Models

**MockupType** (`products/mockup_models.py`)
- `name`: Mockup type name (e.g., "T-Shirt", "Hoodie")
- `slug`: URL-friendly identifier
- `base_price`: Base price for this mockup type
- `preview_image`: Preview image shown in mockup type selector
- `description`: Optional description
- `is_active`: Enable/disable mockup type

**MockupVariant** (`products/mockup_models.py`)
- `mockup_type`: Foreign key to MockupType
- `color_name`: Color variant name (e.g., "Black", "White")
- `color_hex`: Hex color code (e.g., "#000000")
- `front_image`: **Front view mockup image** (required)
- `back_image`: **Back view mockup image** (required)
- `thumbnail`: Optional thumbnail for quick preview
- `price_modifier`: Additional price for this color variant
- `is_active`: Enable/disable variant

### API Endpoints

1. **List Mockup Types**: `GET /mockup-types/`
   - Returns all active mockup types with preview images
   - Includes variant count for each type

2. **Get Mockup Type Detail**: `GET /mockup-types/{slug}/`
   - Returns mockup type with all its variants
   - Includes front_image, back_image for each variant

3. **List Mockup Variants**: `GET /mockup-variants/`
   - Returns all active variants
   - Filter by mockup type: `?mockup_type={slug}`
   - Filter by color: `?color={color_name}`

4. **Get Available Colors**: `GET /mockup-variants/colors/`
   - Returns distinct color names and hex codes

### Django Admin

**Accessing Admin**:
1. Go to `http://localhost:8000/admin/`
2. Login with superuser credentials
3. Navigate to "Mockup Types" or "Mockup Variants"

**Adding a New Mockup Type**:
1. Click "Add Mockup Type"
2. Fill in:
   - Name (e.g., "Hoodie")
   - Slug (auto-generated from name)
   - Base Price (e.g., 1299)
   - Preview Image (upload a preview image for the selector)
3. Add variants inline:
   - Color Name (e.g., "Black")
   - Color Hex (e.g., "#000000")
   - **Front Image** (upload front view)
   - **Back Image** (upload back view)
   - Thumbnail (optional)
   - Price Modifier (e.g., 0 or 100)
4. Save

**Editing Mockup Variants**:
1. Go to "Mockup Variants" in admin
2. Select a variant to edit
3. Upload new front_image or back_image
4. Save changes

### Image Requirements

**Preview Images** (for MockupType):
- Recommended size: 400x400px
- Format: PNG with transparent background
- Shows the mockup type icon/silhouette

**Front/Back Images** (for MockupVariant):
- Recommended size: 800x800px
- Format: PNG
- Front image should clearly show the front view
- Back image should clearly show the back view
- Images should be color-accurate to the variant's color_hex

## Frontend Implementation

### DesignStudio Features

**1. Mockup Type Selection**
- Displays all active mockup types with preview images
- Shows name and base price
- Clicking selects the mockup type

**2. Color Selection**
- Dropdown shows all available colors for selected mockup type
- Automatically loads the corresponding variant

**3. Front/Back Toggle**
- Two buttons: "Front Side" and "Back Side"
- Switches between front_image and back_image
- **Each side has independent designs**:
  - Front side can have different logo/text than back side
  - Position, scale, rotation are saved per side

**4. Design Customization**
- Upload logo (separate for front and back)
- Add custom text (separate for front and back)
- Adjust position, scale, rotation
- Per-character text coloring

**5. Add to Cart**
- Enabled when at least one side has a design
- Creates custom product with design data
- Saves front and back design configurations

### State Management

The frontend maintains separate state for front and back sides:

```typescript
// Front side states
const [frontLogoFile, setFrontLogoFile] = useState<File | null>(null)
const [frontCustomText, setFrontCustomText] = useState('')
const [frontImagePos, setFrontImagePos] = useState({ x: 400, y: 320 })
// ... more front states

// Back side states
const [backLogoFile, setBackLogoFile] = useState<File | null>(null)
const [backCustomText, setBackCustomText] = useState('')
const [backImagePos, setBackImagePos] = useState({ x: 400, y: 320 })
// ... more back states

// Active side toggle
const [activeSide, setActiveSide] = useState<'front' | 'back'>('front')
```

### Image URL Handling

The `variantImageUrl` helper function selects the correct image:

```typescript
const variantImageUrl = (variant: MockupVariant | null, side: 'front' | 'back') => {
  if (!variant) return ''
  const preferred = side === 'front' ? variant.front_image : variant.back_image
  const fallback = side === 'front' ? variant.back_image : variant.front_image
  return toUrl(preferred || variant.thumbnail || fallback)
}
```

## Testing

### Backend Tests

Run the test script:
```bash
cd backend
python test_frontend_backend.py
```

Expected output:
- ✓ All mockup types have preview images
- ✓ All variants have both front and back images
- ✓ Front and back images are distinct

### Frontend Testing

1. **Select Mockup Type**:
   - Preview images should display in selector
   - Clicking should load the mockup

2. **Select Color**:
   - Dropdown should show available colors
   - Selecting should update the mockup image

3. **Toggle Front/Back**:
   - Click "Front Side" → should show front_image
   - Click "Back Side" → should show back_image
   - Images should be visibly different (front has "FRONT" label, back has "BACK" label)

4. **Add Designs**:
   - Upload logo on front → should only appear on front
   - Switch to back → should be empty
   - Upload different logo on back → should only appear on back
   - Switch back to front → original front logo should still be there

5. **Add to Cart**:
   - Button should be disabled when no design
   - Button should enable when design added to either side
   - Clicking should create custom product and add to cart

## Dummy Data

The system includes 48 pre-generated mockup variants:

**Mockup Types** (7):
- Hoodie (৳1299)
- Long Sleeve (৳899)
- Polo Shirt (৳999)
- Sweatshirt (৳1199)
- T-Shirt (৳699)
- Tank Top (৳499)
- Tshirt (৳500)

**Colors per Type** (8):
- Black (#000000)
- Forest Green (#228B22)
- Heather Grey (#B0B0B0)
- Maroon (#800000)
- Navy (#000080)
- Red (#FF0000)
- Royal Blue (#4169E1)
- White (#FFFFFF)

**Image Features**:
- Front images have green "FRONT" label
- Back images have red "BACK" label
- Hoodies have kangaroo pocket on front
- Polo shirts have collar and buttons on front
- All images are color-accurate to variant color

## Scripts

**Create/Update Mockup Images**:
```bash
cd backend
python improve_variant_images.py
```

This script:
- Creates front and back images for all variants
- Makes front/back visually distinct
- Adds color-coded labels
- Saves images to media/mockups/front/ and media/mockups/back/

## Troubleshooting

**Issue**: Mockup images not showing
- Check: Backend server running on port 8000
- Check: MEDIA_URL and MEDIA_ROOT configured in settings.py
- Check: Static file serving enabled in urls.py
- Check: Variants have front_image and back_image in database

**Issue**: Front and back images look the same
- Run: `python improve_variant_images.py` to regenerate with distinct labels

**Issue**: Add to Cart button disabled
- Check: At least one side has a design (logo or text)
- Check: Mockup type and color selected
- Check: User is logged in

## Future Enhancements

- [ ] Add more mockup types (Jacket, Pants, Cap, etc.)
- [ ] Support for sleeve designs
- [ ] 3D mockup preview
- [ ] Bulk upload for variants
- [ ] Image validation in admin
- [ ] Mockup templates library
