# Order Design Files Access Guide

## Overview
When customers create custom designs in the DesignStudio and place orders, all design files are saved and accessible through the Django Admin panel. This allows admins to download the logo files for printing on t-shirts.

## Accessing Design Files from Orders

### Step 1: Access Django Admin
1. Go to `http://localhost:8000/admin/`
2. Login with your superuser credentials
3. Navigate to **Orders** section

### Step 2: View Order Details
1. Click on any order to view its details
2. Scroll down to the **Order items** section
3. Each order item will display a **Design Files** column

### Design Files Information

The **Design Files** column shows:

#### 📎 Primary Logo File
- **Green highlighted section** with download link
- This is the main logo file uploaded by the customer
- Click **"📥 Download Logo for Printing"** to download the file
- Click **"👁️ View"** to preview the logo in browser
- **This is the file you need for printing on t-shirts**

#### 🖼️ Design Preview
- Shows the complete mockup preview with the design applied
- Click **"📥 Download"** to download the preview image
- Click **"👁️ View"** to see how the final product should look
- Useful for reference when printing

#### 📋 Product Details
- **Mockup Type**: T-Shirt, Hoodie, Long Sleeve, etc.
- **Size**: XS, S, M, L, XL, XXL
- **Color**: Black, White, Navy, etc.

#### 🎨 Design Sides
Shows which sides have designs:

**✓ FRONT: Logo + Text "Hello"**
- Indicates the front side has both a logo and text
- Shows the text content (first 30 characters)

**✓ BACK: Logo**
- Indicates the back side has a logo

**○ FRONT: Empty**
- Indicates the front side has no design

**○ BACK: Empty**
- Indicates the back side has no design

## Downloading Files for Printing

### For Logo Files
1. In the Order admin, find the order item
2. Look for the green **"📎 Primary Logo File"** section
3. Click **"📥 Download Logo for Printing"**
4. The file will be downloaded to your computer
5. Use this file for printing on the t-shirt

### File Format
- Logo files are typically in **PNG** format
- Files maintain transparency (if uploaded with transparency)
- Files are saved in `media/designs/logos/` directory

### For Preview Reference
1. Click **"📥 Download"** under **"🖼️ Design Preview"**
2. This shows the complete mockup with design applied
3. Use this as a reference for:
   - Design placement
   - Design size/scale
   - Design rotation
   - Color accuracy

## Understanding Design Data

### Front and Back Designs
- Customers can add different designs to front and back sides
- The **Design Sides** section shows what's on each side
- **Logo**: Customer uploaded an image file
- **Text**: Customer added custom text

### Design Information Stored
For each side (front/back), the system stores:
- Whether a logo is present
- Whether text is present
- Logo placement (position, scale, rotation)
- Text content and styling (color, font, per-character colors)
- Text placement (position, scale, rotation)

## Printing Workflow

### Recommended Steps:
1. **View the order** in Django Admin
2. **Download the logo file** (green section)
3. **Download the preview** for reference
4. **Check the Design Sides** section to know:
   - Which sides need printing (front/back)
   - What's on each side (logo/text)
5. **Note the product details**:
   - Mockup type (T-Shirt, Hoodie, etc.)
   - Size (M, L, XL, etc.)
   - Color (Black, White, etc.)
6. **Print the design** on the appropriate garment

### For Text-Only Designs
If the design only has text (no logo file):
- The text content is shown in the **Design Sides** section
- Use the **Design Preview** to see the exact text styling
- Recreate the text design based on the preview image

### For Logo + Text Designs
If the design has both logo and text:
- Download the logo file for the image part
- Check the preview for text placement and styling
- Print both elements according to the preview

## File Storage Locations

### Logo Files
- Path: `media/designs/logos/`
- Accessible via: Order admin → Design Files → Primary Logo File

### Preview Files
- Path: `media/designs/previews/`
- Accessible via: Order admin → Design Files → Design Preview

### Mockup Images
- Path: `media/mockups/front/` and `media/mockups/back/`
- These are the base mockup templates (not customer designs)

## Troubleshooting

### "No design files" message
- This means the product is not a custom design
- It's a regular product from the catalog
- No special printing needed

### Logo file not showing
- Check if the customer actually uploaded a logo
- Look at the **Design Sides** section
- If it shows "Logo" then the file should be present
- If only "Text" is shown, customer only added text

### Can't download file
- Ensure the backend server is running
- Check that MEDIA_URL and MEDIA_ROOT are configured
- Verify the file exists in `media/designs/logos/` directory

## Example Order Scenarios

### Scenario 1: Front Logo Only
```
Design Sides:
✓ FRONT: Logo
○ BACK: Empty
```
**Action**: Download logo, print on front side only

### Scenario 2: Front Text + Back Logo
```
Design Sides:
✓ FRONT: Text "Team Alpha"
✓ BACK: Logo
```
**Action**: Print text on front, download and print logo on back

### Scenario 3: Both Sides with Logo
```
Design Sides:
✓ FRONT: Logo
✓ BACK: Logo
```
**Action**: Download logo (same file used for both sides), print on both front and back

### Scenario 4: Complex Design
```
Design Sides:
✓ FRONT: Logo + Text "Custom Design"
✓ BACK: Text "2024"
```
**Action**: Download logo, print logo + text on front, print text on back

## Additional Notes

- The **primary logo file** is either the front logo or back logo (whichever exists)
- If customer added logos to both sides, only one logo file is saved (they used the same file)
- The **design_data** JSON field contains complete information about placement, rotation, scale
- Use the **preview image** as the authoritative reference for final appearance

## Support

For technical issues:
- Check Django admin logs
- Verify media files are being served correctly
- Ensure file permissions allow reading from media directory
- Contact system administrator if files are missing
