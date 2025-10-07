from django.forms import ModelForm
from django.utils.html import strip_tags
from .models import Product


class ProductForm(ModelForm):
    class Meta:
        model = Product
        fields = [
            "name",
            "brand",
            "category",
            "price",
            "stock",
            "description",
            "thumbnail",
            "is_featured",
        ]

        def clean_name(self):
            name = self.cleaned_data["name"]
            return strip_tags(name)

        def clean_brand(self):
            brand = self.cleaned_data["brand"]
            return strip_tags(brand)

        def clean_category(self):
            category = self.cleaned_data["category"]
            return strip_tags(category)

        def clean_description(self):
            description = self.cleaned_data["description"]
            return strip_tags(description)

        def clean_price(self):
            price = self.cleaned_data["price"]
            return strip_tags(price)

        def clean_stock(self):
            stock = self.cleaned_data["stock"]
            return strip_tags(stock)
