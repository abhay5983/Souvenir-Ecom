from django import forms
from django.core.exceptions import ValidationError
from django.utils.text import slugify

from .models import DigitalResource, Product


class CatalogueBookForm(forms.ModelForm):
    digital_features_text = forms.CharField(
        label='Online features', required=False, widget=forms.Textarea(attrs={'rows': 3}),
        help_text='Enter one feature per line, for example Audio book or Practice worksheets.',
    )
    student_url = forms.URLField(label='Student resource link', required=False)
    teacher_url = forms.URLField(label='Teacher resource link', required=False)

    class Meta:
        model = Product
        fields = (
            'title', 'series_title', 'isbn', 'subject', 'description', 'price_inr',
            'stock_quantity', 'sort_order', 'cover_image_url', 'featured', 'public_visibility', 'active',
        )
        widgets = {
            'description': forms.Textarea(attrs={'rows': 5}),
            'cover_image_url': forms.URLInput(attrs={'placeholder': 'https://…'}),
        }
        labels = {
            'price_inr': 'Price (₹)',
            'stock_quantity': 'Available stock',
            'sort_order': 'Display order within series',
            'cover_image_url': 'Cover photo link',
            'public_visibility': 'Show in online catalogue',
            'active': 'Available for purchase',
        }

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        if self.instance.pk:
            self.fields['digital_features_text'].initial = '\n'.join(self.instance.digital_features or [])
            try:
                resource = self.instance.digital_resource
            except DigitalResource.DoesNotExist:
                resource = None
            if resource:
                self.fields['student_url'].initial = resource.student_url
                self.fields['teacher_url'].initial = resource.teacher_url
        for field in self.fields.values():
            if not isinstance(field.widget, forms.CheckboxInput):
                field.widget.attrs.setdefault('class', 'field-control')
        self.fields['sort_order'].widget.attrs.update({'min': 0, 'inputmode': 'numeric'})

    def clean_isbn(self):
        isbn = str(self.cleaned_data.get('isbn') or '').replace('-', '').replace(' ', '').upper()
        valid = (
            len(isbn) == 10 and isbn[:9].isdigit() and (isbn[-1].isdigit() or isbn[-1] == 'X')
        ) or (len(isbn) == 13 and isbn.isdigit())
        if not valid:
            raise ValidationError('Enter a valid ISBN-10 or ISBN-13.')
        duplicate = Product.objects.filter(isbn=isbn)
        if self.instance.pk:
            duplicate = duplicate.exclude(pk=self.instance.pk)
        if duplicate.exists():
            raise ValidationError('A book with this ISBN already exists.')
        return isbn

    def save(self, commit=True):
        product = super().save(commit=False)
        product.sku = self.cleaned_data['isbn']
        product.series_code = slugify(product.series_title)
        product.series_slug = product.series_code
        product.category = product.category or 'Books'
        product.digital_features = [
            item.strip() for item in self.cleaned_data['digital_features_text'].replace('|', '\n').splitlines()
            if item.strip()
        ]
        if commit:
            product.save()
            student_url = self.cleaned_data.get('student_url', '')
            teacher_url = self.cleaned_data.get('teacher_url', '')
            if student_url or teacher_url:
                DigitalResource.objects.update_or_create(
                    product=product,
                    defaults={'student_url': student_url, 'teacher_url': teacher_url},
                )
            else:
                DigitalResource.objects.filter(product=product).delete()
        return product
