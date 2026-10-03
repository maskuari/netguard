<?php

namespace Tests\Feature;

use App\Models\User;
use Database\Seeders\AdminUserSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use LogicException;
use Tests\TestCase;

class AdminAuthenticationTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_area_redirects_guests_to_the_dedicated_login(): void
    {
        $this->get(route('admin.dashboard'))->assertRedirect(route('admin.login'));
        $this->get(route('admin.login'))->assertOk()->assertViewIs('admin-login');
    }

    public function test_dedicated_admin_login_authenticates_and_records_last_login(): void
    {
        $admin = User::factory()->admin()->create();

        $this->post(route('admin.login.attempt'), [
            'email' => $admin->email,
            'password' => 'password',
            'remember' => 'on',
        ])->assertRedirect(route('admin.dashboard'));

        $this->assertAuthenticatedAs($admin);
        $this->assertNotNull($admin->fresh()->last_login_at);
        $this->get(route('admin.dashboard'))->assertOk();
    }

    public function test_normal_login_directs_admin_to_the_dashboard(): void
    {
        $admin = User::factory()->admin()->create();

        $this->withSession(['url.intended' => route('adventure')])
            ->post(route('login.attempt'), [
                'email' => $admin->email,
                'password' => 'password',
            ])->assertRedirect(route('admin.dashboard'));

        $this->assertAuthenticatedAs($admin);
    }

    public function test_ajax_admin_login_returns_the_admin_destination(): void
    {
        $admin = User::factory()->admin()->create();

        $this->postJson(route('admin.login.attempt'), [
            'email' => $admin->email,
            'password' => 'password',
        ])->assertOk()
            ->assertJsonPath('redirect', route('admin.dashboard'))
            ->assertJsonPath('destination', 'admin');

        $this->assertAuthenticatedAs($admin);
    }

    public function test_ajax_normal_login_also_supports_the_admin_destination(): void
    {
        $admin = User::factory()->admin()->create();

        $this->postJson(route('login.attempt'), [
            'email' => $admin->email,
            'password' => 'password',
        ])->assertOk()->assertJsonPath('destination', 'admin');
    }

    public function test_logged_in_admin_is_redirected_from_public_auth_pages(): void
    {
        $admin = User::factory()->admin()->create();

        $this->actingAs($admin)->get(route('login'))->assertRedirect(route('admin.dashboard'));
        $this->get(route('register'))->assertRedirect(route('admin.dashboard'));
        $this->get(route('admin.login'))->assertRedirect(route('admin.dashboard'));
    }

    public function test_student_credentials_cannot_log_in_through_the_admin_form(): void
    {
        $student = User::factory()->create();

        $this->postJson(route('admin.login.attempt'), [
            'email' => $student->email,
            'password' => 'password',
        ])->assertUnprocessable()->assertJsonValidationErrors('email');

        $this->assertGuest();
        $this->assertNull($student->fresh()->last_login_at);
    }

    public function test_authenticated_student_cannot_access_admin_routes(): void
    {
        $student = User::factory()->create();

        $this->actingAs($student)->get(route('admin.dashboard'))->assertForbidden();
        $this->get(route('admin.login'))->assertRedirect(route('homepage'));
    }

    public function test_inactive_student_cannot_log_in(): void
    {
        $student = User::factory()->inactive()->create();

        $this->postJson(route('login.attempt'), [
            'email' => $student->email,
            'password' => 'password',
        ])->assertUnprocessable()->assertJsonValidationErrors('email');

        $this->assertGuest();
        $this->assertNull($student->fresh()->last_login_at);
    }

    public function test_inactive_admin_cannot_log_in_to_either_form(): void
    {
        $admin = User::factory()->admin()->inactive()->create();

        foreach (['admin.login.attempt', 'login.attempt'] as $loginRoute) {
            $this->postJson(route($loginRoute), [
                'email' => $admin->email,
                'password' => 'password',
            ])->assertUnprocessable()->assertJsonValidationErrors('email');

            $this->assertGuest();
        }
    }

    public function test_disabling_an_account_ends_an_existing_authenticated_session(): void
    {
        $student = User::factory()->create();

        $this->post(route('login.attempt'), [
            'email' => $student->email,
            'password' => 'password',
            'remember' => 'on',
        ])->assertRedirect(route('homepage'));

        $this->assertAuthenticatedAs($student);
        $student->is_active = false;
        $student->save();
        $this->app['auth']->forgetGuards();

        $this->get(route('homepage'))->assertRedirect(route('login'))->assertSessionHasErrors('email');

        $this->assertGuest();
    }

    public function test_inactive_admin_session_is_denied_and_sent_to_admin_login(): void
    {
        $admin = User::factory()->admin()->inactive()->create();

        $this->actingAs($admin)->get(route('admin.dashboard'))
            ->assertRedirect(route('admin.login'))->assertSessionHasErrors('email');

        $this->assertGuest();
    }

    public function test_remember_cookie_cannot_restore_access_for_a_disabled_account(): void
    {
        $student = User::factory()->inactive()->create();
        $rememberToken = $student->remember_token;
        $rememberCookieName = Auth::guard()->getRecallerName();
        $rememberCookie = implode('|', [$student->id, $rememberToken, $student->password]);

        $this->withCookie($rememberCookieName, $rememberCookie)
            ->get(route('homepage'))
            ->assertRedirect(route('login'))
            ->assertSessionHasErrors('email');

        $this->assertGuest();
        $this->assertNotSame($rememberToken, $student->fresh()->remember_token);
    }

    public function test_inactive_authenticated_json_request_is_denied(): void
    {
        $student = User::factory()->inactive()->create();

        $this->actingAs($student)->getJson(route('homepage'))
            ->assertUnauthorized()->assertJsonPath('redirect', route('login'));

        $this->assertGuest();
    }

    public function test_public_registration_cannot_assign_admin_status_or_manual_scores(): void
    {
        $this->postJson(route('register.store'), [
            'name' => 'Budi Santoso',
            'email' => 'budi@example.com',
            'gender' => 'pria',
            'password' => 'Password123!',
            'password_confirmation' => 'Password123!',
            'is_admin' => true,
            'is_active' => false,
            'practice_score' => 100,
            'certification_score' => 100,
        ])->assertCreated();

        $student = User::where('email', 'budi@example.com')->firstOrFail();

        $this->assertFalse($student->isAdmin());
        $this->assertTrue($student->is_active);
        $this->assertNull($student->practice_score);
        $this->assertNull($student->certification_score);
        $this->assertFalse($student->isFillable('is_admin'));
        $this->assertFalse($student->isFillable('is_active'));
        $this->assertGuest();
    }

    public function test_admin_seeder_provisions_a_hashed_account_without_resetting_existing_accounts(): void
    {
        config()->set('auth.admin_password', 'AdminTestPassword123!');
        $student = User::factory()->create();
        $this->seed(AdminUserSeeder::class);

        $admin = User::where('email', 'admin@netguard.com')->firstOrFail();

        $this->assertTrue($admin->isAdmin());
        $this->assertTrue($admin->is_active);
        $this->assertSame('pria', $admin->gender);
        $this->assertTrue(Hash::check('AdminTestPassword123!', $admin->password));

        $admin->name = 'Updated Administrator';
        $admin->password = 'UpdatedPassword123!';
        $admin->save();
        $this->seed(AdminUserSeeder::class);

        $this->assertDatabaseCount('users', 2);
        $this->assertTrue(Hash::check('UpdatedPassword123!', $admin->fresh()->password));
        $this->assertSame('Updated Administrator', $admin->fresh()->name);
        $this->assertDatabaseHas('users', ['id' => $student->id, 'is_admin' => false]);
    }

    public function test_admin_seeder_does_not_promote_a_student_using_the_reserved_email(): void
    {
        $student = User::factory()->create(['email' => 'admin@netguard.com']);

        try {
            $this->seed(AdminUserSeeder::class);
            $this->fail('Seeder must reject an existing student account.');
        } catch (LogicException $exception) {
            $this->assertStringContainsString('sudah digunakan akun peserta', $exception->getMessage());
        }

        $this->assertFalse($student->fresh()->isAdmin());
        $this->assertTrue(Hash::check('password', $student->fresh()->password));
    }
}
