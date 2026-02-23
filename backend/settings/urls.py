from django.urls import path
from . import views

urlpatterns = [
    path('promotional-banners', views.promotional_banners, name='promotional-banners'),
    path('contact-info', views.contact_info, name='contact-info'),
    path('site-info', views.site_info, name='site-info'),
    path('meta-tags', views.meta_tags, name='meta-tags'),
]
