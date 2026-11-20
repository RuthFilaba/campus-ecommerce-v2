from django.test import TestCase
from django.contrib.auth import get_user_model
from django.db import transaction
from apps.products.models import Product
from apps.orders.models import Order, OrderHistory
from apps.payments.models import Payment

User = get_user_model()

class ACIDTransactionTests(TestCase):
    def setUp(self):
        self.seller = User.objects.create_user(
            email='seller_acid@test.com',
            password='Password123!',
            first_name='Seller',
            last_name='User',
            role='seller'
        )
        self.buyer = User.objects.create_user(
            email='buyer_acid@test.com',
            password='Password123!',
            first_name='Buyer',
            last_name='User',
            role='buyer'
        )
        self.product = Product.objects.create(
            seller=self.seller,
            name='Test Textbook',
            description='Test book description',
            price=150.00,
            stock=10,
            category='academic',
            condition='good',
            is_active=True,
            is_approved=True
        )

    def test_successful_multi_step_order_transaction_commits_atomically(self):
        """Verify atomic commit across Product stock, Order creation, and OrderHistory."""
        initial_stock = self.product.stock
        order_qty = 2

        with transaction.atomic():
            product = Product.objects.select_for_update().get(id=self.product.id)
            order = Order.objects.create(
                buyer=self.buyer,
                seller=product.seller,
                product=product,
                quantity=order_qty,
                unit_price=product.price
            )
            product.stock -= order_qty
            product.save()

            OrderHistory.objects.create(
                order=order,
                old_status='',
                new_status='pending',
                changed_by=self.buyer,
                notes='Order created by buyer'
            )

        self.product.refresh_from_db()
        self.assertEqual(self.product.stock, initial_stock - order_qty)
        self.assertTrue(Order.objects.filter(id=order.id).exists())
        self.assertEqual(OrderHistory.objects.filter(order=order).count(), 1)

    def test_failed_step_rolls_back_all_preceding_mutations(self):
        """Verify seamless rollback: if a subsequent step fails, order, stock, and history mutations roll back."""
        initial_stock = self.product.stock
        initial_order_count = Order.objects.count()
        initial_history_count = OrderHistory.objects.count()

        with self.assertRaises(RuntimeError):
            with transaction.atomic():
                product = Product.objects.select_for_update().get(id=self.product.id)
                order = Order.objects.create(
                    buyer=self.buyer,
                    seller=product.seller,
                    product=product,
                    quantity=3,
                    unit_price=product.price
                )
                product.stock -= 3
                product.save()

                OrderHistory.objects.create(
                    order=order,
                    old_status='',
                    new_status='pending',
                    changed_by=self.buyer,
                    notes='Order created by buyer'
                )

                # Simulated fatal business error (e.g., third-party service, payment error, invariant breach)
                raise RuntimeError("Simulated mid-transaction failure")

        # Verify state did not mutate (Atomicity / Rollback guarantee)
        self.product.refresh_from_db()
        self.assertEqual(self.product.stock, initial_stock, "Stock decrement must roll back completely")
        self.assertEqual(Order.objects.count(), initial_order_count, "Order creation must roll back")
        self.assertEqual(OrderHistory.objects.count(), initial_history_count, "OrderHistory entries must roll back")

    def test_payment_confirmation_multi_table_atomic_update(self):
        """Verify payment confirmation and order status update occur in an atomic transaction."""
        order = Order.objects.create(
            buyer=self.buyer,
            seller=self.seller,
            product=self.product,
            quantity=1,
            unit_price=self.product.price,
            status='pending'
        )
        payment = Payment.objects.create(
            order=order,
            user=self.buyer,
            amount=order.total_price,
            payment_method='cash',
            status='pending'
        )

        with self.assertRaises(ValueError):
            with transaction.atomic():
                pay = Payment.objects.select_for_update().get(id=payment.id)
                pay.status = 'completed'
                pay.save()

                ord_obj = Order.objects.select_for_update().get(id=order.id)
                ord_obj.status = 'processing'
                ord_obj.save()

                # Simulated error
                raise ValueError("Payment processing exception")

        payment.refresh_from_db()
        order.refresh_from_db()
        self.assertEqual(payment.status, 'pending', "Payment status must stay pending after rollback")
        self.assertEqual(order.status, 'pending', "Order status must stay pending after rollback")
