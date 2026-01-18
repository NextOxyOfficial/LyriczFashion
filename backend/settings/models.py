from django.db import models
from django.core.validators import URLValidator


class PromotionalBanner(models.Model):
    """Model for managing promotional banners that rotate on the site"""
    text = models.CharField(max_length=200, help_text="Banner text to display (e.g., '🔥 Extra Sale 30% off')")
    link = models.CharField(
        max_length=500, 
        blank=True, 
        null=True,
        help_text="Optional link URL (e.g., '/products' or 'https://example.com')"
    )
    active = models.BooleanField(default=True, help_text="Show this banner on the site")
    order = models.IntegerField(default=0, help_text="Display order (lower numbers show first)")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['order', '-created_at']
        verbose_name = "Promotional Banner"
        verbose_name_plural = "Promotional Banners"

    def __str__(self):
        return f"{self.text[:50]}{'...' if len(self.text) > 50 else ''}"


class SiteSettings(models.Model):
    """Singleton model for site-wide settings"""
    # Contact Information
    hotline = models.CharField(
        max_length=50, 
        default="19008188",
        help_text="Customer service hotline number"
    )
    email = models.EmailField(
        default="support@lyriczfashion.com",
        help_text="Customer support email address"
    )
    address = models.CharField(
        max_length=200,
        default="Dhaka, Bangladesh",
        help_text="Business address"
    )
    
    # Social Media Links
    facebook_url = models.URLField(blank=True, null=True, help_text="Facebook page URL")
    instagram_url = models.URLField(blank=True, null=True, help_text="Instagram profile URL")
    twitter_url = models.URLField(blank=True, null=True, help_text="Twitter profile URL")
    
    # Business Hours
    business_hours = models.TextField(
        blank=True,
        null=True,
        help_text="Business hours (e.g., 'Mon-Fri: 9AM-6PM')"
    )
    
    # Other Settings
    free_shipping_threshold = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=2000.00,
        help_text="Minimum order amount for free shipping (in BDT)"
    )
    shipping_fee = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=100.00,
        help_text="Standard shipping fee (in BDT)"
    )
    
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Site Settings"
        verbose_name_plural = "Site Settings"

    def __str__(self):
        return "Site Settings"

    def save(self, *args, **kwargs):
        # Ensure only one instance exists (singleton pattern)
        self.pk = 1
        super().save(*args, **kwargs)

    def delete(self, *args, **kwargs):
        # Prevent deletion
        pass

    @classmethod
    def load(cls):
        """Get or create the singleton instance"""
        obj, created = cls.objects.get_or_create(pk=1)
        return obj
