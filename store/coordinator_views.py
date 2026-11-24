from django.contrib import messages
from django.contrib.auth import login, logout
from django.contrib.auth.decorators import user_passes_test
from django.contrib.auth.forms import AuthenticationForm
from django.core.paginator import Paginator
from django.db import transaction
from django.db.models import Q
from django.shortcuts import get_object_or_404, redirect, render
from django.views.decorators.http import require_http_methods, require_POST

from .coordinator_forms import CoordinatorAccountForm, CoordinatorStatusForm
from .models import CoordinatorProfile, GuestOrder, OrderBackgroundJob, OrderStatusHistory, OrderStatusNotification


def _active_coordinator(user):
    if not user.is_authenticated or not user.is_active:
        return False
    try:
        return user.coordinator_profile.is_active
    except CoordinatorProfile.DoesNotExist:
        return False


coordinator_required = user_passes_test(_active_coordinator, login_url='coordinator-login')


def _state_scoped_orders(profile):
    state_query = Q()
    for state in profile.states:
        state_query |= Q(delivery_state__iexact=state)
    if not profile.states:
        return GuestOrder.objects.none()
    return GuestOrder.objects.filter(state_query, payment_status='PAID')


@require_http_methods(['GET', 'POST'])
def coordinator_login(request):
    if _active_coordinator(request.user):
        return redirect('coordinator-dashboard')
    form = AuthenticationForm(request=request, data=request.POST or None)
    if request.method == 'POST' and form.is_valid():
        user = form.get_user()
        if not _active_coordinator(user):
            form.add_error(None, 'This account does not have active coordinator access.')
        else:
            login(request, user)
            return redirect('coordinator-dashboard')
    return render(request, 'coordinator/login.html', {'form': form})


@require_POST
@coordinator_required
def coordinator_logout(request):
    logout(request)
    return redirect('coordinator-login')


@coordinator_required
def coordinator_dashboard(request):
    profile = request.user.coordinator_profile
    orders = _state_scoped_orders(profile).prefetch_related('items').order_by('-created_at')
    query = request.GET.get('q', '').strip()
    status = request.GET.get('status', '').strip()
    state = request.GET.get('state', '').strip()
    if query:
        orders = orders.filter(
            Q(order_number__icontains=query) | Q(customer_name__icontains=query) |
            Q(mobile__icontains=query) | Q(courier_id__icontains=query)
        )
    if status:
        orders = orders.filter(shipment_status=status)
    if state and state in profile.states:
        orders = orders.filter(delivery_state__iexact=state)
    counts = _state_scoped_orders(profile)
    paginator = Paginator(orders, 30)
    return render(request, 'coordinator/dashboard.html', {
        'profile': profile, 'page': paginator.get_page(request.GET.get('page')),
        'query': query, 'selected_status': status, 'selected_state': state,
        'status_choices': GuestOrder.SHIPMENT_STATUSES,
        'summary': {
            'total': counts.count(),
            'new': counts.filter(shipment_status__in=['NOT_CREATED', 'CREATED']).count(),
            'moving': counts.filter(shipment_status__in=['AWB_ASSIGNED', 'PICKUP_SCHEDULED', 'SHIPPED', 'IN_TRANSIT', 'OUT_FOR_DELIVERY']).count(),
            'attention': counts.filter(shipment_status__in=['DELAYED', 'UNDELIVERED', 'RTO_INITIATED']).count(),
        },
    })


@coordinator_required
@require_http_methods(['GET', 'POST'])
def coordinator_order_detail(request, order_id):
    profile = request.user.coordinator_profile
    order = get_object_or_404(
        _state_scoped_orders(profile).prefetch_related('items', 'status_history__changed_by'), pk=order_id,
    )
    form = CoordinatorStatusForm(request.POST or None, order=order)
    if request.method == 'POST' and form.is_valid():
        with transaction.atomic():
            locked = get_object_or_404(_state_scoped_orders(profile).select_for_update(), pk=order.pk)
            status = form.cleaned_data['shipment_status']
            locked.shipment_status = status
            locked.courier_name = 'Trackon' if form.cleaned_data['courier_id'].strip() else ''
            locked.courier_id = form.cleaned_data['courier_id'].strip()
            locked.estimated_delivery_date = form.cleaned_data['estimated_delivery_date']
            if status == 'DELIVERED':
                locked.order_status = 'COMPLETED'
            elif locked.order_status == 'PAID':
                locked.order_status = 'PROCESSING'
            locked.save(update_fields=[
                'shipment_status', 'courier_name', 'courier_id', 'estimated_delivery_date',
                'order_status', 'updated_at',
            ])
            history = OrderStatusHistory.objects.create(
                order=locked, shipment_status=status,
                customer_message=form.cleaned_data['customer_message'].strip(),
                internal_note=form.cleaned_data['internal_note'].strip(), changed_by=request.user,
            )
            if request.POST.get('action') == 'save_send':
                notification = OrderStatusNotification.objects.create(
                    status_history=history, recipient_email=locked.email.strip().lower(),
                )
                OrderBackgroundJob.objects.create(
                    order=locked, status_history=history, job_type='SEND_STATUS_EMAIL',
                )
        status_label = dict(GuestOrder.SHIPMENT_STATUSES)[status]
        if request.POST.get('action') == 'save_send':
            messages.success(request, f'{order.order_number} was updated to {status_label}. The customer email is queued.')
        else:
            messages.success(request, f'{order.order_number} was updated to {status_label}. No customer email was sent.')
        return redirect('coordinator-order-detail', order_id=order.pk)
    return render(request, 'coordinator/order_detail.html', {
        'order': order, 'form': form,
        'trackon_url': 'https://www.trackon.in/data/SingleShipment',
    })


def _admin_user(user):
    return user.is_authenticated and user.is_active and user.is_staff and user.is_superuser


admin_required = user_passes_test(_admin_user, login_url='catalogue-manager-login')


@admin_required
def coordinator_accounts(request):
    profiles = CoordinatorProfile.objects.select_related('user').order_by('user__first_name', 'user__username')
    return render(request, 'catalogue_manager/coordinators.html', {'profiles': profiles})


@admin_required
@require_http_methods(['GET', 'POST'])
def coordinator_account_create(request):
    form = CoordinatorAccountForm(request.POST or None)
    if request.method == 'POST' and form.is_valid():
        profile = form.save()
        messages.success(request, f'Coordinator account for {profile} was created.')
        return redirect('catalogue-manager-coordinators')
    return render(request, 'catalogue_manager/coordinator_form.html', {'form': form, 'profile': None})


@admin_required
@require_http_methods(['GET', 'POST'])
def coordinator_account_edit(request, profile_id):
    profile = get_object_or_404(CoordinatorProfile.objects.select_related('user'), pk=profile_id)
    form = CoordinatorAccountForm(request.POST or None, profile=profile)
    if request.method == 'POST' and form.is_valid():
        profile = form.save()
        messages.success(request, f'Coordinator account for {profile} was updated.')
        return redirect('catalogue-manager-coordinators')
    return render(request, 'catalogue_manager/coordinator_form.html', {'form': form, 'profile': profile})
