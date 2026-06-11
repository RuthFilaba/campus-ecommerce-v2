from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response

@api_view(['GET'])
@permission_classes([AllowAny])
def api_root(request):
    return Response({
        'message': 'Welcome to Campus E-Commerce API',
        'version': '1.0.0',
        'endpoints': {
            'Authentication': {
                'register': '/api/users/register/',
                'login': '/api/users/login/',
                'profile': '/api/users/me/',
            },
            'Products': {
                'list': '/api/products/',
                'create': '/api/products/create/ (sellers only)',
                'detail': '/api/products/{id}/',
            },
            'Admin': '/admin/',
        }
    })

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', api_root, name='api-root'),
    path('api/users/', include('users.urls')),
    path('api/products/', include('products.urls')),
    path('api/cart/', include('cart.urls')),
    path('api/orders/', include('orders.urls')),
    path('api/payments/', include('payments.urls')),
    # path('api/chat/', include('chat.urls')),  # Temporarily disabled
    path('api/analytics/', include('analytics.urls')),
    path('api/reviews/', include('reviews.urls')),
    path('api/wishlist/', include('wishlist.urls')),
    path('api/coupons/', include('coupons.urls')),
]
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
