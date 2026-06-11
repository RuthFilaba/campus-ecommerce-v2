from django.urls import path
from .views import (
    CreateOrderView, MyOrdersView, MySalesView, OrderDetailView,
    UpdateOrderStatusView, ArrangeMeetupView, CancelOrderView, 
    OrderHistoryView, OrderTimelineView, OrderTrackingDashboardView
)

urlpatterns = [
    path('create/', CreateOrderView.as_view(), name='create-order'),
    path('my-orders/', MyOrdersView.as_view(), name='my-orders'),
    path('my-sales/', MySalesView.as_view(), name='my-sales'),
    path('tracking/', OrderTrackingDashboardView.as_view(), name='order-tracking'),
    path('<int:pk>/', OrderDetailView.as_view(), name='order-detail'),
    path('<int:pk>/status/', UpdateOrderStatusView.as_view(), name='update-status'),
    path('<int:pk>/meetup/', ArrangeMeetupView.as_view(), name='arrange-meetup'),
    path('<int:pk>/cancel/', CancelOrderView.as_view(), name='cancel-order'),
    path('<int:pk>/history/', OrderHistoryView.as_view(), name='order-history'),
    path('<int:pk>/timeline/', OrderTimelineView.as_view(), name='order-timeline'),
]