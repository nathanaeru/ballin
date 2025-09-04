# **Ballin: An Online Football Shop**

### **Overview**

_Deployment link_: [https://nathanael-leander-ballin.pbp.cs.ui.ac.id/](https://nathanael-leander-ballin.pbp.cs.ui.ac.id/)

Saat ini hanya menampilkan data pembuat aplikasi.

### **Proses Implementasi _Step-by-Step_**

Berikut merupakan langkah-langkah yang ditempuh untuk mengimplementasikan Django dalam pembuatan proyek ini.

#### **> Membuat proyek Django baru**

-   Menginisialisasi lingkungan virtual (_virtual environment_) Python sebagai _runtime_ pengembangan aplikasi.

    ```powershell
    python -m venv env
    env\Scripts\activate
    ```

-   Melakukan instalasi library-library Python yang diperlukan (didefinisikan dalam file [`requirements.txt`](requirements.txt)).

    ```powershell
    pip install -r requirements.txt
    ```

-   Melakukan inisialisasi proyek Django baru.

    ```powershell
    django-admin startproject ballin .
    ```

-   Menginisialisasi file `.env` (_environment variables_ repositori lokal) dan `.env.prod` (_environment variables_ untuk*production deployment*) yang berisi konfigurasi kredensial dan variabel-variabel yang diperlukan untuk berinteraksi dengan _database_.
-   Memodifikasi [`ballin/settings.py`](ballin/settings.py) untuk menggunakan _environment variables_ yang sudah didefinisikan sebelumnya, serta konfigurasi _localhost_ dan _database_.

    ```python
    ...

    import os
    from dotenv import load_dotenv

    # Load environment variables from .env file
    load_dotenv()

    ...

    PRODUCTION = os.getenv("PRODUCTION", "False").lower() == "true"

    # SECURITY WARNING: don't run with debug turned on in production!
    DEBUG = True

    ALLOWED_HOSTS = ["localhost", "127.0.0.1", "nathanael-leander-ballin.pbp.cs.ui.ac.id"]

    ...

    # Database configuration
    if PRODUCTION:
        # Production: gunakan PostgreSQL dengan kredensial dari environment variables
        DATABASES = {
            "default": {
                "ENGINE": "django.db.backends.postgresql",
                "NAME": os.getenv("DB_NAME"),
                "USER": os.getenv("DB_USER"),
                "PASSWORD": os.getenv("DB_PASSWORD"),
                "HOST": os.getenv("DB_HOST"),
                "PORT": os.getenv("DB_PORT"),
                "OPTIONS": {"options": f"-c search_path={os.getenv('SCHEMA', 'public')}"},
            }
        }
    else:
        # Development: gunakan SQLite
        DATABASES = {
            "default": {
                "ENGINE": "django.db.backends.sqlite3",
                "NAME": BASE_DIR / "db.sqlite3",
            }
        }

    ...
    ```

-   Melakukan migrasi _database_ pertama kali untuk memastikan konfigurasi _database_ sudah di-_update_.

    ```powershell
    python manage.py migrate
    ```

#### **> Membuat aplikasi `main` pada proyek**

-   Dilakukan dengan melakukan inisialisasi `main` pada proyek yang akan menghasilkan direktori baru.

    ```powershell
    python manage.py startapp main
    ```

-   Mendaftarkan aplikasi `main` pada proyek dengan memodifikasi _line_ berikut pada [`ballin/settings.py`](ballin/settings.py).

    ```python
    ...

    # Application definition

    INSTALLED_APPS = [
        "django.contrib.admin",
        "django.contrib.auth",
        "django.contrib.contenttypes",
        "django.contrib.sessions",
        "django.contrib.messages",
        "django.contrib.staticfiles",
        "main",
    ]

    ...
    ```

#### **> Melakukan routing pada proyek agar dapat menjalankan aplikasi `main`**

-   Melakukan editing pada berkas [`ballin/urls.py`](ballin/urls.py) sebagai berikut. Berkas ini memungkinkan _HTTP request_ dari pengguna dialihkan pada aplikasi `main`.

    ```python
    ...

    from django.contrib import admin
    from django.urls import path, include

    urlpatterns = [
        path("admin/", admin.site.urls),
        path("", include("main.urls")),
    ]
    ```

-   Membuat file [`main/urls.py`](main/urls.py) sebagai rute URL aplikasi `main`.

#### **> Membuat model pada aplikasi `main` dengan nama `Product`**

-   Model didefinisikan di [`main/models.py`](main/models.py) dengan atribut-atribut dan metode-metode yang bisa dilihat di kode Python berikut. Untuk saat ini model dapat diliat langsung pada program yang sudah di-_deploy_.

    ```python
    from django.db import models
    import uuid


    # Create your models here.
    class Product(models.Model):
        id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
        name = models.CharField()
        brand = models.CharField()
        price = models.IntegerField()
        stock = models.IntegerField()
        sold = models.IntegerField(default=0)
        description = models.TextField()
        thumbnail = models.URLField()
        category = models.CharField()
        is_featured = models.BooleanField(default=False)

        def __str__(self):
            return self.name

        def add_stock(self, quantity):
            self.stock += quantity
            self.save()

        def sell(self, quantity):
            if not self.is_in_stock() or quantity > self.stock:
                raise ValueError("Not enough stock available")
            self.stock -= quantity
            self.sold += quantity
            self.save()

        def is_hot_selling(self):
            return self.sold > 100

        def is_in_stock(self):
            return self.stock > 0

        def change_price(self, new_price):
            if new_price <= 0:
                raise ValueError("Price cannot be zero or negative")
            self.price = new_price
            self.save()
    ```
