from django import forms
from django.contrib.auth import get_user_model
from django.core.exceptions import ValidationError

from .models import CoordinatorProfile, GuestOrder


INDIAN_STATES = (
    'Andaman and Nicobar Islands', 'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar',
    'Chandigarh', 'Chhattisgarh', 'Dadra and Nagar Haveli and Daman and Diu', 'Delhi', 'Goa',
    'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jammu and Kashmir', 'Jharkhand', 'Karnataka',
    'Kerala', 'Ladakh', 'Lakshadweep', 'Madhya Pradesh', 'Maharashtra', 'Manipur',
    'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Puducherry', 'Punjab', 'Rajasthan',
    'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
)


class CoordinatorAccountForm(forms.Form):
    first_name = forms.CharField(max_length=150, label='Full name')
    username = forms.CharField(max_length=150, help_text='Used to sign in. Letters, numbers and @/./+/-/_ only.')
    email = forms.EmailField()
    mobile = forms.RegexField(regex=r'^\d{10}$', error_messages={'invalid': 'Enter a 10-digit mobile number.'})
    states = forms.MultipleChoiceField(
        choices=[(state, state) for state in INDIAN_STATES],
        widget=forms.CheckboxSelectMultiple, label='Assigned states',
    )
    password = forms.CharField(
        widget=forms.PasswordInput, min_length=8, required=False,
        help_text='Required for a new account. Leave blank while editing to keep the current password.',
    )
    is_active = forms.BooleanField(required=False, initial=True, label='Account is active')

    def __init__(self, *args, profile=None, **kwargs):
        self.profile = profile
        if profile and not (args and args[0] is not None) and 'initial' not in kwargs:
            kwargs['initial'] = {
                'first_name': profile.user.get_full_name(), 'username': profile.user.username,
                'email': profile.user.email, 'mobile': profile.mobile, 'states': profile.states,
                'is_active': profile.is_active and profile.user.is_active,
            }
        super().__init__(*args, **kwargs)
        for field in self.fields.values():
            if not isinstance(field.widget, forms.CheckboxSelectMultiple):
                field.widget.attrs.setdefault('class', 'field-control')

    def clean_username(self):
        username = self.cleaned_data['username'].strip()
        users = get_user_model().objects.filter(username__iexact=username)
        if self.profile:
            users = users.exclude(pk=self.profile.user_id)
        if users.exists():
            raise ValidationError('This username is already in use.')
        return username

    def clean(self):
        cleaned = super().clean()
        if not self.profile and not cleaned.get('password'):
            self.add_error('password', 'Set an initial password for the coordinator.')
        return cleaned

    def save(self):
        User = get_user_model()
        profile = self.profile
        user = profile.user if profile else User()
        user.username = self.cleaned_data['username']
        user.first_name = self.cleaned_data['first_name'].strip()
        user.last_name = ''
        user.email = self.cleaned_data['email'].strip().lower()
        user.is_active = self.cleaned_data['is_active']
        user.is_staff = False
        if self.cleaned_data.get('password'):
            user.set_password(self.cleaned_data['password'])
        user.save()
        if not profile:
            profile = CoordinatorProfile(user=user)
        profile.mobile = self.cleaned_data['mobile']
        profile.states = self.cleaned_data['states']
        profile.is_active = self.cleaned_data['is_active']
        profile.save()
        return profile


COORDINATOR_STATUS_CHOICES = tuple(
    choice for choice in GuestOrder.SHIPMENT_STATUSES if choice[0] in {
        'CREATED', 'AWB_ASSIGNED', 'PICKUP_SCHEDULED', 'SHIPPED', 'IN_TRANSIT',
        'OUT_FOR_DELIVERY', 'DELIVERED', 'DELAYED', 'UNDELIVERED', 'RTO_INITIATED',
        'RTO_DELIVERED', 'RETURNED',
    }
)


class CoordinatorStatusForm(forms.Form):
    shipment_status = forms.ChoiceField(choices=COORDINATOR_STATUS_CHOICES, label='New order status')
    courier_id = forms.CharField(max_length=40, required=False, label='Trackon AWB number')
    estimated_delivery_date = forms.DateField(required=False, widget=forms.DateInput(attrs={'type': 'date'}))
    customer_message = forms.CharField(
        max_length=240, required=False, widget=forms.Textarea(attrs={'rows': 2}),
        help_text='Shown to the customer on Track Order.',
    )
    internal_note = forms.CharField(
        required=False, widget=forms.Textarea(attrs={'rows': 3}),
        help_text='Visible only to coordinators and administrators.',
    )

    def __init__(self, *args, order=None, **kwargs):
        if order and not (args and args[0] is not None) and 'initial' not in kwargs:
            kwargs['initial'] = {
                'shipment_status': order.shipment_status if order.shipment_status != 'NOT_CREATED' else 'CREATED',
                'courier_id': order.courier_id,
                'estimated_delivery_date': order.estimated_delivery_date,
            }
        super().__init__(*args, **kwargs)
        for field in self.fields.values():
            field.widget.attrs.setdefault('class', 'field-control')

    def clean(self):
        cleaned = super().clean()
        status = cleaned.get('shipment_status')
        awb = str(cleaned.get('courier_id') or '').strip()
        if status in {
            'AWB_ASSIGNED', 'PICKUP_SCHEDULED', 'SHIPPED', 'IN_TRANSIT',
            'OUT_FOR_DELIVERY', 'DELIVERED', 'DELAYED', 'UNDELIVERED',
            'RTO_INITIATED', 'RTO_DELIVERED', 'RETURNED',
        } and not awb:
            self.add_error('courier_id', 'Enter the Trackon AWB number for this status.')
        return cleaned
