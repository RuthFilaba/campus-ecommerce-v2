from django.urls import path
from .views import CreatePaymentView, VerifyPaymentView, ConfirmPaymentView

urlpatterns = [
    path('create/', CreatePaymentView.as_view(), name='create-payment'),
    path('<int:payment_id>/verify/', VerifyPaymentView.as_view(), name='verify-payment'),
    path('<int:payment_id>/confirm/', ConfirmPaymentView.as_view(), name='confirm-payment'),
]