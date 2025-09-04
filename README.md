# **Ballin: An Online Football Shop**

**\*DISCLAIMER**: Repositori ini dibuat untuk rangkaian tugas individu mata kuliah Pemrograman Berbasis Platform Ilmu Komputer Universitas Indonesia, atas nama Nathanael Leander Herdanatra, NPM 2406421320. Aplikasi yang terdapat di repositori ini merupakan simulasi dan bukan toko online asli.\*

### **Overview**

Projek ini adalah _web app_ untuk aplikasi toko sepak bola _online_ berbasis web yang menggunakan _framework_ Django.

_Deployment link_: [https://nathanael-leander-ballin.pbp.cs.ui.ac.id/](https://nathanael-leander-ballin.pbp.cs.ui.ac.id/)

Saat ini hanya menampilkan data pembuat aplikasi.

### **Proses Implementasi _Step-by-Step_**

Berikut merupakan

##### **> Membuat proyek Django baru**

-   Menginisialisasi lingkungan virtual (_virtual environment_) Python sebagai*runtime* pengembangan aplikasi.
    ```powershell
    python -m venv env
    env\Scripts\activate
    ```
-   Melakukan instalasi library-library Python yang diperlukan (didefinisikan dalam file [`requirements.txt`](requirements.txt)).
    ```powershell
    pip install -r requirements.txt
    ```
-   Melakukan inisialisasi proyek Django baru/
    ```powershell
    django-admin startproject ballin .
    ```
-   Menginisialisasi file `.env` (_environment variables_ repositori lokal) dan `.env.prod` (_environment variables_ untuk*production deployment*) yang berisi konfigurasi kredensial dan variabel-variabel yang diperlukan untuk berinteraksi dengan _database_.
-   Memodifikasi [`settings.py`](ballin/settings.py) untuk menggunakan _environment variables_ yang sudah didefinisikan sebelumnya.

    ```python3
    ...

    import os
    from dotenv import load_dotenv

    # Load environment variables from .env file
    load_dotenv()

    ...
    ```
