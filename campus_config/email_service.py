from django.core.mail import send_mail
from django.conf import settings
from django.template.loader import render_to_string
from django.utils.html import strip_tags

def send_order_status_email(order, old_status, new_status):
    """Send email notification on order status change - REQ-17"""
    subject = f'Order #{order.id} Status Update: {new_status.title()}'
    
    context = {
        'order_id': order.id,
        'buyer_name': order.buyer.get_full_name() or order.buyer.email,
        'seller_name': order.seller.get_full_name() or order.seller.email,
        'product_name': order.product.name,
        'quantity': order.quantity,
        'total_price': order.total_price,
        'status': new_status,
        'status_display': dict(order.STATUS_CHOICES).get(new_status, new_status),
        'created_at': order.created_at.strftime('%Y-%m-%d %H:%M'),
        'meetup_location': order.meetup_location,
        'meetup_time': order.meetup_time.strftime('%Y-%m-%d %H:%M') if order.meetup_time else None,
        'site_url': 'http://localhost:8000',
    }
    
    html_message = render_to_string('email/order_status.html', context)
    plain_message = strip_tags(html_message)
    
    # Send to buyer
    send_mail(
        subject,
        plain_message,
        settings.DEFAULT_FROM_EMAIL,
        [order.buyer.email],
        fail_silently=False,
        html_message=html_message,
    )
    
    # Also send to seller
    send_mail(
        subject,
        plain_message,
        settings.DEFAULT_FROM_EMAIL,
        [order.seller.email],
        fail_silently=False,
        html_message=html_message,
    )

def send_welcome_email(user):
    """Send welcome email on registration"""
    subject = f'Welcome to Campus E-Commerce, {user.get_full_name()}!'
    
    context = {
        'user_name': user.get_full_name() or user.email,
        'role': user.role,
        'site_url': 'http://localhost:8000',
    }
    
    html_message = render_to_string('email/welcome.html', context)
    plain_message = strip_tags(html_message)
    
    send_mail(
        subject,
        plain_message,
        settings.DEFAULT_FROM_EMAIL,
        [user.email],
        fail_silently=False,
        html_message=html_message,
    )

def send_payment_confirmation_email(payment):
    """Send payment confirmation email"""
    subject = f'Payment Confirmed for Order #{payment.order.id}'
    
    context = {
        'user_name': payment.user.get_full_name() or payment.user.email,
        'order_id': payment.order.id,
        'amount': payment.amount,
        'payment_method': payment.get_payment_method_display(),
        'transaction_reference': payment.transaction_reference,
        'paid_at': payment.paid_at.strftime('%Y-%m-%d %H:%M') if payment.paid_at else 'N/A',
        'site_url': 'http://localhost:8000',
    }
    
    html_message = render_to_string('email/payment_confirmation.html', context)
    plain_message = strip_tags(html_message)
    
    send_mail(
        subject,
        plain_message,
        settings.DEFAULT_FROM_EMAIL,
        [payment.user.email],
        fail_silently=False,
        html_message=html_message,
    )
