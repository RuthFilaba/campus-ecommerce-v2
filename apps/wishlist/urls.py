from django.urls import path
from .views import (
    WishlistView, AddToWishlistView, RemoveFromWishlistView,
    CheckInWishlistView, ClearWishlistView
)

urlpatterns = [
    path('', WishlistView.as_view(), name='apps.wishlist'),
    path('add/', AddToWishlistView.as_view(), name='add-to-wishlist'),
    path('remove/', RemoveFromWishlistView.as_view(), name='remove-from-wishlist'),
    path('check/<int:product_id>/', CheckInWishlistView.as_view(), name='check-in-wishlist'),
    path('clear/', ClearWishlistView.as_view(), name='clear-wishlist'),
]