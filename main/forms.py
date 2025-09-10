from django.forms import ModelForm
from .models import Product


class ProductForm(ModelForm):
    class Meta:
        model = Product
        fields = [
            "name",
            "brand",
            "price",
            "stock",
            "description",
            "thumbnail",
            "category",
            "is_featured",
        ]
