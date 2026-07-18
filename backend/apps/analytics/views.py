"""
Analytics Dashboard API for Campus E-Commerce
Provides seller analytics for frontend dashboard
"""

from django.db.models import Sum, Avg, Count, Q, F
from django.db.models.functions import TruncDate
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from apps.products.models import Product
from apps.orders.models import Order
from apps.payments.models import Payment
from apps.users.models import User


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def seller_dashboard(request):
    """
    GET /api/analytics/seller-dashboard/
    Returns comprehensive analytics for seller dashboard
    """
    seller = request.user
    
    # Norman's Constraints: Only sellers and admins
    if seller.role not in ['seller', 'admin']:
        return Response({'error': 'Not authorized. Seller access required.'}, status=403)
    
    # Get seller's products
    products = Product.objects.filter(seller=seller)
    
    # Get seller's orders
    orders = Order.objects.filter(seller=seller)
    
    # Completed orders for revenue calculation
    completed_orders = orders.filter(status='completed')
    
    # Revenue calculation
    total_revenue = completed_orders.aggregate(
        total=Sum('total_price')
    )['total'] or 0
    
    # Average rating (from reviews - if reviews app exists)
    try:
        from reviews.models import Review
        avg_rating = Review.objects.filter(seller=seller).aggregate(
            avg=Avg('rating')
        )['avg'] or 0
    except ImportError:
        avg_rating = 0
    
    # Low stock products (5 or less items)
    low_stock = products.filter(stock__lte=5, stock__gt=0).count()
    
    # Out of stock products
    out_of_stock = products.filter(stock=0).count()
    
    # Active products
    active_products = products.filter(is_active=True).count()
    
    # Total product views
    total_views = products.aggregate(total=Sum('views_count'))['total'] or 0
    
    # Completed orders count
    completed_orders_count = completed_orders.count()
    
    # Order status breakdown
    order_status = {
        'pending': orders.filter(status='pending').count(),
        'processing': orders.filter(status='processing').count(),
        'ready': orders.filter(status='ready').count(),
        'completed': completed_orders_count,
        'cancelled': orders.filter(status='cancelled').count(),
    }
    
    # Daily revenue for chart (last 30 days)
    daily_revenue = (
        completed_orders
        .filter(created_at__gte=timezone.now() - timedelta(days=30))
        .annotate(day=TruncDate('created_at'))
        .values('day')
        .annotate(revenue=Sum('total_price'))
        .order_by('day')
    )
    
    # Top 5 selling products
    top_products = (
        orders
        .filter(status='completed')
        .values('product__id', 'product__name')
        .annotate(
            total_sold=Sum('quantity'),
            revenue=Sum('total_price')
        )
        .order_by('-total_sold')[:5]
    )
    
    # Recent 5 orders
    recent_orders = (
        orders
        .select_related('buyer', 'product')
        .order_by('-created_at')[:5]
    )
    
    recent_orders_data = []
    for order in recent_orders:
        recent_orders_data.append({
            'id': order.id,
            'product_name': order.product.name,
            'buyer_name': order.buyer.get_full_name() or order.buyer.email,
            'status': order.status,
            'quantity': order.quantity,
            'total_price': float(order.total_price),
            'created_at': order.created_at.isoformat(),
        })
    
    # Category sales breakdown
    category_sales = {}
    for order in completed_orders:
        cat = order.product.category
        category_sales[cat] = category_sales.get(cat, 0) + float(order.total_price)
    
    category_sales_data = [
        {'category': cat, 'revenue': rev}
        for cat, rev in sorted(category_sales.items(), key=lambda x: x[1], reverse=True)
    ]
    
    # Response
    response = {
        'success': True,
        'summary': {
            'total_products': products.count(),
            'total_sales': orders.count(),
            'total_revenue': float(total_revenue),
            'completed_sales': completed_orders_count,
            'avg_rating': round(avg_rating, 1),
            'low_stock': low_stock,
            'out_of_stock': out_of_stock,
            'active_products': active_products,
            'total_views': total_views,
        },
        'order_status': {
            'counts': order_status,
            'percentages': {
                status: round((count / orders.count() * 100), 1) if orders.count() > 0 else 0
                for status, count in order_status.items()
            }
        },
        'top_products': [
            {
                'name': p['product__name'],
                'total_sold': p['total_sold'],
                'revenue': float(p['revenue'])
            }
            for p in top_products
        ],
        'recent_orders': recent_orders_data,
        'daily_revenue': [
            {'date': item['day'].isoformat(), 'revenue': float(item['revenue'])}
            for item in daily_revenue
        ],
        'category_sales': category_sales_data,
    }
    
    return Response(response)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def sales_report(request):
    """
    GET /api/analytics/sales-report/?days=30&period=daily
    Generate sales report with date filtering
    """
    seller = request.user
    
    if seller.role not in ['seller', 'admin']:
        return Response({'error': 'Not authorized'}, status=403)
    
    days = int(request.query_params.get('days', 30))
    period = request.query_params.get('period', 'daily')
    
    start_date = timezone.now() - timedelta(days=days)
    
    orders = Order.objects.filter(seller=seller, created_at__gte=start_date)
    completed_orders = orders.filter(status='completed')
    
    response = {
        'success': True,
        'report_type': period,
        'period_days': days,
        'start_date': start_date.strftime('%Y-%m-%d'),
        'end_date': timezone.now().strftime('%Y-%m-%d'),
        'summary': {
            'total_orders': orders.count(),
            'completed_orders': completed_orders.count(),
            'cancelled_orders': orders.filter(status='cancelled').count(),
            'total_revenue': float(completed_orders.aggregate(Sum('total_price'))['total_price__sum'] or 0),
            'average_order_value': float(completed_orders.aggregate(Avg('total_price'))['total_price__avg'] or 0),
        },
    }
    
    return Response(response)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def admin_dashboard(request):
    """
    GET /api/analytics/admin-dashboard/
    Platform-wide analytics for admin
    """
    user = request.user
    
    if user.role != 'admin':
        return Response({'error': 'Not authorized. Admin access required.'}, status=403)
    
    # User metrics
    total_users = User.objects.count()
    total_sellers = User.objects.filter(role='seller').count()
    total_buyers = User.objects.filter(role='buyer').count()
    
    # Product metrics
    total_products = Product.objects.count()
    pending_products = Product.objects.filter(is_approved=False, is_submitted=True).count()
    
    # Order metrics
    total_orders = Order.objects.count()
    completed_orders = Order.objects.filter(status='completed')
    total_revenue = completed_orders.aggregate(Sum('total_price'))['total_price__sum'] or 0
    
    # Top sellers
    top_sellers = User.objects.filter(role='seller').annotate(
        total_sales=Sum('sales__total_price', filter=Q(sales__status='completed')),
        order_count=Count('sales', filter=Q(sales__status='completed'))
    ).filter(total_sales__gt=0).order_by('-total_sales')[:5]
    
    response = {
        'success': True,
        'users': {
            'total': total_users,
            'sellers': total_sellers,
            'buyers': total_buyers,
        },
        'products': {
            'total': total_products,
            'pending_approval': pending_products,
        },
        'orders': {
            'total': total_orders,
            'completed': completed_orders.count(),
            'total_revenue': float(total_revenue),
        },
        'top_sellers': [
            {
                'email': seller.email,
                'total_sales': float(seller.total_sales) if seller.total_sales else 0,
                'order_count': seller.order_count,
            }
            for seller in top_sellers
        ],
    }
    
    return Response(response)


# Import timezone and timedelta
from django.utils import timezone
from datetime import timedelta