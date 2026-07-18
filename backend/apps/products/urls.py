from django.urls import path
from .views import (
    ProductListView,
    ProductCreateView,
    ProductDetailView,
    ProductUpdateView,
    ProductDeleteView,
    MyProductsView,
    PendingProductsView,
    ApproveProductView,
    RejectProductView,
    SellerDashboardView,
)

urlpatterns = [
    path('', ProductListView.as_view(), name='product-list'),
    path('create/', ProductCreateView.as_view(), name='product-create'),
    path('my-products/', MyProductsView.as_view(), name='my-products'),
    path('pending/', PendingProductsView.as_view(), name='pending-products'),
    path('seller/dashboard/', SellerDashboardView.as_view(), name='seller-dashboard'),
    path('<int:pk>/', ProductDetailView.as_view(), name='product-detail'),
    path('<int:pk>/update/', ProductUpdateView.as_view(), name='product-update'),
    path('<int:pk>/delete/', ProductDeleteView.as_view(), name='product-delete'),
    path('<int:pk>/approve/', ApproveProductView.as_view(), name='approve-product'),
    path('<int:pk>/reject/', RejectProductView.as_view(), name='reject-product'),
]