# **Ballin: An Online Football Shop**

_**DISCLAIMER**: Repositori ini dibuat untuk rangkaian tugas individu mata kuliah Pemrograman Berbasis Platform Ilmu Komputer Universitas Indonesia, atas nama Nathanael Leander Herdanatra, NPM 2406421320. Aplikasi yang terdapat di repositori ini merupakan simulasi dan bukan toko online asli._

### **Overview**

Projek ini adalah _web app_ untuk aplikasi toko sepak bola _online_ berbasis web yang menggunakan _framework_ Django.

_Deployment link_: [https://nathanael-leander-ballin.pbp.cs.ui.ac.id/](https://nathanael-leander-ballin.pbp.cs.ui.ac.id/)

Saat ini, _website_ hanya menampilkan data pembuat aplikasi.

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

-   Membuat file [`main/urls.py`](main/urls.py) sebagai rute URL aplikasi `main`. Untuk sementara biarkain file ini kosong dulu.

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

-   Membuat dan melakukan migrasi model yang sudah diperbarui agar perubahan dapat dilacak.

    ```powershell
    python manage.py makemigrations
    python manage.py migrate
    ```

#### **> Membuat sebuah fungsi pada `views.py` untuk dikembalikan ke dalam sebuah _template_ HTML yang menampilkan nama aplikasi serta nama dan kelas**

-   Fungsi didefinisikan pada [`main/views.py`](main/views.py) yang bertujuan menampilkan konteks data yang akan di-_render_ pada tampilan HTML.

    ```python
    from django.shortcuts import render


    # Create your views here.
    def show_main(request):
        context = {
            "name": "Nathanael Leander Herdanatra",
            "class": "PBP A",
        }

        return render(request, "main.html", context)
    ```

-   _Template_ HTML didefinisikan di berkas [`main/templates/main.html`](main/templates/main.html) dan isinya menampilkan nama aplikasi serta variabel nama dan kelas.

    ```html
    <h1>Ballin Football Shop</h1>

    <h4>Name:</h4>
    <p>{{ name }}</p>
    <h4>Class:</h4>
    <p>{{ class }}</p>
    ```

#### **> Membuat sebuah _routing_ pada `urls.py` aplikasi main untuk memetakan fungsi yang telah dibuat pada `views.py`**

-   Memodifikasi file [`main/urls.py`](main/urls.py) sebagai berikut untuk menyambungkan _request_ ke fungsi `show_main`.

    ```python
    from django.urls import path
    from main.views import show_main

    app_name = "main"

    urlpatterns = [
        path("", show_main, name="show_main"),
    ]
    ```

#### **> Melakukan _deployment_ ke PWS terhadap aplikasi yang sudah dibuat sehingga dapat diakses melalui Internet**

-   Membuat proyek baru di [PWS](https://pbp.cs.ui.ac.id/web) dan di GitHub.
-   Melakukan inisiasi repositori Git lokal.
-   Membuat _branch_ `master` sebagai _branch_ utama proyek.
-   Menghubungkan repositori lokal dengan repositori GitHub dan repositori di PWS.
-   Melakukan _add_, _commit_, dan _push_ ke kedua repositori sehingga perubahannya dapat diakses di GitHub dan _website_ dapat langsung _online_.

### **Bagan Alur _Request Website_ Django**

Berikut merupakan bagan yang berisikan _request client_ ke web aplikasi berbasis Django beserta responnya.
![Diagram alur request Django](assets/DIAGRAM.png)
[_Full image Figma link_](https://www.figma.com/design/nmNjwT86D4c3ofaUFjXISM/Django?node-id=0-1&t=1sdKesRVngFeUump-1)

Penjelasan:

-   Ketika perangkat klien mengakses halaman web melalui _browser_, klien mengirimkan sebuah _HTTP request_ pada Internet berupa URL yang ingin diakses. Sistem DNS akan menterjemahkan URL tersebut menjadi alamat IP _web server_ yang ingin diakses.
-   Setelah _request_ sampai di _web server_, _request_ akan diredireksi oleh `urls.py` untuk diteruskan ke kode tampilan yang bersesuaian. Di sini `urls.py` berfungsi sebagai _router_ yang memetakan _request_ pada _views_ dan perintah yang bersesuaian.
-   _Request_ diproses di pengatur tampilan (`views.py`) yang bersesuaian di masing-masing aplikasi. Dalam Django yang berbasis MVT (_models-views-templates_) `views.py` merupakan kontroler utama untuk fungsi-fungsi aplikasi web.
-   `views.py` mengambil (_fetch_) _template_ berupa berkas HTML yang merupakan tampilan sebenarnya dari halaman web, yang merupakan respons dari _request_ yang diberikan.
-   Untuk mengakses data aplikasi, `views.py` akan mengambil model yang didefinisikan di `models.py`. File model ini dapat berinteraksi dengan _database_ dengan cara membaca dan menulis ke dalamnya.
-   Setelah semua data yang diperlukan siap, `views.py` akan mengirimkan _HTTP response_ ke Internet, untuk kemudian dapat ditampilkan di perangkat klien.

Referensi:

_Django introduction - Learn web development_ | _MDN_. (2024, 19 Desember). MDN Web Docs. https://developer.mozilla.org/en-US/docs/Learn_web_development/Extensions/Server-side/Django/Introduction (Diakses pada 5 September 2025)

Tim Dosen PBP. (nd). "Introduction to the Internet and Web Framework". Fakultas Ilmu Komputer Universitas Indonesia. https://scele.cs.ui.ac.id/pluginfile.php/268491/mod_resource/content/1/02%20-%20Introduction%20to%20the%20Internet%20and%20Web%20Framework.pdf (Diakses pada 5 September 2025)

### **Fungsi `settings.py`**

`settings.py` menyimpan konfigurasi _web server_ Django yang digunakan di sepanjang pengembangan dan eksekusi aplikasi, seperti alamat _host_ yang didefinisikan, referensi ke _database_ yang digunakan, format waktu dan tanggal, aplikasi yang didaftarkan pada proyek, dan lain-lain.

Referensi:

Django Software Foundation. (2025). _Settings_ | _Django documentation_. Django Project. https://docs.djangoproject.com/en/5.2/ref/settings/ (Diakses pada 5 September 2025)

### **Cara kerja migrasi _database_ di Django**

Dalam Django, migrasi adalah cara Django melacak dan mengimplementasi perubahan pada model atau _database_ proyek atau aplikasi. Dapat dikatakan migrasi ini adalah semacam _version control_ untuk skema _database_. Terdapat dua perintah yang umum digunakan dalam proses migrasi, yaitu `makemigrations` dan `migrate`.

Perintah `makemigrations` mengumpulkan perubahan=perubahan yang terjadi dalam satu file migrasi, sama seperti fungsi `commit` pada aplikasi _version control_ seperti Git. Sementara itu, perintah `migrate`, mengaplikasikan perubahan tersebut pada _database_, anggap seperti perintah `push` yang digunakan pada _database_.

Referensi:

Django Software Foundation. (2025). _Migrations_ | _Django documentation_. Django Project. https://docs.djangoproject.com/en/5.2/topics/migrations/ (Diakses pada 5 September 2025)

### **Mengapa _framework_ Django digunakan untuk permulaan pembelajaran pengembangan perangkat lunak?**

_Framework_ Django digunakan karena berbagai alasan berikut.

-   Django bersifat _open-source_ sehingga dapat digunakan secara bebas tanpa restriksi tertentu.
-   Kemudahan penggunaan. Django berbasis bahasa pemrograman Python yang terkenal memiliki _syntax_ yang sederhana dan mudah digunakan pemula, namun memiliki fungsi-fungsi yang cukup _powerful_.
-   Django memiliki performa tinggi sehingga dapat menciptakan aplikasi web yang responsif dan dapat menangani _traffic_ tinggi.
-   Django memiliki fitur-fitur yang kaya dan dapat membantu memudahkan berbagai keperluan umum dalam _web programming_.
-   Django merupakan platform yang aman, didukung dengan fitur-fitur _security_ yang dimilikinya.
-   Aplikasi Django dapat diskalasi dengan mudah untuk berbagai _platform_.
-   Django dapat digunakan untuk berbagai _use case_, mulai yang sederhana hingga yang lebih kompleks.

Referensi:

Tim Dosen PBP. (nd). "Introduction to the Internet and Web Framework". Fakultas Ilmu Komputer Universitas Indonesia. https://scele.cs.ui.ac.id/pluginfile.php/268491/mod_resource/content/1/02%20-%20Introduction%20to%20the%20Internet%20and%20Web%20Framework.pdf (Diakses pada 5 September 2025)

### **_Feedback_ untuk asisten dosen Tutorial 1**

Kinerja asdos sudah bagus, responsif dalam menjawab permasalahan yang dialami _mentee_ selama sesi tutorial. Pertahankan terus, ya!
