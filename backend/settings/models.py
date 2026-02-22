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
    # Branding
    site_name = models.CharField(
        max_length=100,
        default="LyriczFashion",
        help_text="Site name displayed in header and title"
    )
    logo = models.ImageField(
        upload_to='site/',
        blank=True,
        null=True,
        help_text="Site logo (recommended: 200x50px PNG with transparent background)"
    )
    favicon = models.ImageField(
        upload_to='site/',
        blank=True,
        null=True,
        help_text="Site favicon (recommended: 32x32px or 64x64px PNG/ICO)"
    )
    
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
    twitter_url = models.URLField(blank=True, null=True, help_text="Twitter/X profile URL")
    youtube_url = models.URLField(blank=True, null=True, help_text="YouTube channel URL")
    tiktok_url = models.URLField(blank=True, null=True, help_text="TikTok profile URL")

    # SEO & Meta Tags
    meta_title = models.CharField(
        max_length=70,
        blank=True,
        null=True,
        help_text="SEO page title (max 70 chars). Shown in browser tab and Google results."
    )
    meta_description = models.TextField(
        max_length=160,
        blank=True,
        null=True,
        help_text="SEO meta description (max 160 chars). Shown in Google search results."
    )
    meta_keywords = models.CharField(
        max_length=300,
        blank=True,
        null=True,
        help_text="Comma-separated keywords (e.g., 'custom t-shirt, bangladesh, fashion')"
    )

    # Open Graph (Facebook, WhatsApp, LinkedIn link preview)
    og_title = models.CharField(
        max_length=95,
        blank=True,
        null=True,
        help_text="Title shown when link is shared on Facebook/WhatsApp/LinkedIn (max 95 chars)"
    )
    og_description = models.TextField(
        max_length=200,
        blank=True,
        null=True,
        help_text="Description shown when link is shared on social media (max 200 chars)"
    )
    og_image = models.ImageField(
        upload_to='site/og/',
        blank=True,
        null=True,
        help_text="Social share image (recommended: 1200x630px JPG/PNG). Shown on Facebook, WhatsApp, LinkedIn."
    )
    og_image_url = models.URLField(
        max_length=500,
        blank=True,
        null=True,
        help_text="External URL for OG image (use if not uploading)"
    )

    # Twitter Card
    twitter_card_type = models.CharField(
        max_length=20,
        default='summary_large_image',
        choices=[
            ('summary', 'Summary (small image)'),
            ('summary_large_image', 'Summary with Large Image'),
        ],
        help_text="Twitter card display type"
    )
    twitter_site_handle = models.CharField(
        max_length=50,
        blank=True,
        null=True,
        help_text="Twitter @username of the site (e.g., @lyriczfashion)"
    )

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
