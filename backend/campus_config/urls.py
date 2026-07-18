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
            'Authentication': '/api/users/',
            'Products': '/api/products/',
            'Cart': '/api/cart/',
            'Orders': '/api/orders/',
            'Payments': '/api/payments/',
            'Chat': '/api/chat/',
            'Analytics': '/api/analytics/',
            'Admin': '/admin/',
        }
    })

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', api_root, name='api-root'),
    path('api/users/', include('apps.users.urls')),
    path('api/products/', include('apps.products.urls')),
    path('api/orders/', include('apps.orders.urls')),
    path('api/cart/', include('apps.cart.urls')),
    path('api/payments/', include('apps.payments.urls')),
    path('api/chat/', include('apps.chat.urls')),
    path('api/analytics/', include('apps.analytics.urls')),
    # path('api/reviews/', include('reviews.urls')),  # Commented out - not implemented yet
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
