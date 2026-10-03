@php
    $activityMetadata = json_decode($activity->metadata ?? 'null', true) ?? [];
    $activityFieldLabels = [
        'name' => 'Nama',
        'email' => 'Email',
        'gender' => 'Jenis kelamin',
        'is_active' => 'Status',
        'completed_adventure_chapters' => 'Adventure',
        'practice_score' => 'Nilai Practice',
        'certification_score' => 'Nilai sertifikasi',
    ];
    $formatActivityValue = static function (string $field, mixed $value): string {
        if ($value === null || $value === '') {
            return 'Belum diisi';
        }
        if ($field === 'is_active') {
            return $value ? 'Aktif' : 'Nonaktif';
        }
        if ($field === 'gender') {
            return $value === 'wanita' ? 'Wanita' : 'Pria';
        }
        if ($field === 'completed_adventure_chapters') {
            return $value.'/5 chapter';
        }
        return (string) $value;
    };
@endphp
@if (! empty($activityMetadata['changes']) || ! empty($activityMetadata['password_reset']))
    <ul class="admin-activity__changes">
        @foreach (array_intersect_key($activityMetadata['changes'] ?? [], $activityFieldLabels) as $field => $change)
            <li><strong>{{ $activityFieldLabels[$field] }}:</strong> {{ $formatActivityValue($field, $change['before'] ?? null) }} <span aria-label="menjadi">→</span> {{ $formatActivityValue($field, $change['after'] ?? null) }}</li>
        @endforeach
        @if (! empty($activityMetadata['password_reset']))<li>Password siswa direset.</li>@endif
    </ul>
@endif
