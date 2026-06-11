"""
Analytics Dashboard for Campus E-Commerce
IEEE 830 REQ-21 to REQ-23: Report Generation
Norman's Visibility: Clear metrics and trends
Shneiderman Rule 8: Reduce cognitive load with summaries
"""

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from django.db.models import Count, Sum, Avg, Q
from django.utils import timezone
from datetime import timedelta
from orders.models import Order
from products.models import Product
from payments.models import Payment
from users.models import User
from reviews.models import Review
from collections import Counter
from rest_framework.permissions import AllowAny
class SellerDashboardView(APIView):
    """
    IEEE 830 REQ-21: Seller performance metrics
    Norman's Visibility: Clear sales data
    Shneiderman Rule 8: Key metrics at a glance
    
    GET /api/analytics/seller-dashboard/
    """
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        user = request.user
        
        # Norman's Constraints: Only sellers and admins
        if user.role not in ['seller', 'admin']:
            return Response({'error': 'Not authorized. Seller or admin access required.'}, status=403)
        
        # Get data based on role
        if user.role == 'admin':
            products = Product.objects.all()
            orders = Order.objects.all()
        else:
            products = Product.objects.filter(seller=user)
            orders = Order.objects.filter(seller=user)
        
        # Basic Metrics (Shneiderman Rule 8)
        total_products = products.count()
        total_orders = orders.count()
        total_revenue = orders.filter(status='completed').aggregate(Sum('total_price'))['total_price__sum'] or 0
        total_sales = orders.filter(status='completed').count()
        
        # Order status breakdown (Norman's Visibility)
        order_status = {
            'pending': orders.filter(status='pending').count(),
            'processing': orders.filter(status='processing').count(),
            'ready': orders.filter(status='ready').count(),
            'completed': orders.filter(status='completed').count(),
            'cancelled': orders.filter(status='cancelled').count(),
        }
        
        # Calculate order status percentages
        if total_orders > 0:
            order_status_percentages = {
                status: round((count / total_orders) * 100, 1)
                for status, count in order_status.items()
            }
        else:
            order_status_percentages = {status: 0 for status in order_status}
        
        # Top selling products
        product_sales = Counter()
        for order in orders.filter(status='completed'):
            product_sales[order.product.id] += order.quantity
        
        top_products_data = []
        for product_id, sold in product_sales.most_common(5):
            try:
                prod = Product.objects.get(id=product_id)
                top_products_data.append({
                    'id': prod.id,
                    'name': prod.name,
                    'price': float(prod.price),
                    'total_sold': sold,
                    'revenue': float(prod.price * sold)
                })
            except Product.DoesNotExist:
                pass
        
        # Recent orders (last 10)
        recent_orders = orders.order_by('-created_at')[:10].values(
            'id', 'buyer__email', 'total_price', 'status', 'created_at'
        )
        
        # Calculate average order value
        avg_order_value = orders.filter(status='completed').aggregate(Avg('total_price'))['total_price__avg'] or 0
        
        # Customer insights
        unique_customers = orders.values('buyer').distinct().count()
        returning_customers = orders.values('buyer').annotate(
            order_count=Count('id')
        ).filter(order_count__gt=1).count()
        
        # Review metrics
        if user.role == 'admin':
            avg_rating = Review.objects.aggregate(Avg('rating'))['rating__avg'] or 0
            total_reviews = Review.objects.count()
        else:
            avg_rating = Review.objects.filter(seller=user).aggregate(Avg('rating'))['rating__avg'] or 0
            total_reviews = Review.objects.filter(seller=user).count()
        
        # Daily revenue for chart (last 30 days)
        thirty_days_ago = timezone.now() - timedelta(days=30)
        daily_revenue = []
        
        for i in range(30):
            day = thirty_days_ago + timedelta(days=i)
            next_day = day + timedelta(days=1)
            revenue = orders.filter(
                status='completed',
                completed_at__gte=day,
                completed_at__lt=next_day
            ).aggregate(Sum('total_price'))['total_price__sum'] or 0
            daily_revenue.append({
                'date': day.strftime('%Y-%m-%d'),
                'revenue': float(revenue)
            })
        
        # Sales by category
        category_sales = {}
        for order in orders.filter(status='completed'):
            cat = order.product.category
            category_sales[cat] = category_sales.get(cat, 0) + order.total_price
        
        category_sales_data = [
            {'category': cat, 'revenue': float(rev)}
            for cat, rev in sorted(category_sales.items(), key=lambda x: x[1], reverse=True)
        ]
        
        return Response({
            'success': True,
            'dashboard_type': 'seller' if user.role == 'seller' else 'admin',
            'summary': {
                'total_products': total_products,
                'total_orders': total_orders,
                'total_revenue': float(total_revenue),
                'total_sales': total_sales,
                'avg_order_value': float(avg_order_value),
                'unique_customers': unique_customers,
                'returning_customers': returning_customers,
                'avg_rating': round(float(avg_rating), 1),
                'total_reviews': total_reviews,
            },
            'order_status': {
                'counts': order_status,
                'percentages': order_status_percentages,
            },
            'top_products': top_products_data,
            'recent_orders': list(recent_orders),
            'daily_revenue': daily_revenue,
            'category_sales': category_sales_data,
        })

class SalesReportView(APIView):
    """
    IEEE 830 REQ-22: Generate sales report
    Norman's Feedback: Date range filtering
    Shneiderman Rule 3: Informative report
    
    GET /api/analytics/sales-report/?days=30&period=weekly
    """
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        user = request.user
        
        if user.role not in ['seller', 'admin']:
            return Response({'error': 'Not authorized'}, status=403)
        
        # Get parameters
        days = int(request.query_params.get('days', 30))
        period = request.query_params.get('period', 'daily')  # daily, weekly, monthly
        
        start_date = timezone.now() - timedelta(days=days)
        
        if user.role == 'admin':
            orders = Order.objects.filter(created_at__gte=start_date)
            completed_orders = Order.objects.filter(status='completed', created_at__gte=start_date)
        else:
            orders = Order.objects.filter(seller=user, created_at__gte=start_date)
            completed_orders = Order.objects.filter(seller=user, status='completed', created_at__gte=start_date)
        
        # Calculate period breakdown
        if period == 'weekly':
            # Group by week
            breakdown = []
            current = start_date
            while current <= timezone.now():
                week_end = current + timedelta(days=7)
                week_orders = completed_orders.filter(created_at__gte=current, created_at__lt=week_end)
                breakdown.append({
                    'period': f"Week of {current.strftime('%Y-%m-%d')}",
                    'orders': week_orders.count(),
                    'revenue': float(week_orders.aggregate(Sum('total_price'))['total_price__sum'] or 0)
                })
                current = week_end
        elif period == 'monthly':
            # Group by month
            months = {}
            for order in completed_orders:
                month_key = order.created_at.strftime('%Y-%m')
                if month_key not in months:
                    months[month_key] = {'orders': 0, 'revenue': 0}
                months[month_key]['orders'] += 1
                months[month_key]['revenue'] += float(order.total_price)
            breakdown = [{'period': k, 'orders': v['orders'], 'revenue': v['revenue']} for k, v in months.items()]
        else:
            # Daily breakdown
            breakdown = []
            current = start_date
            while current <= timezone.now():
                day_orders = completed_orders.filter(created_at__date=current.date())
                breakdown.append({
                    'period': current.strftime('%Y-%m-%d'),
                    'orders': day_orders.count(),
                    'revenue': float(day_orders.aggregate(Sum('total_price'))['total_price__sum'] or 0)
                })
                current += timedelta(days=1)
        
        return Response({
            'success': True,
            'report_type': period,
            'period_days': days,
            'start_date': start_date.strftime('%Y-%m-%d'),
            'end_date': timezone.now().strftime('%Y-%m-%d'),
            'summary': {
                'total_orders': orders.count(),
                'completed_orders': completed_orders.count(),
                'cancelled_orders': orders.filter(status='cancelled').count(),
                'pending_orders': orders.filter(status='pending').count(),
                'total_revenue': float(completed_orders.aggregate(Sum('total_price'))['total_price__sum'] or 0),
                'average_order_value': float(completed_orders.aggregate(Avg('total_price'))['total_price__avg'] or 0),
                'conversion_rate': round((completed_orders.count() / orders.count() * 100), 1) if orders.count() > 0 else 0,
            },
            'breakdown': breakdown,
        })

class AdminDashboardView(APIView):
    """
    IEEE 830 REQ-23: Platform-wide analytics
    Norman's Visibility: Complete system overview
    Shneiderman Rule 8: Executive summary
    
    GET /api/analytics/admin-dashboard/
    """
    permission_classes = [IsAdminUser]
    
    def get(self, request):
        # User metrics
        total_users = User.objects.count()
        total_sellers = User.objects.filter(role='seller').count()
        total_buyers = User.objects.filter(role='buyer').count()
        new_users_last_30_days = User.objects.filter(
            created_at__gte=timezone.now() - timedelta(days=30)
        ).count()
        
        # Product metrics
        total_products = Product.objects.count()
        pending_products = Product.objects.filter(is_approved=False, is_submitted=True).count()
        approved_products = Product.objects.filter(is_approved=True).count()
        active_products = Product.objects.filter(is_active=True).count()
        
        # Order metrics
        total_orders = Order.objects.count()
        completed_orders = Order.objects.filter(status='completed').count()
        total_revenue = Order.objects.filter(status='completed').aggregate(Sum('total_price'))['total_price__sum'] or 0
        
        # Payment metrics
        payment_methods = Payment.objects.filter(status='completed').values('payment_method').annotate(
            total=Sum('amount'),
            count=Count('id')
        )
        
        # Top sellers
        top_sellers = User.objects.filter(role='seller').annotate(
            total_sales=Sum('sales__total_price', filter=Q(sales__status='completed')),
            order_count=Count('sales', filter=Q(sales__status='completed'))
        ).filter(total_sales__gt=0).order_by('-total_sales')[:5].values(
            'id', 'email', 'first_name', 'last_name', 'total_sales', 'order_count', 'rating'
        )
        
        # Monthly revenue for chart (last 12 months)
        monthly_revenue = []
        now = timezone.now()
        
        for i in range(12):
            month = now.replace(day=1) - timedelta(days=30 * i)
            revenue = Order.objects.filter(
                status='completed',
                completed_at__year=month.year,
                completed_at__month=month.month
            ).aggregate(Sum('total_price'))['total_price__sum'] or 0
            monthly_revenue.insert(0, {
                'month': month.strftime('%B %Y'),
                'revenue': float(revenue)
            })
        
        return Response({
            'success': True,
            'users': {
                'total': total_users,
                'sellers': total_sellers,
                'buyers': total_buyers,
                'new_last_30_days': new_users_last_30_days,
            },
            'products': {
                'total': total_products,
                'pending_approval': pending_products,
                'approved': approved_products,
                'active': active_products,
            },
            'orders': {
                'total': total_orders,
                'completed': completed_orders,
                'completion_rate': round((completed_orders / total_orders * 100), 1) if total_orders > 0 else 0,
                'total_revenue': float(total_revenue),
            },
            'payments': {
                'by_method': list(payment_methods),
            },
            'top_sellers': list(top_sellers),
            'monthly_revenue': monthly_revenue,
        })
    
    