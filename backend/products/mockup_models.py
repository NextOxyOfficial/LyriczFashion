from django.db import models


class MockupType(models.Model):
    """
    Represents a type of apparel (T-Shirt, Hoodie, etc.)
    """
    name = models.CharField(max_length=100, unique=True)  # e.g., "T-Shirt", "Hoodie"
    slug = models.SlugField(max_length=100, unique=True)
    category = models.ForeignKey('Category', on_delete=models.SET_NULL, null=True, blank=True, related_name='mockup_types', help_text="Link to category for filtering")
    base_price = models.DecimalField(max_digits=10, decimal_places=2)
    description = models.TextField(blank=True, null=True)
    preview_image = models.ImageField(upload_to='mockups/previews/', blank=True, null=True, help_text="Preview image for mockup type selector")
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['name']

    def __str__(self):
        return self.name


class MockupVariant(models.Model):
    """
    Represents a specific size and color variant of a mockup type with front and back images
    """
    SIZE_CHOICES = [
        ('XS', 'Extra Small'),
        ('S', 'Small'),
        ('M', 'Medium'),
        ('L', 'Large'),
        ('XL', 'Extra Large'),
        ('XXL', 'Double XL'),
        ('XXXL', 'Triple XL'),
    ]
    
    mockup_type = models.ForeignKey(MockupType, on_delete=models.CASCADE, related_name='variants')
    size = models.CharField(max_length=10, choices=SIZE_CHOICES, default='M', help_text="Size of the product")
    color_name = models.CharField(max_length=50)  # e.g., "White", "Black", "Navy"
    color_hex = models.CharField(max_length=7, blank=True, null=True)  # e.g., "#FFFFFF"
    
    # Front and back mockup images
    front_image = models.ImageField(upload_to='mockups/front/')
    back_image = models.ImageField(upload_to='mockups/back/')
    
    # Optional: thumbnail for quick preview
    thumbnail = models.ImageField(upload_to='mockups/thumbnails/', blank=True, null=True)
    
    price_modifier = models.DecimalField(
        max_digits=10, 
        decimal_places=2, 
        default=0,
        help_text="Additional price for this size/color variant"
    )

    stock = models.IntegerField(default=0, help_text="Available stock for this specific size and color")
    
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['mockup_type', 'size', 'color_name']
        unique_together = ['mockup_type', 'size', 'color_name']

    def __str__(self):
        return f"{self.mockup_type.name} - {self.size} - {self.color_name}"

    @property
    def effective_price(self):
        """Calculate the effective price including the base price and modifier"""
        return self.mockup_type.base_price + self.price_modifier
