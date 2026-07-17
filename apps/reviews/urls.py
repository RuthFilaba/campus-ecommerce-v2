from django.urls import path
from .views import CreateReviewView, SellerReviewsView, MyReviewsView, SellerRatingView

urlpatterns = [
    path('create/', CreateReviewView.as_view(), name='create-review'),
    path('my-reviews/', MyReviewsView.as_view(), name='my-reviews'),
    path('seller/<int:seller_id>/', SellerReviewsView.as_view(), name='seller-reviews'),
    path('seller/<int:seller_id>/rating/', SellerRatingView.as_view(), name='seller-rating'),
]