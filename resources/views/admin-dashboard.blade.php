@extends('admin-layout')
@section('title', 'Dashboard')
@section('content')
    <div class="admin-page-heading">
        <div><p class="admin-eyebrow">NETGUARD ACADEMY</p><h1>Dashboard pengelola</h1><p class="admin-page-description">Pantau perjalanan belajar dan kelola akun siswa di satu tempat.</p></div>
        <div class="admin-actions"><a class="admin-button admin-button--secondary" href="{{ route('admin.users.export', $filters) }}"><svg class="admin-icon"><use href="#admin-download"/></svg>Ekspor CSV</a><button class="admin-button admin-button--primary" type="button" data-open-dialog="admin-create-dialog" aria-haspopup="dialog"><svg class="admin-icon"><use href="#admin-plus"/></svg>Tambah akun</button></div>
    </div>
    <section class="admin-stats" aria-label="Ringkasan akun siswa">
        <article class="admin-stat"><span class="admin-stat__icon"><svg class="admin-icon"><use href="#admin-users"/></svg></span><span class="admin-stat__label">Total siswa</span><strong class="admin-stat__value">{{ number_format($stats['total']) }}</strong><span class="admin-stat__note">Akun terdaftar</span></article>
        <article class="admin-stat"><span class="admin-stat__icon"><svg class="admin-icon"><use href="#admin-shield"/></svg></span><span class="admin-stat__label">Akun aktif</span><strong class="admin-stat__value">{{ number_format($stats['active']) }}</strong><span class="admin-stat__note">Dapat mengakses pembelajaran</span></article>
        <article class="admin-stat"><span class="admin-stat__icon"><svg class="admin-icon"><use href="#admin-lock"/></svg></span><span class="admin-stat__label">Akun nonaktif</span><strong class="admin-stat__value">{{ number_format($stats['inactive']) }}</strong><span class="admin-stat__note">Akses dinonaktifkan</span></article>
        <article class="admin-stat"><span class="admin-stat__icon"><svg class="admin-icon"><use href="#admin-check"/></svg></span><span class="admin-stat__label">Adventure selesai</span><strong class="admin-stat__value">{{ number_format($stats['completed']) }}</strong><span class="admin-stat__note">Seluruh 5 chapter tuntas</span></article>
    </section>
    <section class="admin-card" id="accounts" aria-labelledby="accounts-title">
        <div class="admin-card__heading"><div><h2 id="accounts-title">Akun siswa</h2><p>Cari akun, periksa aktivitas, atau buka detail untuk mengubah data.</p></div><span class="admin-status">{{ $users->total() }} akun ditemukan</span></div>
        <form class="admin-filters" action="{{ route('admin.dashboard') }}" method="get">
            <label class="admin-field admin-field--wide">Cari nama atau email<input type="search" name="q" value="{{ $filters['q'] ?? '' }}" placeholder="Cari siswa..." maxlength="255"></label>
            <label class="admin-field">Status<select name="status"><option value="">Semua status</option><option value="active" @selected(($filters['status'] ?? '') === 'active')>Aktif</option><option value="inactive" @selected(($filters['status'] ?? '') === 'inactive')>Nonaktif</option></select></label>
            <label class="admin-field">Progres<select name="progress"><option value="">Semua progres</option><option value="not_started" @selected(($filters['progress'] ?? '') === 'not_started')>Belum mulai</option><option value="in_progress" @selected(($filters['progress'] ?? '') === 'in_progress')>Sedang belajar</option><option value="completed" @selected(($filters['progress'] ?? '') === 'completed')>Selesai</option></select></label>
            <label class="admin-field">Jenis kelamin<select name="gender"><option value="">Semua</option><option value="pria" @selected(($filters['gender'] ?? '') === 'pria')>Pria</option><option value="wanita" @selected(($filters['gender'] ?? '') === 'wanita')>Wanita</option></select></label>
            <div class="admin-actions"><button class="admin-button admin-button--primary" type="submit"><svg class="admin-icon"><use href="#admin-search"/></svg>Filter</button>@if (array_filter($filters))<a class="admin-button admin-button--ghost" href="{{ route('admin.dashboard') }}">Reset</a>@endif</div>
        </form>
        <div class="admin-table-wrap">
            <table class="admin-table"><thead><tr><th scope="col">Akun</th><th scope="col">Status</th><th scope="col">Adventure</th><th scope="col">Nilai manual</th><th scope="col">Login terakhir</th><th scope="col"><span class="admin-help">Kelola</span></th></tr></thead><tbody>
                @forelse ($users as $account)
                    <tr>
                        <td><div class="admin-account"><span class="admin-avatar"><img src="{{ asset($account->profileAvatarPath()) }}" alt="" loading="lazy" decoding="async"></span><div><a class="admin-account__name" href="{{ route('admin.users.show', $account) }}">{{ $account->name }}</a><span class="admin-account__email">{{ $account->email }}</span></div></div></td>
                        <td><span class="admin-status {{ $account->is_active ? 'is-active' : 'is-inactive' }}">{{ $account->is_active ? 'Aktif' : 'Nonaktif' }}</span></td>
                        <td><div class="admin-progress"><progress value="{{ $account->adventureProgressPercentage() }}" max="100" aria-label="Progres Adventure {{ $account->name }}"></progress><span>{{ $account->completedAdventureChapters() }}/5 chapter <strong>{{ $account->adventureProgressPercentage() }}%</strong></span></div></td>
                        <td><div class="admin-score"><span>Practice <strong>{{ $account->practice_score ?? '—' }}</strong></span><span>Sertifikasi <strong>{{ $account->certification_score ?? '—' }}</strong></span></div></td>
                        <td>{{ $account->last_login_at?->locale('id')->diffForHumans() ?? 'Belum login' }}</td>
                        <td><a class="admin-button admin-button--secondary admin-button--small" href="{{ route('admin.users.show', $account) }}"><svg class="admin-icon"><use href="#admin-edit"/></svg>Detail</a></td>
                    </tr>
                @empty
                    <tr><td colspan="6"><div class="admin-empty"><svg class="admin-icon"><use href="#admin-users"/></svg><strong>Belum ada akun yang cocok.</strong><span>Ubah filter atau tambahkan akun siswa baru.</span></div></td></tr>
                @endforelse
            </tbody></table>
        </div>
        <div class="admin-pagination"><span>{{ $users->firstItem() ?? 0 }}–{{ $users->lastItem() ?? 0 }} dari {{ $users->total() }} akun</span><div class="admin-actions">@if ($users->previousPageUrl())<a class="admin-button admin-button--secondary admin-button--small" href="{{ $users->previousPageUrl() }}">Sebelumnya</a>@endif<span>Halaman {{ $users->currentPage() }} / {{ $users->lastPage() }}</span>@if ($users->nextPageUrl())<a class="admin-button admin-button--secondary admin-button--small" href="{{ $users->nextPageUrl() }}">Berikutnya</a>@endif</div></div>
    </section>
    <div class="admin-summary-grid">
        <section class="admin-card" id="progress" aria-labelledby="progress-title">
            <div class="admin-card__heading"><div><h2 id="progress-title">Perjalanan Adventure</h2><p>Jumlah siswa berdasarkan chapter yang selesai.</p></div><svg class="admin-icon"><use href="#admin-chart"/></svg></div>
            @php($largestGroup = max(1, max($chartProgress)))
            <div class="admin-chart" role="img" aria-label="Distribusi progres siswa: {{ collect($chartProgress)->map(fn ($count, $chapter) => $chapter.' chapter selesai: '.$count.' siswa')->implode(', ') }}">
                @foreach ($chartProgress as $chapter => $count)<div class="admin-chart__column"><span class="admin-chart__count">{{ $count }}</span><span class="admin-chart__bar" style="height: {{ round($count / $largestGroup * 100) }}%"></span><span class="admin-chart__label">{{ $chapter === 0 ? 'Belum mulai' : 'Ch. '.$chapter }}</span></div>@endforeach
            </div>
            <div class="admin-stats"><div><span class="admin-stat__label">Rata-rata Practice</span><strong class="admin-stat__value">{{ $stats['average_practice_score'] !== null ? number_format($stats['average_practice_score'], 1).' / 100' : 'Belum dinilai' }}</strong></div><div><span class="admin-stat__label">Rata-rata sertifikasi</span><strong class="admin-stat__value">{{ $stats['average_certification_score'] !== null ? number_format($stats['average_certification_score'], 1).' / 100' : 'Belum dinilai' }}</strong></div></div>
            <p class="admin-help">Nilai di atas berasal dari catatan manual admin. Penilaian otomatis game belum tersedia.</p>
        </section>
        <section class="admin-card" id="activity" aria-labelledby="activity-title">
            <div class="admin-card__heading"><div><h2 id="activity-title">Aktivitas terbaru</h2><p>Riwayat perubahan yang dilakukan pengelola.</p></div><svg class="admin-icon"><use href="#admin-clock"/></svg></div>
            @php($activityLabels = ['account_created' => 'Akun ditambahkan', 'account_updated' => 'Akun diperbarui', 'account_deleted' => 'Akun dihapus', 'password_changed' => 'Password admin diperbarui'])
            <div class="admin-activity">
                @forelse ($activityLogs as $activity)<div class="admin-activity__item"><span class="admin-activity__icon"><svg class="admin-icon"><use href="#admin-clock"/></svg></span><div><strong>{{ $activityLabels[$activity->action] ?? 'Akun diperbarui' }}</strong><p>{{ $activity->subject_name }} <span>· {{ $activity->admin_name ?? 'Admin' }}</span></p>@include('admin-activity-details')<span class="admin-activity__time">{{ \Illuminate\Support\Carbon::parse($activity->created_at)->locale('id')->diffForHumans() }}</span></div></div>@empty<div class="admin-empty"><span>Belum ada perubahan akun yang tercatat.</span></div>@endforelse
            </div>
        </section>
    </div>
@endsection
@section('dialogs')
    <dialog class="admin-dialog" id="admin-create-dialog" aria-labelledby="admin-create-title" @if ($errors->any() && old('_form') === 'create') data-open-on-load @endif>
        <div class="admin-card__heading"><div><p class="admin-eyebrow">AKUN SISWA BARU</p><h2 id="admin-create-title">Tambah akun</h2></div><button class="admin-button admin-button--ghost" type="button" data-close-dialog aria-label="Tutup"><svg class="admin-icon"><use href="#admin-close"/></svg></button></div>
        <form action="{{ route('admin.users.store') }}" method="post" data-admin-action data-loading-label="Menambahkan akun siswa...">
            @csrf<input type="hidden" name="_form" value="create">
            <div class="admin-form-grid">
                <label class="admin-field admin-field--wide">Nama lengkap<input name="name" value="{{ old('name') }}" required maxlength="255" autocomplete="name"></label>
                <label class="admin-field admin-field--wide">Email<input type="email" name="email" value="{{ old('email') }}" required maxlength="255" autocomplete="email"></label>
                <label class="admin-field">Jenis kelamin<select name="gender" required><option value="">Pilih jenis kelamin</option><option value="pria" @selected(old('gender') === 'pria')>Pria</option><option value="wanita" @selected(old('gender') === 'wanita')>Wanita</option></select></label>
                <label class="admin-field">Status akun<select name="is_active"><option value="1" @selected(old('is_active', '1') === '1')>Aktif</option><option value="0" @selected(old('is_active') === '0')>Nonaktif</option></select></label>
                <label class="admin-field">Password<input type="password" name="password" required minlength="8" autocomplete="new-password"></label>
                <label class="admin-field">Ulangi password<input type="password" name="password_confirmation" required minlength="8" autocomplete="new-password"></label>
            </div>
            <p class="admin-help">Akun baru memulai Adventure dari 0/5 chapter.</p>
            <div class="admin-actions"><button class="admin-button admin-button--secondary" type="button" data-close-dialog>Batal</button><button class="admin-button admin-button--primary" type="submit">Buat akun</button></div>
        </form>
    </dialog>
@endsection
