from django.urls import path
from . import coordinator_views as views

urlpatterns = [
    path('', views.coordinator_dashboard, name='coordinator-dashboard'),
    path('login/', views.coordinator_login, name='coordinator-login'),
    path('logout/', views.coordinator_logout, name='coordinator-logout'),
    path('orders/<int:order_id>/', views.coordinator_order_detail, name='coordinator-order-detail'),
]
