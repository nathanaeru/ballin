from django.shortcuts import render, redirect, get_object_or_404
from .forms import ProductForm
from .models import Product
from django.http import HttpResponse
from django.core import serializers


# Create your views here.
def show_main(request):
    products = Product.objects.all()

    context = {
        "name": "Nathanael Leander Herdanatra",
        "class": "PBP A",
        "products": products,
    }

    return render(request, "main.html", context)


def add_product(request):
    form = ProductForm(request.POST or None)

    if form.is_valid() and request.method == "POST":
        form.save()
        return redirect("main:show_main")

    context = {"form": form}
    return render(request, "add_product.html", context)


def show_product(request, id):
    product = get_object_or_404(Product, pk=id)

    context = {
        "product": product,
    }

    return render(request, "product_detail.html", context)


def show_xml(request):
    products = Product.objects.all()
    data = serializers.serialize("xml", products)
    return HttpResponse(data, content_type="application/xml")


def show_json(request):
    products = Product.objects.all()
    data = serializers.serialize("json", products)
    return HttpResponse(data, content_type="application/json")


def show_xml_by_id(request, id):
    try:
        product = get_object_or_404(Product, pk=id)
        data = serializers.serialize("xml", [product])
        return HttpResponse(data, content_type="application/xml")
    except Product.DoesNotExist:
        return HttpResponse(status=404)


def show_json_by_id(request, id):
    try:
        product = get_object_or_404(Product, pk=id)
        data = serializers.serialize("json", [product])
        return HttpResponse(data, content_type="application/json")
    except Product.DoesNotExist:
        return HttpResponse(status=404)
