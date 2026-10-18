from django.urls import path
from .views import CreatePaymentView, VerifyPaymentView, ConfirmPaymentView, OrderPaymentView

urlpatterns = [
    path('create/', CreatePaymentView.as_view(), name='create-payment'),
    path('order/<int:order_id>/', OrderPaymentView.as_view(), name='order-payment'),
    path('<int:payment_id>/verify/', VerifyPaymentView.as_view(), name='verify-payment'),
    path('<int:payment_id>/confirm/', ConfirmPaymentView.as_view(), name='confirm-payment'),
]