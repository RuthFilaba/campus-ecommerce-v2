import django
import os
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from products.models import Category

categories = [
    {'name': 'Food & Drinks', 'slug': 'food', 'order': 1, 'icon': '??'},
    {'name': 'Academic', 'slug': 'books', 'order': 2, 'icon': '??'},
    {'name': 'Fashion', 'slug': 'clothing', 'order': 3, 'icon': '??'},
    {'name': 'Tech & Mobile', 'slug': 'electronics', 'order': 4, 'icon': '??'},
    {'name': 'Marketplace', 'slug': 'other', 'order': 5, 'icon': '??'},
]

for cat_data in categories:
    category, created = Category.objects.get_or_create(
        slug=cat_data['slug'],
        defaults={
            'name': cat_data['name'],
            'order': cat_data['order'],
            'icon': cat_data['icon'],
            'is_active': True
        }
    )
    if created:
        print(f"Added category: {category.name}")
    else:
        print(f"Category already exists: {category.name}")

print("\nAll categories added to database!")
