import datetime
from django.http import HttpResponseRedirect, JsonResponse
from django.urls import reverse
from django.shortcuts import render, redirect, get_object_or_404
from .forms import ProductForm
from .models import Product
from django.http import HttpResponse
from django.core import serializers
from django.contrib.auth.forms import UserCreationForm, AuthenticationForm
from django.contrib import messages
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.decorators import login_required
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_POST
from django.utils.html import strip_tags

# Create your views here.


@login_required(login_url="/login")
def show_main(request):
    filter_type = request.GET.get("filter", "all")

    if filter_type == "all":
        products = Product.objects.all()
    else:
        products = Product.objects.filter(user=request.user)

    context = {
        "name": "Nathanael Leander Herdanatra",
        "npm": "2406421320",
        "class": "PBP A",
        "products": products,
        "last_login": request.COOKIES.get("last_login", "Never"),
        "user": request.user,
    }

    return render(request, "main.html", context)


@login_required(login_url="/login")
def add_product(request):
    form = ProductForm(request.POST or None)

    if form.is_valid() and request.method == "POST":
        product_entry = form.save(commit=False)
        product_entry.user = request.user
        product_entry.save()
        return redirect("main:show_main")

    context = {"form": form}
    return render(request, "add_product.html", context)


@login_required(login_url="/login")
def show_product(request, id):
    product = get_object_or_404(Product, pk=id)

    context = {
        "product": product,
    }

    return render(request, "product_detail.html", context)


@login_required(login_url="/login")
def edit_product(request, id):
    product = get_object_or_404(Product, pk=id)
    form = ProductForm(request.POST or None, instance=product)

    if form.is_valid() and request.method == "POST":
        form.save()
        return redirect("main:show_product", id=product.id)

    context = {"form": form, "product": product}
    return render(request, "edit_product.html", context)


@login_required(login_url="/login")
def delete_product(request, id):
    product = get_object_or_404(Product, pk=id)
    product.delete()
    return HttpResponseRedirect(reverse("main:show_main"))


def show_xml(request):
    products = Product.objects.all()
    data = serializers.serialize("xml", products)
    return HttpResponse(data, content_type="application/xml")


def show_json(request):
    products = Product.objects.all()
    data = [
        {
            "id": str(product.id),
            "name": product.name,
            "user": product.user.id,
            "username": product.user.username,
            "brand": product.brand,
            "price": product.price,
            "stock": product.stock,
            "sold": product.sold,
            "description": product.description,
            "thumbnail": product.thumbnail,
            "category": product.category,
            "is_featured": product.is_featured,
        }
        for product in products
    ]
    return JsonResponse(data, safe=False)


def show_xml_by_id(request, id):
    try:
        product = get_object_or_404(Product, pk=id)
        data = serializers.serialize("xml", [product])
        return HttpResponse(data, content_type="application/xml")
    except Product.DoesNotExist:
        return HttpResponse(status=404)


def show_json_by_id(request, id):
    try:
        product = Product.objects.select_related("user").get(pk=id)
        data = {
            "id": str(product.id),
            "name": product.name,
            "user": product.user.id,
            "username": product.user.username,
            "brand": product.brand,
            "price": product.price,
            "stock": product.stock,
            "sold": product.sold,
            "description": product.description,
            "thumbnail": product.thumbnail,
            "category": product.category,
            "is_featured": product.is_featured,
        }
        return JsonResponse(data)
    except Product.DoesNotExist:
        return JsonResponse({"detail": "Product not found"}, status=404)


def login_user(request):
    if request.method == "POST":
        form = AuthenticationForm(data=request.POST)
        if form.is_valid():
            user = form.get_user()
            login(request, user)
            response = HttpResponseRedirect(reverse("main:show_main"))
            response.set_cookie("last_login", str(datetime.datetime.now()))
            return JsonResponse(
                {
                    "status": "success",
                    "message": "Login successful!",
                    "redirect_url": reverse("main:show_main"),
                }
            )
        else:
            return JsonResponse(
                {"status": "error", "message": "Invalid username or password."}
            )

    form = AuthenticationForm(request)
    context = {"form": form}
    return render(request, "login.html", context)


def logout_user(request):
    logout(request)
    response = HttpResponseRedirect(reverse("main:login_user"))
    response.delete_cookie("last_login")
    return response


def register_user(request):
    if request.method == "POST":
        form = UserCreationForm(request.POST)
        if form.is_valid():
            form.save()
            return JsonResponse(
                {
                    "status": "success",
                    "message": "Registration successful!",
                    "redirect_url": reverse("main:login_user"),
                }
            )
        else:
            return JsonResponse({"status": "error", "errors": form.errors})
    form = UserCreationForm()
    context = {"form": form}
    return render(request, "register.html", context)


@csrf_exempt
@require_POST
def add_product_ajax(request):
    name = strip_tags(request.POST.get("name"))
    brand = strip_tags(request.POST.get("brand"))
    category = strip_tags(request.POST.get("category"))
    price = strip_tags(request.POST.get("price"))
    stock = strip_tags(request.POST.get("stock"))
    description = strip_tags(request.POST.get("description"))
    thumbnail = strip_tags(request.POST.get("thumbnail"))
    is_featured = request.POST.get("is_featured") == "on"
    user = request.user

    product = Product(
        name=name,
        brand=brand,
        category=category,
        price=price,
        stock=stock,
        description=description,
        thumbnail=thumbnail,
        is_featured=is_featured,
        user=user,
    )
    product.save()
    return HttpResponse(b"CREATED", status=201)


@csrf_exempt
@require_POST
def edit_product_ajax(request, id):
    product = get_object_or_404(Product, pk=id)

    if product.user != request.user:
        return HttpResponse(b"FORBIDDEN", status=403)

    name = strip_tags(request.POST.get("name"))
    brand = strip_tags(request.POST.get("brand"))
    category = strip_tags(request.POST.get("category"))
    price = strip_tags(request.POST.get("price"))
    stock = strip_tags(request.POST.get("stock"))
    description = strip_tags(request.POST.get("description"))
    thumbnail = strip_tags(request.POST.get("thumbnail"))
    is_featured = request.POST.get("is_featured") == "on"

    product.name = name
    product.brand = brand
    product.category = category
    product.price = price
    product.stock = stock
    product.description = description
    product.thumbnail = thumbnail
    product.is_featured = is_featured
    product.save()

    return HttpResponse(b"UPDATED", status=200)
