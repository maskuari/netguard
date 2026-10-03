@extends('admin-layout')
@section('title', 'Detail akun')
@section('content')
    <div class="admin-page-heading"><div><a class="admin-button admin-button--ghost" href="{{ route('admin.dashboard') }}#accounts"><svg class="admin-icon"><use href="#admin-back"/></svg>Kembali ke daftar akun</a><h1>Detail akun siswa</h1><p class="admin-page-description">Periksa identitas, akses, progres, dan catatan nilai.</p></div><button class="admin-button admin-button--danger" type="button" data-open-dialog="admin-delete-dialog" aria-haspopup="dialog"><svg class="admin-icon"><use href="#admin-trash"/></svg>Hapus akun</button></div>
    <div class="admin-detail-grid">
        <aside class="admin-card admin-detail-card">
            <div class="admin-profile-summary"><span class="admin-avatar"><img src="{{ asset($user->profileAvatarPath()) }}" alt="" decoding="async"></span><h2>{{ $user->name }}</h2><p>{{ $user->email }}</p><span class="admin-status {{ $user->is_active ? 'is-active' : 'is-inactive' }}">{{ $user->is_active ? 'Akun aktif' : 'Akun nonaktif' }}</span></div>
            <dl class="admin-score"><div><dt>Jenis kelamin</dt><dd>{{ $user->gender === 'pria' ? 'Pria' : ($user->gender === 'wanita' ? 'Wanita' : 'Belum diisi') }}</dd></div><div><dt>Terdaftar</dt><dd>{{ $user->created_at->format('d M Y') }}</dd></div><div><dt>Login terakhir</dt><dd>{{ $user->last_login_at?->locale('id')->diffForHumans() ?? 'Belum login' }}</dd></div></dl>
            <div class="admin-progress"><progress value="{{ $user->adventureProgressPercentage() }}" max="100" aria-label="Progres Adventure"></progress><span>{{ $user->completedAdventureChapters() }}/5 chapter <strong>{{ $user->adventureProgressPercentage() }}%</strong></span></div>
            <div class="admin-score"><span>Practice <strong>{{ $user->isPracticeUnlocked() ? 'Terbuka' : 'Terkunci' }}</strong></span><span>Certification <strong>{{ $user->isCertificationUnlocked() ? 'Terbuka' : 'Terkunci' }}</strong></span></div>
        </aside>
        <section class="admin-card" aria-labelledby="edit-user-title">
            <div class="admin-card__heading"><div><h2 id="edit-user-title">Kelola akun</h2><p>Perubahan disimpan dan dicatat dalam riwayat aktivitas.</p></div><svg class="admin-icon"><use href="#admin-edit"/></svg></div>
            <form action="{{ route('admin.users.update', $user) }}" method="post" data-admin-action data-loading-label="Menyimpan perubahan akun...">
                @csrf @method('PATCH')
                <fieldset class="admin-fieldset"><legend>Identitas &amp; akses</legend><div class="admin-form-grid">
                    <label class="admin-field">Nama lengkap<input name="name" value="{{ old('name', $user->name) }}" required maxlength="255" autocomplete="name"></label>
                    <label class="admin-field">Email<input type="email" name="email" value="{{ old('email', $user->email) }}" required maxlength="255" autocomplete="email"></label>
                    <label class="admin-field">Jenis kelamin<select name="gender" required><option value="pria" @selected(old('gender', $user->gender ?? 'pria') === 'pria')>Pria</option><option value="wanita" @selected(old('gender', $user->gender) === 'wanita')>Wanita</option></select></label>
                    <label class="admin-field">Status akun<select name="is_active"><option value="1" @selected((string) old('is_active', (int) $user->is_active) === '1')>Aktif</option><option value="0" @selected((string) old('is_active', (int) $user->is_active) === '0')>Nonaktif</option></select><small>Nonaktif akan menghentikan akses dan sesi siswa.</small></label>
                </div></fieldset>
                <fieldset class="admin-fieldset"><legend>Progres &amp; nilai</legend><div class="admin-form-grid">
                    <label class="admin-field admin-field--wide">Chapter Adventure yang selesai<select name="completed_adventure_chapters" required>@for ($chapter = 0; $chapter <= 5; $chapter++)<option value="{{ $chapter }}" @selected((int) old('completed_adventure_chapters', $user->completedAdventureChapters()) === $chapter)>{{ $chapter }}/5 chapter selesai{{ $chapter === 0 ? ' — belum mulai' : '' }}</option>@endfor</select><small>Koreksi berdasarkan hasil yang sudah diverifikasi. Chapter 3 membuka Practice; seluruh chapter membuka Certification.</small></label>
                    <label class="admin-field">Nilai Practice (manual)<input name="practice_score" type="number" min="0" max="100" step="1" value="{{ old('practice_score', $user->practice_score) }}" placeholder="Belum dinilai"><small>0–100, kosongkan jika belum dinilai.</small></label>
                    <label class="admin-field">Nilai sertifikasi (manual)<input name="certification_score" type="number" min="0" max="100" step="1" value="{{ old('certification_score', $user->certification_score) }}" placeholder="Belum dinilai"><small>0–100, kosongkan jika belum dinilai.</small></label>
                </div></fieldset>
                <fieldset class="admin-fieldset"><legend>Reset password</legend><p class="admin-help">Isi kedua kolom untuk mengganti password siswa. Minimal 8 karakter.</p><div class="admin-form-grid"><label class="admin-field">Password baru<input type="password" name="password" minlength="8" autocomplete="new-password" placeholder="Opsional"></label><label class="admin-field">Ulangi password baru<input type="password" name="password_confirmation" minlength="8" autocomplete="new-password" placeholder="Opsional"></label></div></fieldset>
                <div class="admin-actions"><a class="admin-button admin-button--secondary" href="{{ route('admin.dashboard') }}">Batal</a><button class="admin-button admin-button--primary" type="submit"><svg class="admin-icon"><use href="#admin-check"/></svg>Simpan perubahan</button></div>
            </form>
        </section>
    </div>
    <section class="admin-card" aria-labelledby="user-history-title"><div class="admin-card__heading"><div><h2 id="user-history-title">Riwayat akun</h2><p>Perubahan terakhir pada akun ini.</p></div></div><div class="admin-activity">
        @php($activityLabels = ['account_created' => 'Akun ditambahkan', 'account_updated' => 'Data, akses, progres, atau nilai diperbarui'])
        @forelse ($activityLogs as $activity)<div class="admin-activity__item"><span class="admin-activity__icon"><svg class="admin-icon"><use href="#admin-clock"/></svg></span><div><strong>{{ $activityLabels[$activity->action] ?? 'Akun diperbarui' }}</strong><p>Oleh {{ $activity->admin_name ?? 'Admin' }}</p>@include('admin-activity-details')<span class="admin-activity__time">{{ \Illuminate\Support\Carbon::parse($activity->created_at)->locale('id')->diffForHumans() }}</span></div></div>@empty<p class="admin-help">Belum ada perubahan oleh admin.</p>@endforelse
    </div></section>
@endsection
@section('dialogs')
    <dialog class="admin-dialog" id="admin-delete-dialog" aria-labelledby="admin-delete-title" @if ($errors->has('confirmation_email')) data-open-on-load @endif>
        <div class="admin-card__heading"><div><p class="admin-eyebrow">HAPUS AKUN</p><h2 id="admin-delete-title">Hapus {{ $user->name }}?</h2></div><button class="admin-button admin-button--ghost" type="button" data-close-dialog aria-label="Tutup"><svg class="admin-icon"><use href="#admin-close"/></svg></button></div>
        <p>Akun beserta progres dan catatan nilainya akan dihapus permanen. Riwayat tindakan admin tetap tersimpan.</p>
        <form action="{{ route('admin.users.destroy', $user) }}" method="post" data-admin-action data-loading-label="Menghapus akun siswa...">@csrf @method('DELETE')<label class="admin-field">Ketik email akun untuk konfirmasi<input type="email" name="confirmation_email" placeholder="{{ $user->email }}" required autocomplete="off"></label><div class="admin-actions"><button class="admin-button admin-button--secondary" type="button" data-close-dialog>Batal</button><button class="admin-button admin-button--danger" type="submit">Hapus permanen</button></div></form>
    </dialog>
@endsection
