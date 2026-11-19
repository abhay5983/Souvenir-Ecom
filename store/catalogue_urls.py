from django.urls import path

from . import catalogue_views as views


urlpatterns = [
    path('', views.catalogue_manager, name='catalogue-manager'),
    path('login/', views.catalogue_login, name='catalogue-manager-login'),
    path('logout/', views.catalogue_logout, name='catalogue-manager-logout'),
    path('books/new/', views.catalogue_book_create, name='catalogue-manager-book-create'),
    path('books/<int:product_id>/edit/', views.catalogue_book_edit, name='catalogue-manager-book-edit'),
    path('books/<int:product_id>/delete/', views.catalogue_book_delete, name='catalogue-manager-book-delete'),
    path('bulk-action/', views.catalogue_bulk_action, name='catalogue-manager-bulk-action'),
    path('import/', views.catalogue_import, name='catalogue-manager-import'),
    path('template/', views.catalogue_template, name='catalogue-manager-template'),
    path('clear/', views.catalogue_clear, name='catalogue-manager-clear'),
]
