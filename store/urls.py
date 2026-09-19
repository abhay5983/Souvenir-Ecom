from django.urls import path
from . import views

urlpatterns = [
    path('catalogue', views.catalogue, name='store-catalogue'),
    path('digital-resources/student', views.student_resources, name='store-student-resources'),
    path('digital-resources/student/access', views.student_resource_access, name='store-student-resource-access'),
    path('digital-resources/teacher', views.teacher_resource, name='store-teacher-resource'),
    path('digital-resource-requests', views.create_digital_learning_request, name='store-create-digital-request'),
    path('outreach-requests', views.create_outreach_request, name='store-create-outreach-request'),
    path('request-hub', views.request_hub, name='store-request-hub'),
    path('request-hub/<str:source>/<int:request_id>', views.update_hub_request, name='store-update-hub-request'),
    path('integrations/status', views.integration_status, name='store-integration-status'),
    path('shipping/serviceability', views.shipping_quote, name='store-shipping-quote'),
    path('orders', views.create_order, name='store-create-order'),
    path('orders/track', views.track_order, name='store-track-order'),
    path('orders/<str:order_number>/payment-session', views.retry_payment_session, name='store-payment-session'),
    path('hooks/payment/events', views.payment_webhook, name='store-payment-webhook'),
    path('hooks/logistics/events', views.logistics_webhook, name='store-logistics-webhook'),
]
