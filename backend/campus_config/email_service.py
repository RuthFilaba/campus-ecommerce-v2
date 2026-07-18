"""
Email Service for Campus E-Commerce
IEEE 830 REQ-17: Email Notifications
Norman's Feedback: Inform users of important updates
"""

from django.core.mail import send_mail
from django.template.loader import render_to_string
from django.utils.html import strip_tags
from django.conf import settings

def send_order_status_email(order, old_status, new_status):
    """
    Send email notification when order status changes
    """
    
    subject = f'Campus E-Commerce - Order #{order.id} Status Update: {new_status.title()}'
    
    # Prepare context for templates
    context = {
        'order': order,
        'old_status': old_status,
        'new_status': new_status,
        'buyer_name': order.buyer.get_full_name() or order.buyer.email,
        'seller_name': order.seller.get_full_name() or order.seller.email,
        'product_name': order.product.name,
        'quantity': order.quantity,
        'total_price': order.total_price,
        'meetup_location': order.meetup_location,
        'meetup_time': order.meetup_time,
        'meetup_notes': order.meetup_notes,
    }
    
    # Create HTML and plain text versions
    try:
        html_message = render_to_string('email/order_status.html', context)
        plain_message = strip_tags(html_message)
    except Exception:
        # Fallback plain text message
        plain_message = f"""
CAMPUS E-COMMERCE - ORDER STATUS UPDATE
========================================

Hello {context['buyer_name']}!

Your order #{order.id} status has been updated to: {new_status.upper()}

ORDER DETAILS:
-------------
Order ID: #{order.id}
Product: {context['product_name']}
Quantity: {context['quantity']}
Total Price: K{context['total_price']}
Order Date: {order.created_at}

"""
        if context['meetup_location']:
            plain_message += f"""
MEETUP INFORMATION:
------------------
Location: {context['meetup_location']}
"""
        if context['meetup_time']:
            plain_message += f"Time: {context['meetup_time']}\n"
        
        plain_message += """

---
Campus E-Commerce - Safe Campus Trading
        """
        html_message = plain_message.replace('\n', '<br>')
    
    try:
        # Send to buyer
        send_mail(
            subject=subject,
            message=plain_message,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[order.buyer.email],
            fail_silently=False,
            html_message=html_message,
        )
        print(f"✅ Order status email sent to {order.buyer.email} for Order #{order.id}")
        
        # Also send to seller for important updates
        if new_status in ['cancelled', 'completed']:
            send_mail(
                subject=subject,
                message=plain_message,
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[order.seller.email],
                fail_silently=False,
                html_message=html_message,
            )
            print(f"✅ Order status email also sent to seller {order.seller.email}")
        
    except Exception as e:
        print(f"⚠️ Order status email error: {e}")


def send_welcome_email(user):
    """
    Send welcome email to new users
    """
    subject = 'Welcome to Campus E-Commerce!'
    
    context = {
        'user': user,
        'name': user.get_full_name() or user.email,
    }
    
    try:
        html_message = render_to_string('email/welcome.html', context)
        plain_message = strip_tags(html_message)
    except Exception:
        plain_message = f"""
CAMPUS E-COMMERCE - WELCOME!
============================

Hello {context['name']}!

Welcome to Campus E-Commerce - Zambia's premier campus marketplace!

Here's what you can do:
- Browse products from fellow students
- List your own items for sale
- Chat directly with buyers and sellers
- Arrange safe campus meetups
- Build your reputation with reviews

Get started today!

---
Campus E-Commerce Team
        """
        html_message = plain_message.replace('\n', '<br>')
    
    try:
        send_mail(
            subject=subject,
            message=plain_message,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[user.email],
            fail_silently=False,
            html_message=html_message,
        )
        print(f"✅ Welcome email sent to {user.email}")
    except Exception as e:
        print(f"⚠️ Welcome email error: {e}")


def send_meetup_reminder(order):
    """
    Send meetup reminder to both parties
    """
    subject = f'Meetup Reminder - Order #{order.id}'
    
    context = {
        'order': order,
        'buyer_name': order.buyer.get_full_name() or order.buyer.email,
        'seller_name': order.seller.get_full_name() or order.seller.email,
        'product_name': order.product.name,
        'meetup_location': order.meetup_location,
        'meetup_time': order.meetup_time,
        'meetup_notes': order.meetup_notes,
    }
    
    try:
        html_message = render_to_string('email/meetup_reminder.html', context)
        plain_message = strip_tags(html_message)
    except Exception:
        plain_message = f"""
CAMPUS E-COMMERCE - MEETUP REMINDER
===================================

Hello {context['buyer_name']} and {context['seller_name']}!

This is a reminder for your meetup regarding: {context['product_name']}

MEETUP DETAILS:
---------------
Location: {context['meetup_location']}
Time: {context['meetup_time']}

Please be on time and stay safe!

---
Campus E-Commerce Team
        """
        html_message = plain_message.replace('\n', '<br>')
    
    try:
        send_mail(
            subject=subject,
            message=plain_message,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[order.buyer.email, order.seller.email],
            fail_silently=False,
            html_message=html_message,
        )
        print(f"✅ Meetup reminder sent for Order #{order.id}")
    except Exception as e:
        print(f"⚠️ Meetup reminder error: {e}")


def send_payment_confirmation_email(payment):
    """
    Send payment confirmation email
    """
    subject = f'Payment Confirmation - Order #{payment.order.id}'
    
    context = {
        'payment': payment,
        'order': payment.order,
        'buyer_name': payment.order.buyer.get_full_name() or payment.order.buyer.email,
        'amount': payment.amount,
        'payment_method': payment.get_payment_method_display(),
        'transaction_reference': payment.transaction_reference,
    }
    
    try:
        html_message = render_to_string('email/payment_confirmation.html', context)
        plain_message = strip_tags(html_message)
    except Exception:
        plain_message = f"""
CAMPUS E-COMMERCE - PAYMENT CONFIRMATION
========================================

Hello {context['buyer_name']}!

Your payment for Order #{payment.order.id} has been confirmed.

PAYMENT DETAILS:
----------------
Amount: K{context['amount']}
Payment Method: {context['payment_method']}
Transaction Reference: {context['transaction_reference']}

Thank you for shopping with Campus E-Commerce!

---
Campus E-Commerce Team
        """
        html_message = plain_message.replace('\n', '<br>')
    
    try:
        send_mail(
            subject=subject,
            message=plain_message,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[payment.order.buyer.email],
            fail_silently=False,
            html_message=html_message,
        )
        print(f"✅ Payment confirmation email sent to {payment.order.buyer.email}")
    except Exception as e:
        print(f"⚠️ Payment confirmation email error: {e}")


def send_order_confirmation_email(order):
    """
    Send order confirmation email when order is created
    """
    subject = f'Order Confirmation - Order #{order.id}'
    
    context = {
        'order': order,
        'buyer_name': order.buyer.get_full_name() or order.buyer.email,
        'product_name': order.product.name,
        'quantity': order.quantity,
        'total_price': order.total_price,
        'meetup_location': order.meetup_location,
    }
    
    try:
        html_message = render_to_string('email/order_confirmation.html', context)
        plain_message = strip_tags(html_message)
    except Exception:
        plain_message = f"""
CAMPUS E-COMMERCE - ORDER CONFIRMATION
======================================

Hello {context['buyer_name']}!

Your order has been confirmed!

ORDER DETAILS:
--------------
Order ID: #{order.id}
Product: {context['product_name']}
Quantity: {context['quantity']}
Total Price: K{context['total_price']}

The seller will contact you soon to arrange meetup.

---
Campus E-Commerce Team
        """
        html_message = plain_message.replace('\n', '<br>')
    
    try:
        send_mail(
            subject=subject,
            message=plain_message,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[order.buyer.email],
            fail_silently=False,
            html_message=html_message,
        )
        print(f"✅ Order confirmation email sent to {order.buyer.email}")
    except Exception as e:
        print(f"⚠️ Order confirmation email error: {e}")


def send_password_reset_email(user, reset_link):
    """
    Send password reset email
    """
    subject = 'Password Reset Request - Campus E-Commerce'
    
    context = {
        'user': user,
        'name': user.get_full_name() or user.email,
        'reset_link': reset_link,
    }
    
    try:
        html_message = render_to_string('email/password_reset.html', context)
        plain_message = strip_tags(html_message)
    except Exception:
        plain_message = f"""
CAMPUS E-COMMERCE - PASSWORD RESET
==================================

Hello {context['name']}!

We received a request to reset your password.

Click the link below to reset your password:
{context['reset_link']}

If you didn't request this, please ignore this email.

---
Campus E-Commerce Team
        """
        html_message = plain_message.replace('\n', '<br>')
    
    try:
        send_mail(
            subject=subject,
            message=plain_message,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[user.email],
            fail_silently=False,
            html_message=html_message,
        )
        print(f"✅ Password reset email sent to {user.email}")
    except Exception as e:
        print(f"⚠️ Password reset email error: {e}")