# Generated migration for mockup models

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('products', '0001_initial'),
    ]

    operations = [
        migrations.CreateModel(
            name='MockupType',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=100, unique=True)),
                ('slug', models.SlugField(max_length=100, unique=True)),
                ('base_price', models.DecimalField(decimal_places=2, max_digits=10)),
                ('description', models.TextField(blank=True, null=True)),
                ('is_active', models.BooleanField(default=True)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
            ],
            options={
                'ordering': ['name'],
            },
        ),
        migrations.CreateModel(
            name='MockupVariant',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('color_name', models.CharField(max_length=50)),
                ('color_hex', models.CharField(blank=True, max_length=7, null=True)),
                ('front_image', models.ImageField(upload_to='mockups/front/')),
                ('back_image', models.ImageField(upload_to='mockups/back/')),
                ('thumbnail', models.ImageField(blank=True, null=True, upload_to='mockups/thumbnails/')),
                ('price_modifier', models.DecimalField(decimal_places=2, default=0, help_text='Additional price for this color variant', max_digits=10)),
                ('is_active', models.BooleanField(default=True)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('mockup_type', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='variants', to='products.mockuptype')),
            ],
            options={
                'ordering': ['mockup_type', 'color_name'],
                'unique_together': {('mockup_type', 'color_name')},
            },
        ),
    ]
