from django.contrib import messages
from django.contrib.auth import login, logout
from django.contrib.auth.decorators import user_passes_test
from django.contrib.auth.forms import AuthenticationForm
from django.core.exceptions import PermissionDenied, ValidationError
from django.core.paginator import Paginator
from django.db import transaction
from django.db.models import Q
from django.http import HttpResponse
from django.shortcuts import get_object_or_404, redirect, render
from django.urls import reverse
from django.views.decorators.http import require_http_methods, require_POST

from .catalog_import import import_catalogue, template_bytes
from .catalogue_forms import CatalogueBookForm
from .models import DigitalResource, Product


def _is_catalogue_manager(user):
    return user.is_authenticated and user.is_active and user.is_staff


manager_required = user_passes_test(_is_catalogue_manager, login_url='catalogue-manager-login')


def _require_permission(request, permission):
    if not request.user.has_perm(permission):
        raise PermissionDenied


@require_http_methods(['GET', 'POST'])
def catalogue_login(request):
    if _is_catalogue_manager(request.user):
        return redirect('catalogue-manager')
    form = AuthenticationForm(request=request, data=request.POST or None)
    if request.method == 'POST' and form.is_valid():
        user = form.get_user()
        if not _is_catalogue_manager(user):
            form.add_error(None, 'This account does not have catalogue administration access.')
        else:
            login(request, user)
            next_url = request.POST.get('next') or request.GET.get('next')
            safe_next = next_url and next_url.startswith('/') and not next_url.startswith('//')
            return redirect(next_url if safe_next else 'catalogue-manager')
    return render(request, 'catalogue_manager/login.html', {'form': form})


@require_POST
@manager_required
def catalogue_logout(request):
    logout(request)
    return redirect('catalogue-manager-login')


@manager_required
def catalogue_manager(request):
    _require_permission(request, 'store.view_product')
    books = Product.objects.select_related('digital_resource').order_by('series_title', 'sort_order', 'title')
    query = request.GET.get('q', '').strip()
    status = request.GET.get('status', 'all')
    subject = request.GET.get('subject', '').strip()
    if query:
        books = books.filter(
            Q(title__icontains=query) | Q(series_title__icontains=query) |
            Q(isbn__icontains=query) | Q(sku__icontains=query)
        )
    if subject:
        books = books.filter(subject=subject)
    if status == 'visible':
        books = books.filter(active=True, public_visibility=True)
    elif status == 'hidden':
        books = books.filter(public_visibility=False)
    elif status == 'inactive':
        books = books.filter(active=False)
    elif status == 'resources':
        books = books.filter(Q(digital_resource__student_url__gt='') | Q(digital_resource__teacher_url__gt=''))
    elif status == 'no-resources':
        books = books.filter(
            Q(digital_resource__isnull=True) |
            (Q(digital_resource__student_url='') & Q(digital_resource__teacher_url=''))
        )
    subjects = Product.objects.exclude(subject='').values_list('subject', flat=True).distinct().order_by('subject')
    total = Product.objects.count()
    visible = Product.objects.filter(active=True, public_visibility=True).count()
    with_resources = DigitalResource.objects.filter(Q(student_url__gt='') | Q(teacher_url__gt='')).count()
    paginator = Paginator(books, 30)
    page = paginator.get_page(request.GET.get('page'))
    return render(request, 'catalogue_manager/index.html', {
        'page': page,
        'query': query,
        'status': status,
        'selected_subject': subject,
        'subjects': subjects,
        'summary': {
            'total': total,
            'visible': visible,
            'hidden': total - visible,
            'resources': with_resources,
        },
        'can_add': request.user.has_perm('store.add_product'),
        'can_change': request.user.has_perm('store.change_product'),
        'can_delete': request.user.has_perm('store.delete_product'),
    })


@manager_required
@require_http_methods(['GET', 'POST'])
def catalogue_book_create(request):
    _require_permission(request, 'store.add_product')
    form = CatalogueBookForm(request.POST or None)
    if request.method == 'POST' and form.is_valid():
        product = form.save()
        messages.success(request, f'“{product.title}” was added to the catalogue.')
        return redirect('catalogue-manager')
    return render(request, 'catalogue_manager/book_form.html', {'form': form, 'book': None})


@manager_required
@require_http_methods(['GET', 'POST'])
def catalogue_book_edit(request, product_id):
    _require_permission(request, 'store.change_product')
    product = get_object_or_404(Product, pk=product_id)
    form = CatalogueBookForm(request.POST or None, instance=product)
    if request.method == 'POST' and form.is_valid():
        product = form.save()
        messages.success(request, f'Changes to “{product.title}” were saved.')
        return redirect('catalogue-manager')
    return render(request, 'catalogue_manager/book_form.html', {'form': form, 'book': product})


@manager_required
@require_POST
def catalogue_book_delete(request, product_id):
    _require_permission(request, 'store.delete_product')
    product = get_object_or_404(Product, pk=product_id)
    title = product.title
    product.delete()
    messages.success(request, f'“{title}” was deleted. Existing order history was retained.')
    return redirect('catalogue-manager')


@manager_required
@require_POST
def catalogue_bulk_action(request):
    ids = request.POST.getlist('selected_books')
    action = request.POST.get('action', '')
    if action == 'save-order':
        _require_permission(request, 'store.change_product')
        requested_orders = {}
        for key, value in request.POST.items():
            if not key.startswith('sort_order_'):
                continue
            try:
                product_id = int(key.removeprefix('sort_order_'))
                sort_order = int(value)
            except (TypeError, ValueError):
                messages.error(request, 'Display order must be a whole number of zero or more.')
                return redirect('catalogue-manager')
            if sort_order < 0 or sort_order > 99999:
                messages.error(request, 'Display order must be between 0 and 99,999.')
                return redirect('catalogue-manager')
            requested_orders[product_id] = sort_order
        products = Product.objects.in_bulk(requested_orders)
        changed = []
        for product_id, product in products.items():
            product.sort_order = requested_orders[product_id]
            changed.append(product)
        if changed:
            Product.objects.bulk_update(changed, ['sort_order'])
        messages.success(request, f'Display order saved for {len(changed)} book(s).')
        return redirect('catalogue-manager')
    action = request.POST.get('bulk_action', '')
    if not ids:
        messages.warning(request, 'Select at least one book first.')
        return redirect('catalogue-manager')
    books = Product.objects.filter(pk__in=ids)
    if action == 'show':
        _require_permission(request, 'store.change_product')
        count = books.update(public_visibility=True, active=True)
        message = f'{count} book(s) published.'
    elif action == 'hide':
        _require_permission(request, 'store.change_product')
        count = books.update(public_visibility=False)
        message = f'{count} book(s) hidden from the store.'
    elif action == 'activate':
        _require_permission(request, 'store.change_product')
        count = books.update(active=True)
        message = f'{count} book(s) activated.'
    elif action == 'deactivate':
        _require_permission(request, 'store.change_product')
        count = books.update(active=False)
        message = f'{count} book(s) deactivated.'
    elif action == 'delete':
        _require_permission(request, 'store.delete_product')
        count = books.count()
        books.delete()
        message = f'{count} book(s) deleted. Existing order history was retained.'
    else:
        messages.error(request, 'Choose a valid bulk action.')
        return redirect('catalogue-manager')
    messages.success(request, message)
    return redirect('catalogue-manager')


@manager_required
@require_http_methods(['GET', 'POST'])
def catalogue_import(request):
    _require_permission(request, 'store.change_product')
    if request.method == 'POST':
        upload = request.FILES.get('catalogue_file')
        if not upload:
            messages.error(request, 'Choose an Excel file to upload.')
        else:
            try:
                result = import_catalogue(upload, replace_catalogue=request.POST.get('replace_catalogue') == 'on')
                messages.success(
                    request,
                    f"Import complete: {result['created']} created, {result['updated']} updated, "
                    f"{result['deactivated']} deactivated.",
                )
                return redirect('catalogue-manager')
            except ValidationError as exc:
                for error_message in exc.messages:
                    messages.error(request, error_message)
    return render(request, 'catalogue_manager/import.html')


@manager_required
def catalogue_template(request):
    _require_permission(request, 'store.view_product')
    response = HttpResponse(
        template_bytes(),
        content_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    )
    response['Content-Disposition'] = 'attachment; filename="souvenir_books_catalogue_template.xlsx"'
    return response


@manager_required
@require_POST
def catalogue_clear(request):
    _require_permission(request, 'store.delete_product')
    if request.POST.get('confirmation', '').strip() != 'DELETE ALL BOOKS':
        messages.error(request, 'Enter DELETE ALL BOOKS exactly to clear the catalogue.')
        return redirect('catalogue-manager')
    with transaction.atomic():
        count = Product.objects.count()
        Product.objects.all().delete()
    messages.success(request, f'Catalogue cleared: {count} book(s) deleted. Existing orders were retained.')
    return redirect('catalogue-manager')
