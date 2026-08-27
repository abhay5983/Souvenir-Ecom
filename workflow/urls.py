from django.urls import path

from . import views

urlpatterns = [
    path("auth/csrf", views.csrf_token),
    path("auth/login", views.login_view),
    path("auth/logout", views.logout_view),
    path("auth/me", views.me_view),
    path("partners/verify", views.verify_partner),
    path("requests", views.requests_view),
    path("requests/<int:request_id>", views.request_detail),
    path("requests/<int:request_id>/action", views.request_action),
]
