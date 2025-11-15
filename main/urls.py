from django.urls import path
from main.views import *

app_name = "main"

urlpatterns = [
    path("", show_main, name="show_main"),
    path("add-product/", add_product, name="add_product"),
    path("product/<uuid:id>/", show_product, name="show_product"),
    path("xml/", show_xml, name="show_xml"),
    path("json/", show_json, name="show_json"),
    path(
        "json/username/<str:username>/",
        show_json_by_username,
        name="show_json_by_username",
    ),
    path("xml/<uuid:id>/", show_xml_by_id, name="show_xml_by_id"),
    path("json/<uuid:id>/", show_json_by_id, name="show_json_by_id"),
    path("login/", login_user, name="login_user"),
    path("logout/", logout_user, name="logout_user"),
    path("register/", register_user, name="register"),
    path("product/<uuid:id>/edit/", edit_product, name="edit_product"),
    path("product/<uuid:id>/delete/", delete_product, name="delete_product"),
    path("add-product-ajax/", add_product_ajax, name="add_product_ajax"),
    path("edit-product-ajax/<uuid:id>/", edit_product_ajax, name="edit_product_ajax"),
    path("proxy-image/", proxy_image, name="proxy_image"),
    path("create-flutter/", create_product_flutter, name="create_flutter"),
]
