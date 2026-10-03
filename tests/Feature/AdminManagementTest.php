<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use PHPUnit\Framework\Attributes\DataProvider;
use Tests\TestCase;

class AdminManagementTest extends TestCase
{
    use RefreshDatabase;

    public function test_guest_is_redirected_to_admin_login(): void
    {
        $this->get(route('admin.dashboard'))->assertRedirect(route('admin.login'));
    }

    #[DataProvider('protectedEndpoints')]
    public function test_student_cannot_access_admin_management(string $method, string $routeName): void
    {
        $student = User::factory()->create();
        $target = User::factory()->create();
        $parameters = str_contains($routeName, 'users.') && ! in_array($routeName, ['admin.users.store', 'admin.users.export'], true)
            ? ['user' => $target] : [];
        $this->actingAs($student)->call($method, route($routeName, $parameters))->assertForbidden();
        $this->assertDatabaseCount('users', 2);
        $this->assertDatabaseCount('admin_activity_logs', 0);
    }

    /** @return array<string, array{string, string}> */
    public static function protectedEndpoints(): array
    {
        return [
            'dashboard' => ['GET', 'admin.dashboard'], 'details' => ['GET', 'admin.users.show'],
            'creation' => ['POST', 'admin.users.store'], 'update' => ['PATCH', 'admin.users.update'],
            'deletion' => ['DELETE', 'admin.users.destroy'], 'export' => ['GET', 'admin.users.export'],
            'password change' => ['PUT', 'admin.password.update'],
        ];
    }

    public function test_dashboard_filters_students_and_reports_real_statistics(): void
    {
        $admin = User::factory()->admin()->create(['practice_score' => 100]);
        $target = User::factory()->create(['name' => 'Siti Aktif', 'gender' => 'wanita', 'completed_adventure_chapters' => 3, 'practice_score' => 80]);
        User::factory()->inactive()->create(['name' => 'Siti Nonaktif', 'gender' => 'wanita']);
        User::factory()->create(['name' => 'Budi Selesai', 'gender' => 'pria', 'completed_adventure_chapters' => 5, 'practice_score' => 100, 'certification_score' => 90]);

        $this->actingAs($admin)->get(route('admin.dashboard', ['q' => 'Siti', 'status' => 'active', 'progress' => 'in_progress', 'gender' => 'wanita']))
            ->assertOk()->assertViewHas('users', fn ($users): bool => $users->pluck('id')->all() === [$target->id])
            ->assertViewHas('stats', fn (array $stats): bool => $stats['total'] === 3 && $stats['active'] === 2 && $stats['inactive'] === 1
                && $stats['completed'] === 1 && (float) $stats['average_practice_score'] === 90.0 && (float) $stats['average_certification_score'] === 90.0)
            ->assertViewHas('chartProgress', [1, 0, 0, 1, 0, 1]);
    }

    public function test_empty_score_statistics_remain_null(): void
    {
        $admin = User::factory()->admin()->create();
        User::factory()->create();
        $this->actingAs($admin)->get(route('admin.dashboard'))->assertOk()->assertViewHas('stats', fn (array $stats): bool => $stats['average_practice_score'] === null && $stats['average_certification_score'] === null);
    }

    public function test_search_by_admin_email_cannot_bypass_student_filter(): void
    {
        $admin = User::factory()->admin()->create();
        $this->actingAs($admin)->get(route('admin.dashboard', ['q' => $admin->email]))->assertOk()
            ->assertViewHas('users', fn ($users): bool => $users->total() === 0);
    }

    public function test_creation_does_not_allow_role_promotion_or_progress_injection(): void
    {
        $admin = User::factory()->admin()->create();
        $response = $this->actingAs($admin)->post(route('admin.users.store'), [
            'name' => 'Siswa Baru', 'email' => 'baru@example.com', 'gender' => 'wanita',
            'password' => 'Password123!', 'password_confirmation' => 'Password123!',
            'is_admin' => 1, 'completed_adventure_chapters' => 5, 'practice_score' => 100,
        ]);
        $student = User::where('email', 'baru@example.com')->firstOrFail();
        $response->assertRedirect(route('admin.users.show', $student));
        $this->assertFalse($student->is_admin);
        $this->assertTrue($student->is_active);
        $this->assertSame(0, $student->completedAdventureChapters());
        $this->assertNull($student->practice_score);
        $this->assertTrue(Hash::check('Password123!', $student->password));
        $this->assertDatabaseHas('admin_activity_logs', ['admin_id' => $admin->id, 'user_id' => $student->id, 'action' => 'account_created']);
    }

    public function test_creation_validates_unique_email_gender_and_password(): void
    {
        $admin = User::factory()->admin()->create();
        $existing = User::factory()->create();
        $this->actingAs($admin)->post(route('admin.users.store'), [
            'name' => 'Siswa Baru', 'email' => $existing->email, 'gender' => 'invalid', 'password' => 'short', 'password_confirmation' => 'different',
        ])->assertSessionHasErrors(['email', 'gender', 'password']);
        $this->assertDatabaseCount('users', 2);
        $this->assertDatabaseCount('admin_activity_logs', 0);
    }

    public function test_admin_updates_scores_progress_and_gender_with_audit(): void
    {
        $admin = User::factory()->admin()->create();
        $student = User::factory()->create(['gender' => 'pria']);
        $this->actingAs($admin)->patch(route('admin.users.update', $student), $this->studentAttributes($student, [
            'name' => 'Siswa Diperbarui', 'gender' => 'wanita', 'completed_adventure_chapters' => 3, 'practice_score' => 88, 'is_admin' => 1,
        ]))->assertRedirect(route('admin.users.show', $student));
        $student->refresh();
        $this->assertSame('Siswa Diperbarui', $student->name);
        $this->assertSame('wanita', $student->gender);
        $this->assertTrue($student->isPracticeUnlocked());
        $this->assertFalse($student->isCertificationUnlocked());
        $this->assertSame(88, $student->practice_score);
        $this->assertNull($student->certification_score);
        $this->assertFalse($student->is_admin);
        $audit = DB::table('admin_activity_logs')->where('user_id', $student->id)->first();
        $metadata = json_decode($audit->metadata, true, flags: JSON_THROW_ON_ERROR);
        $this->assertSame(['before' => 0, 'after' => 3], $metadata['changes']['completed_adventure_chapters']);
        $this->assertFalse($metadata['password_reset']);
        $this->actingAs($admin)->get(route('admin.users.show', $student))->assertOk()
            ->assertViewHas('activityLogs', fn ($logs): bool => $logs->first()->admin_name === $admin->name);
    }

    #[DataProvider('invalidStudentUpdates')]
    public function test_invalid_updates_are_rejected_without_mutation(array $overrides, string $field): void
    {
        $admin = User::factory()->admin()->create();
        $student = User::factory()->create();
        $this->actingAs($admin)->patch(route('admin.users.update', $student), $this->studentAttributes($student, $overrides))->assertSessionHasErrors($field);
        $this->assertSame(0, $student->fresh()->completedAdventureChapters());
        $this->assertDatabaseCount('admin_activity_logs', 0);
    }

    /** @return array<string, array{array<string, mixed>, string}> */
    public static function invalidStudentUpdates(): array
    {
        return [
            'negative chapters' => [['completed_adventure_chapters' => -1], 'completed_adventure_chapters'],
            'too many chapters' => [['completed_adventure_chapters' => 6], 'completed_adventure_chapters'],
            'fractional chapters' => [['completed_adventure_chapters' => 2.5], 'completed_adventure_chapters'],
            'practice above maximum' => [['practice_score' => 101], 'practice_score'],
            'certification below minimum' => [['certification_score' => -1], 'certification_score'],
            'invalid status' => [['is_active' => 'admin'], 'is_active'],
            'invalid gender' => [['gender' => 'unknown'], 'gender'],
            'unconfirmed password' => [['password' => 'NewPassword123!'], 'password'],
        ];
    }

    public function test_deactivation_revokes_sessions_and_remember_token(): void
    {
        $admin = User::factory()->admin()->create();
        $student = User::factory()->create();
        $oldToken = $student->remember_token;
        $this->createSession($student, 'student-session');
        $this->createSession($admin, 'admin-session');
        $this->actingAs($admin)->patch(route('admin.users.update', $student), $this->studentAttributes($student, ['is_active' => 0]))->assertRedirect();
        $this->assertFalse($student->fresh()->is_active);
        $this->assertNotSame($oldToken, $student->fresh()->remember_token);
        $this->assertDatabaseMissing('sessions', ['id' => 'student-session']);
        $this->assertDatabaseHas('sessions', ['id' => 'admin-session']);
    }

    public function test_password_reset_revokes_sessions_and_never_logs_password_values(): void
    {
        $admin = User::factory()->admin()->create();
        $student = User::factory()->create();
        $this->createSession($student, 'student-session');
        DB::table('password_reset_tokens')->insert(['email' => $student->email, 'token' => 'old-token', 'created_at' => now()]);
        $this->actingAs($admin)->patch(route('admin.users.update', $student), $this->studentAttributes($student, [
            'password' => 'NewStudentPassword123!', 'password_confirmation' => 'NewStudentPassword123!',
        ]))->assertRedirect();
        $student->refresh();
        $this->assertTrue(Hash::check('NewStudentPassword123!', $student->password));
        $this->assertDatabaseMissing('sessions', ['user_id' => $student->id]);
        $this->assertDatabaseMissing('password_reset_tokens', ['email' => $student->email]);
        $metadata = (string) DB::table('admin_activity_logs')->value('metadata');
        $this->assertStringNotContainsString('NewStudentPassword123!', $metadata);
        $this->assertStringNotContainsString($student->password, $metadata);
        $this->assertTrue(json_decode($metadata, true, flags: JSON_THROW_ON_ERROR)['password_reset']);
    }

    public function test_admin_and_own_account_cannot_be_changed_or_deleted_as_students(): void
    {
        $admin = User::factory()->admin()->create();
        $otherAdmin = User::factory()->admin()->create();
        foreach ([$admin, $otherAdmin] as $target) {
            $this->actingAs($admin)->get(route('admin.users.show', $target))->assertForbidden();
            $this->actingAs($admin)->patch(route('admin.users.update', $target), $this->studentAttributes($target))->assertForbidden();
            $this->actingAs($admin)->delete(route('admin.users.destroy', $target), ['confirmation_email' => $target->email])->assertForbidden();
        }
        $this->assertDatabaseCount('users', 2);
        $this->assertDatabaseCount('admin_activity_logs', 0);
    }

    public function test_deletion_requires_exact_email_confirmation(): void
    {
        $admin = User::factory()->admin()->create();
        $student = User::factory()->create();
        $this->actingAs($admin)->delete(route('admin.users.destroy', $student), ['confirmation_email' => 'wrong@example.com'])->assertSessionHasErrors('confirmation_email');
        $this->assertDatabaseHas('users', ['id' => $student->id]);
        $this->assertDatabaseCount('admin_activity_logs', 0);
    }

    public function test_deletion_preserves_audit_snapshot_and_removes_sessions(): void
    {
        $admin = User::factory()->admin()->create();
        $student = User::factory()->create();
        $this->createSession($student, 'student-session');
        $this->actingAs($admin)->delete(route('admin.users.destroy', $student), ['confirmation_email' => $student->email])->assertRedirect(route('admin.dashboard'));
        $this->assertDatabaseMissing('users', ['id' => $student->id]);
        $this->assertDatabaseMissing('sessions', ['user_id' => $student->id]);
        $this->assertDatabaseHas('admin_activity_logs', [
            'admin_id' => $admin->id, 'user_id' => null, 'action' => 'account_deleted', 'subject_name' => $student->name, 'subject_email' => $student->email,
        ]);
    }

    public function test_filtered_csv_exports_only_matching_students_and_sanitizes_formulas(): void
    {
        $admin = User::factory()->admin()->create();
        $student = User::factory()->create([
            'name' => '=HYPERLINK("https://example.com")', 'email' => '+command@example.com', 'gender' => 'wanita', 'completed_adventure_chapters' => 3, 'practice_score' => 85,
        ]);
        $excluded = User::factory()->inactive()->create(['completed_adventure_chapters' => 3, 'gender' => 'wanita']);
        $content = $this->actingAs($admin)->get(route('admin.users.export', ['status' => 'active', 'gender' => 'wanita', 'progress' => 'in_progress']))
            ->assertOk()->assertDownload()->streamedContent();
        $this->assertStringStartsWith("\xEF\xBB\xBF", $content);
        $this->assertStringNotContainsString($admin->email, $content);
        $this->assertStringNotContainsString($excluded->email, $content);
        $this->assertStringNotContainsString($student->password, $content);
        $this->assertStringNotContainsString($student->remember_token, $content);
        $stream = fopen('php://memory', 'w+');
        fwrite($stream, substr($content, 3));
        rewind($stream);
        $headers = fgetcsv($stream, escape: '');
        $row = fgetcsv($stream, escape: '');
        $this->assertSame('Nilai Practice (manual)', $headers[6]);
        $this->assertSame("'".$student->name, $row[0]);
        $this->assertSame("'".$student->email, $row[1]);
        $this->assertSame('60', $row[5]);
        $this->assertSame('85', $row[6]);
        $this->assertSame('', $row[7]);
        $this->assertFalse(fgetcsv($stream, escape: ''));
        fclose($stream);
    }

    public function test_csv_streams_all_students_across_multiple_chunks(): void
    {
        $admin = User::factory()->admin()->create();
        User::factory()->count(205)->create(['gender' => 'pria']);
        $content = $this->actingAs($admin)->get(route('admin.users.export', ['gender' => 'pria']))->assertOk()->streamedContent();
        $this->assertCount(206, explode("\n", trim($content)));
        $this->assertStringNotContainsString($admin->email, $content);
    }

    public function test_admin_password_change_requires_current_password_and_confirmation(): void
    {
        $admin = User::factory()->admin()->create();
        $this->actingAs($admin)->put(route('admin.password.update'), [
            'current_password' => 'wrong', 'password' => 'NewAdminPassword123!', 'password_confirmation' => 'different',
        ])->assertSessionHasErrors(['current_password', 'password']);
        $this->assertTrue(Hash::check('password', $admin->fresh()->password));
        $this->assertDatabaseCount('admin_activity_logs', 0);
    }

    public function test_admin_can_change_own_password_and_revoke_other_sessions(): void
    {
        $admin = User::factory()->admin()->create();
        $oldToken = $admin->remember_token;
        $this->createSession($admin, 'another-device');
        $this->actingAs($admin)->put(route('admin.password.update'), [
            'current_password' => 'password', 'password' => 'NewAdminPassword123!', 'password_confirmation' => 'NewAdminPassword123!',
        ])->assertRedirect(route('admin.dashboard'));
        $this->assertAuthenticatedAs($admin);
        $this->assertTrue(Hash::check('NewAdminPassword123!', $admin->fresh()->password));
        $this->assertNotSame($oldToken, $admin->fresh()->remember_token);
        $this->assertDatabaseMissing('sessions', ['id' => 'another-device']);
        $this->assertDatabaseHas('admin_activity_logs', ['admin_id' => $admin->id, 'user_id' => $admin->id, 'action' => 'password_changed', 'metadata' => null]);
    }

    /**
     * @param  array<string, mixed>  $overrides
     * @return array<string, mixed>
     */
    private function studentAttributes(User $student, array $overrides = []): array
    {
        return array_replace([
            'name' => $student->name, 'email' => $student->email, 'gender' => $student->gender, 'is_active' => $student->is_active ? 1 : 0,
            'completed_adventure_chapters' => $student->completedAdventureChapters(), 'practice_score' => $student->practice_score, 'certification_score' => $student->certification_score,
        ], $overrides);
    }

    private function createSession(User $user, string $sessionId): void
    {
        DB::table('sessions')->insert(['id' => $sessionId, 'user_id' => $user->id, 'payload' => base64_encode(serialize([])), 'last_activity' => now()->timestamp]);
    }
}
