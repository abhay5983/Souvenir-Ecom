from django.urls import path
from . import views

urlpatterns = [
    path('catalogue', views.catalogue, name='store-catalogue'),
    path('integrations/status', views.integration_status, name='store-integration-status'),
    path('shipping/serviceability', views.shipping_quote, name='store-shipping-quote'),
    path('orders', views.create_order, name='store-create-order'),
    path('orders/track', views.track_order, name='store-track-order'),
    path('orders/<str:order_number>/payment-session', views.retry_payment_session, name='store-payment-session'),
    path('hooks/payment/events', views.payment_webhook, name='store-payment-webhook'),
    path('hooks/logistics/events', views.logistics_webhook, name='store-logistics-webhook'),
]
