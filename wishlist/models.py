from django.db import models
from django.conf import settings
from products.models import Product

class Wishlist(models.Model):
    """
    Wishlist for users to save favorite products
    Shneiderman Rule 8: Reduce memory load - save items for later
    Norman's Affordance: Clear save/favorite action
    """
    
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL, 
        on_delete=models.CASCADE, 
        related_name='wishlist'
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"Wishlist for {self.user.email}"
    
    @property
    def total_items(self):
        return self.items.count()
    
    def add_product(self, product):
        """Add product to wishlist"""
        wishlist_item, created = WishlistItem.objects.get_or_create(
            wishlist=self,
            product=product
        )
        return created
    
    def remove_product(self, product):
        """Remove product from wishlist"""
        WishlistItem.objects.filter(wishlist=self, product=product).delete()
    
    def has_product(self, product):
        """Check if product is in wishlist"""
        return WishlistItem.objects.filter(wishlist=self, product=product).exists()
    
    def clear(self):
        """Clear all items from wishlist"""
        self.items.all().delete()

class WishlistItem(models.Model):
    """
    Individual item in wishlist
    """
    
    wishlist = models.ForeignKey(
        Wishlist, 
        on_delete=models.CASCADE, 
        related_name='items'
    )
    product = models.ForeignKey(
        Product, 
        on_delete=models.CASCADE,
        related_name='wishlisted_by'
    )
    added_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        unique_together = ['wishlist', 'product']
        ordering = ['-added_at']
    
    def __str__(self):
        return f"{self.product.name} in {self.wishlist.user.email}'s wishlist"