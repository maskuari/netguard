# NetGuard Academy

NetGuard Academy: MikroTik Mission adalah aplikasi pembelajaran jaringan berbasis Laravel. Saat ini tersedia halaman sambutan, registrasi, login, dan beranda dengan pilihan Adventure, Practice, serta Certification Mode. Ketiga mode masih menampilkan panel informasi; simulasi permainannya belum tersedia.

## Menjalankan proyek

1. Siapkan PHP 8.3+, Composer, MySQL, dan buat database bernama `netguard` melalui phpMyAdmin.
2. Jalankan `composer install`, lalu salin `.env.example` menjadi `.env`.
3. Sesuaikan `DB_HOST`, `DB_PORT`, `DB_DATABASE`, `DB_USERNAME`, dan `DB_PASSWORD` di `.env` dengan koneksi MySQL Anda.
4. Jalankan `php artisan key:generate --no-interaction` dan `php artisan migrate --no-interaction`.
5. Jalankan `php artisan serve --no-interaction` dan buka alamat yang ditampilkan.

Aset gambar dan stylesheet halaman tersedia di `public/`. File `.env`, database lokal, dependensi, serta file sementara tidak disertakan dalam repository.
