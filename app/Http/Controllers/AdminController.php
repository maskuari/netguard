<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Contracts\View\View;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Collection as EloquentCollection;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Symfony\Component\HttpFoundation\StreamedResponse;

class AdminController extends Controller
{
    public function index(Request $request): View
    {
        $this->authorizeAdministrator($request);
        $filters = $this->filters($request);
        $students = User::query()->where('is_admin', false);
        $chapterCounts = (clone $students)
            ->selectRaw('completed_adventure_chapters, COUNT(*) AS total')
            ->groupBy('completed_adventure_chapters')
            ->pluck('total', 'completed_adventure_chapters');
        $chartProgress = [];

        for ($chapter = 0; $chapter <= User::ADVENTURE_CHAPTER_COUNT; $chapter++) {
            $chartProgress[$chapter] = (int) ($chapterCounts[$chapter] ?? 0);
        }

        return view('admin-dashboard', [
            'users' => $this->filteredStudents($filters)->latest()->paginate(15)->withQueryString(),
            'filters' => $filters,
            'stats' => [
                'total' => (clone $students)->count(),
                'active' => (clone $students)->where('is_active', true)->count(),
                'inactive' => (clone $students)->where('is_active', false)->count(),
                'completed' => (clone $students)->where('completed_adventure_chapters', User::ADVENTURE_CHAPTER_COUNT)->count(),
                'average_practice_score' => (clone $students)->avg('practice_score'),
                'average_certification_score' => (clone $students)->avg('certification_score'),
            ],
            'activityLogs' => $this->activityLogs(8),
            'chartProgress' => $chartProgress,
        ]);
    }

    public function show(Request $request, User $user): View
    {
        $this->authorizeAdministrator($request);
        $this->authorizeStudent($request, $user);

        return view('admin-user', [
            'user' => $user,
            'activityLogs' => $this->activityLogs(10, $user->id),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $this->authorizeAdministrator($request);
        $attributes = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255', Rule::unique('users', 'email')],
            'gender' => ['required', 'string', 'in:pria,wanita'],
            'password' => ['required', 'string', 'min:8', 'confirmed'],
            'is_active' => ['sometimes', 'boolean'],
        ]);

        $user = DB::transaction(function () use ($request, $attributes): User {
            $user = new User;
            $user->forceFill([
                'name' => $attributes['name'],
                'email' => $attributes['email'],
                'gender' => $attributes['gender'],
                'password' => $attributes['password'],
                'is_admin' => false,
                'is_active' => $request->boolean('is_active', true),
                'completed_adventure_chapters' => 0,
            ])->save();

            $this->audit($request, $user, 'account_created', ['is_active' => $user->is_active]);

            return $user;
        });

        return redirect()->route('admin.users.show', $user)->with('status', 'Akun siswa berhasil dibuat.');
    }

    public function update(Request $request, User $user): RedirectResponse
    {
        $this->authorizeAdministrator($request);
        $this->authorizeStudent($request, $user);
        $attributes = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255', Rule::unique('users', 'email')->ignore($user)],
            'gender' => ['required', 'string', 'in:pria,wanita'],
            'is_active' => ['required', 'boolean'],
            'completed_adventure_chapters' => ['required', 'integer', 'between:0,'.User::ADVENTURE_CHAPTER_COUNT],
            'practice_score' => ['nullable', 'integer', 'between:0,100'],
            'certification_score' => ['nullable', 'integer', 'between:0,100'],
            'password' => ['nullable', 'string', 'min:8', 'confirmed'],
        ]);

        DB::transaction(function () use ($request, $user, $attributes): void {
            $student = User::query()->lockForUpdate()->findOrFail($user->id);
            $this->authorizeStudent($request, $student);
            $passwordChanged = filled($attributes['password'] ?? null);
            $previousAttributes = $student->only([
                'name', 'email', 'gender', 'is_active', 'completed_adventure_chapters',
                'practice_score', 'certification_score',
            ]);
            $student->forceFill([
                'name' => $attributes['name'],
                'email' => $attributes['email'],
                'gender' => $attributes['gender'],
                'is_active' => $request->boolean('is_active'),
                'completed_adventure_chapters' => (int) $attributes['completed_adventure_chapters'],
                'practice_score' => $attributes['practice_score'] ?? null,
                'certification_score' => $attributes['certification_score'] ?? null,
            ]);
            $statusChanged = $student->isDirty('is_active');
            $emailChanged = $student->isDirty('email');

            if ($passwordChanged) {
                $student->password = $attributes['password'];
            }

            if ($passwordChanged || $statusChanged || $emailChanged) {
                $student->remember_token = Str::random(60);
                $this->revokeSessions($student);
            }

            if ($passwordChanged || $emailChanged) {
                DB::table('password_reset_tokens')->whereIn('email', [
                    $previousAttributes['email'], $student->email,
                ])->delete();
            }

            $student->save();
            $changes = [];

            foreach ($previousAttributes as $field => $previousValue) {
                if ($previousValue !== $student->getAttribute($field)) {
                    $changes[$field] = ['before' => $previousValue, 'after' => $student->getAttribute($field)];
                }
            }

            $this->audit($request, $student, 'account_updated', [
                'changes' => $changes,
                'password_reset' => $passwordChanged,
            ]);
        });

        return redirect()->route('admin.users.show', $user)->with('status', 'Data siswa berhasil diperbarui.');
    }

    public function destroy(Request $request, User $user): RedirectResponse
    {
        $this->authorizeAdministrator($request);
        $this->authorizeStudent($request, $user);
        $request->validate([
            'confirmation_email' => ['required', 'string', Rule::in([$user->email])],
        ], ['confirmation_email.in' => 'Ketik email siswa dengan tepat untuk menghapus akun.']);

        DB::transaction(function () use ($request, $user): void {
            $student = User::query()->lockForUpdate()->findOrFail($user->id);
            $this->authorizeStudent($request, $student);
            abort_unless($request->string('confirmation_email')->toString() === $student->email, 409, 'Email akun berubah. Muat ulang sebelum menghapus akun.');

            $this->audit($request, $student, 'account_deleted');
            $this->revokeSessions($student);
            DB::table('password_reset_tokens')->where('email', $student->email)->delete();
            $student->delete();
        });

        return redirect()->route('admin.dashboard')->with('status', 'Akun siswa berhasil dihapus.');
    }

    public function changePassword(Request $request): RedirectResponse
    {
        $this->authorizeAdministrator($request);
        $attributes = $request->validate([
            'current_password' => ['required', 'current_password:web'],
            'password' => ['required', 'string', 'min:8', 'confirmed'],
        ]);

        DB::transaction(function () use ($request, $attributes): void {
            $administrator = $request->user();
            $administrator->forceFill([
                'password' => $attributes['password'],
                'remember_token' => Str::random(60),
            ])->save();
            $this->revokeSessions($administrator, $request->session()->getId());
            DB::table('password_reset_tokens')->where('email', $administrator->email)->delete();
            $this->audit($request, $administrator, 'password_changed');
        });

        $request->session()->regenerate();

        return redirect()->route('admin.dashboard')->with('status', 'Password admin berhasil diubah.');
    }

    public function export(Request $request): StreamedResponse
    {
        $this->authorizeAdministrator($request);
        $students = $this->filteredStudents($this->filters($request))->select([
            'id', 'name', 'email', 'gender', 'is_active', 'completed_adventure_chapters',
            'practice_score', 'certification_score', 'created_at', 'last_login_at',
        ]);

        return response()->streamDownload(function () use ($students): void {
            $stream = fopen('php://output', 'w');
            fwrite($stream, "\xEF\xBB\xBF");
            fputcsv($stream, [
                'Nama', 'Email', 'Jenis kelamin', 'Status', 'Chapter selesai', 'Progres (%)',
                'Nilai Practice (manual)', 'Nilai Certification (manual)', 'Tanggal daftar', 'Login terakhir',
            ], escape: '');

            $students->chunkById(200, function (EloquentCollection $users) use ($stream): void {
                foreach ($users as $user) {
                    $values = [
                        $user->name,
                        $user->email,
                        $user->gender ?? '',
                        $user->is_active ? 'Aktif' : 'Nonaktif',
                        (string) $user->completedAdventureChapters(),
                        (string) $user->adventureProgressPercentage(),
                        $user->practice_score === null ? '' : (string) $user->practice_score,
                        $user->certification_score === null ? '' : (string) $user->certification_score,
                        $user->created_at?->format('Y-m-d H:i:s') ?? '',
                        $user->last_login_at?->format('Y-m-d H:i:s') ?? '',
                    ];
                    fputcsv($stream, array_map($this->safeCsvValue(...), $values), escape: '');
                }
            });

            fclose($stream);
        }, 'netguard-siswa-'.now()->format('Y-m-d').'.csv', ['Content-Type' => 'text/csv; charset=UTF-8']);
    }

    private function authorizeAdministrator(Request $request): void
    {
        abort_unless($request->user()?->is_admin && $request->user()?->is_active, 403);
    }

    private function authorizeStudent(Request $request, User $user): void
    {
        abort_if($user->is_admin || $user->id === $request->user()->id, 403, 'Akun admin tidak dapat diubah melalui pengelolaan siswa.');
    }

    /** @return array{q: string, status: string, progress: string, gender: string} */
    private function filters(Request $request): array
    {
        $attributes = $request->validate([
            'q' => ['nullable', 'string', 'max:255'],
            'status' => ['nullable', 'in:active,inactive'],
            'progress' => ['nullable', 'in:not_started,in_progress,completed'],
            'gender' => ['nullable', 'in:pria,wanita'],
        ]);

        return [
            'q' => trim($attributes['q'] ?? ''),
            'status' => $attributes['status'] ?? '',
            'progress' => $attributes['progress'] ?? '',
            'gender' => $attributes['gender'] ?? '',
        ];
    }

    /**
     * @param  array{q: string, status: string, progress: string, gender: string}  $filters
     * @return Builder<User>
     */
    private function filteredStudents(array $filters): Builder
    {
        $students = User::query()->where('is_admin', false);

        if ($filters['q'] !== '') {
            $students->where(function (Builder $query) use ($filters): void {
                $query->where('name', 'like', '%'.$filters['q'].'%')
                    ->orWhere('email', 'like', '%'.$filters['q'].'%');
            });
        }

        if ($filters['status'] !== '') {
            $students->where('is_active', $filters['status'] === 'active');
        }

        if ($filters['gender'] !== '') {
            $students->where('gender', $filters['gender']);
        }

        if ($filters['progress'] === 'not_started') {
            $students->where('completed_adventure_chapters', 0);
        } elseif ($filters['progress'] === 'in_progress') {
            $students->whereBetween('completed_adventure_chapters', [1, User::ADVENTURE_CHAPTER_COUNT - 1]);
        } elseif ($filters['progress'] === 'completed') {
            $students->where('completed_adventure_chapters', User::ADVENTURE_CHAPTER_COUNT);
        }

        return $students;
    }

    /** @return Collection<int, \stdClass> */
    private function activityLogs(int $limit, ?int $userId = null): Collection
    {
        return DB::table('admin_activity_logs')
            ->leftJoin('users as administrators', 'administrators.id', '=', 'admin_activity_logs.admin_id')
            ->select('admin_activity_logs.*', 'administrators.name as admin_name')
            ->when($userId !== null, fn ($query) => $query->where('admin_activity_logs.user_id', $userId))
            ->orderByDesc('admin_activity_logs.id')
            ->limit($limit)
            ->get();
    }

    /** @param array<string, mixed> $metadata */
    private function audit(Request $request, User $user, string $action, array $metadata = []): void
    {
        DB::table('admin_activity_logs')->insert([
            'admin_id' => $request->user()->id,
            'user_id' => $user->id,
            'action' => $action,
            'subject_name' => $user->name,
            'subject_email' => $user->email,
            'metadata' => $metadata === [] ? null : json_encode($metadata, JSON_THROW_ON_ERROR),
            'created_at' => now(),
        ]);
    }

    private function revokeSessions(User $user, ?string $exceptSession = null): void
    {
        DB::table(config('session.table', 'sessions'))
            ->where('user_id', $user->id)
            ->when($exceptSession !== null, fn ($query) => $query->where('id', '!=', $exceptSession))
            ->delete();
    }

    private function safeCsvValue(string $value): string
    {
        if (preg_match('/^(?:[\t\r\n]|[\s\x{FEFF}]*[=+\-@])/u', $value) === 1) {
            return "'".$value;
        }

        return $value;
    }
}
