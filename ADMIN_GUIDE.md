# Admin Management Guide - LyriczFashion

## Mockup & Variant Management System

### Overview
The system now supports **Size + Color variants** for each mockup product. This allows you to manage inventory at a granular level (e.g., T-Shirt - Medium - Black).

---

## 🎯 How to Add Products

### Step 1: Add Mockup Type (Main Product Category)

1. Go to **Django Admin** → **Mockup Types**
2. Click **"Add Mockup Type"**
3. Fill in:
   - **Name**: e.g., "T-Shirt", "Hoodie", "Mug"
   - **Slug**: Auto-generated from name
   - **Base Price**: Base price for this product type (e.g., 500)
   - **Description**: Optional description
   - **Preview Image**: Upload a preview image for the product selector
   - **Category**: Link to a category for filtering (optional)
   - **Is Active**: Check to make it visible

4. Click **"Save"**

---

### Step 2: Add Size & Color Variants (Inline)

When adding/editing a Mockup Type, you'll see **"Mockup Variants"** section at the bottom.

**For each Size + Color combination, add a variant:**

#### Example: T-Shirt with 3 sizes and 2 colors = 6 variants

| Size | Color | Color Hex | Front Image | Back Image | Price Modifier | Stock |
|------|-------|-----------|-------------|------------|----------------|-------|
| M    | White | #FFFFFF   | front_m_white.png | back_m_white.png | 0 | 50 |
| M    | Black | #000000   | front_m_black.png | back_m_black.png | 0 | 30 |
| L    | White | #FFFFFF   | front_l_white.png | back_l_white.png | 0 | 40 |
| L    | Black | #000000   | front_l_black.png | back_l_black.png | 0 | 25 |
| XL   | White | #FFFFFF   | front_xl_white.png | back_xl_white.png | 50 | 20 |
| XL   | Black | #000000   | front_xl_black.png | back_xl_black.png | 50 | 15 |

**Fields:**
- **Size**: Select from XS, S, M, L, XL, XXL, XXXL
- **Color Name**: e.g., "White", "Black", "Navy"
- **Color Hex**: Color code (e.g., #FFFFFF for white)
- **Front Image**: Upload front mockup image
- **Back Image**: Upload back mockup image
- **Thumbnail**: Optional thumbnail for quick preview
- **Price Modifier**: Additional price for this variant (e.g., +50 for XL)
- **Stock**: Available quantity for this specific size+color
- **Is Active**: Check to make it available

---

## 📊 Managing Stock

### View All Variants
1. Go to **Django Admin** → **Mockup Variants**
2. You'll see a list with:
   - Mockup Type
   - Size
   - Color Name
   - Color Preview (visual color box)
   - Effective Price (Base + Modifier)
   - Stock
   - Status

### Quick Stock Update
- You can edit **Stock** and **Is Active** directly from the list view
- Click on the value, change it, and click "Save" at the bottom

### Filter Variants
Use the right sidebar to filter by:
- **Mockup Type** (e.g., show only T-Shirts)
- **Size** (e.g., show only Medium)
- **Is Active** (show active/inactive)
- **Created Date**

### Search Variants
Use the search box to find:
- By mockup type name (e.g., "T-Shirt")
- By color name (e.g., "Black")
- By size (e.g., "M")

---

## 🛒 How Checkout Works

### Stock Management
1. When a customer adds a product to cart, they select:
   - **Size** (e.g., Medium)
   - **Color** (e.g., Black)

2. System checks stock for that specific variant:
   - **T-Shirt - M - Black**: 30 units available

3. During checkout:
   - Stock is deducted from the specific variant
   - If stock = 0, variant becomes unavailable
   - Other sizes/colors remain available

### Example Flow
```
Customer selects: T-Shirt - Medium - Black
Current Stock: 30 units

Customer orders: 2 units
After checkout: 28 units remaining

If stock reaches 0:
- "Medium - Black" shows as "Out of Stock"
- "Medium - White" still available (separate stock)
- "Large - Black" still available (separate stock)
```

---

## 🔍 Search & Filter System

### Product Search
The search system works with:
- **Product Name**
- **Category Name** (from Mockup Type → Category)
- **Store Name**
- **Designer Name**

### Category Filtering
1. Categories are linked to Mockup Types
2. When users click a category on homepage:
   - Shows all products from that category
   - Filters by category name
   - Works with all size/color variants

---

## 💡 Best Practices

### 1. Consistent Naming
- Use consistent color names: "White", "Black", "Navy" (not "white", "Wht", etc.)
- Use standard size codes: M, L, XL (not "Medium", "Lrg", etc.)

### 2. Image Management
- Upload high-quality mockup images
- Use consistent image dimensions
- Name files clearly: `tshirt_m_white_front.png`

### 3. Stock Management
- Set realistic stock levels
- Update stock regularly
- Mark variants as inactive instead of deleting

### 4. Pricing Strategy
- Set base price on Mockup Type
- Use price modifiers for premium sizes (e.g., +50 for XL)
- Keep modifiers consistent across colors

---

## 📝 Quick Reference

### Available Sizes
- XS (Extra Small)
- S (Small)
- M (Medium) - Default
- L (Large)
- XL (Extra Large)
- XXL (Double XL)
- XXXL (Triple XL)

### Unique Constraint
Each combination must be unique:
- ✅ T-Shirt - M - White
- ✅ T-Shirt - M - Black
- ❌ T-Shirt - M - White (duplicate - not allowed)

### Effective Price Calculation
```
Effective Price = Base Price + Price Modifier

Example:
- Base Price: 500 BDT
- Price Modifier (XL): +50 BDT
- Effective Price: 550 BDT
```

---

## 🚀 Migration Steps

### After updating the code, run:

```bash
# Create migration
python manage.py makemigrations

# Apply migration
python manage.py migrate
```

### For existing variants without size:
All existing variants will default to size "M" (Medium). You should:
1. Review existing variants in admin
2. Update sizes as needed
3. Add additional size variants

---

## 📞 Support

If you need help:
1. Check this guide first
2. Review the Django admin interface
3. Test with a sample product before adding all variants

---

**Last Updated**: January 2026
**Version**: 2.0 - Size + Color Variants
