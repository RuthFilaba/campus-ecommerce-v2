from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from django.shortcuts import get_object_or_404
from django.db import models
from apps.orders.models import Order
from .models import Review
from .serializers import ReviewSerializer, CreateReviewSerializer
from apps.users.models import User

class CreateReviewView(APIView):
    """Create review for completed order"""
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request):
        serializer = CreateReviewSerializer(data=request.data)
        if serializer.is_valid():
            # Get the order object from validated data
            order = serializer.validated_data['order']
            
            # Only buyer can review
            if order.buyer != request.user:
                return Response({'error': 'Only the buyer can review this order'}, status=403)
            
            # Only completed orders can be reviewed
            if order.status != 'completed':
                return Response({'error': 'Can only review completed orders'}, status=400)
            
            # Check if already reviewed
            if Review.objects.filter(order=order).exists():
                return Response({'error': 'This order has already been reviewed'}, status=400)
            
            # Create review
            review = Review.objects.create(
                order=order,
                reviewer=request.user,
                seller=order.seller,
                rating=serializer.validated_data['rating'],
                comment=serializer.validated_data.get('comment', ''),
                product_quality=serializer.validated_data.get('product_quality'),
                communication=serializer.validated_data.get('communication'),
                meetup_punctuality=serializer.validated_data.get('meetup_punctuality')
            )
            
            return Response({
                'success': True,
                'message': 'Review submitted successfully!',
                'review': ReviewSerializer(review).data
            }, status=status.HTTP_201_CREATED)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class SellerReviewsView(generics.ListAPIView):
    """Get all reviews for a seller"""
    serializer_class = ReviewSerializer
    permission_classes = [permissions.AllowAny]
    
    def get_queryset(self):
        seller_id = self.kwargs.get('seller_id')
        return Review.objects.filter(seller_id=seller_id, is_approved=True)

class MyReviewsView(generics.ListAPIView):
    """Get reviews written by current user"""
    serializer_class = ReviewSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return Review.objects.filter(reviewer=self.request.user)

class SellerRatingView(APIView):
    """Get seller rating summary"""
    permission_classes = [permissions.AllowAny]
    
    def get(self, request, seller_id):
        from django.db import models
        seller = get_object_or_404(User, id=seller_id)
        reviews = Review.objects.filter(seller=seller, is_approved=True)
        
        if reviews.exists():
            rating_summary = {
                'average_rating': round(reviews.aggregate(models.Avg('rating'))['rating__avg'], 1),
                'total_reviews': reviews.count(),
                '5_stars': reviews.filter(rating=5).count(),
                '4_stars': reviews.filter(rating=4).count(),
                '3_stars': reviews.filter(rating=3).count(),
                '2_stars': reviews.filter(rating=2).count(),
                '1_star': reviews.filter(rating=1).count(),
            }
        else:
            rating_summary = {
                'average_rating': 0,
                'total_reviews': 0,
                '5_stars': 0,
                '4_stars': 0,
                '3_stars': 0,
                '2_stars': 0,
                '1_star': 0,
            }
        
        rating_summary['seller_name'] = seller.get_full_name() or seller.email
        rating_summary['seller_rating'] = float(seller.rating) if seller.rating else 0
        
        return Response(rating_summary)