<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use PHPUnit\Framework\Attributes\DataProvider;
use Tests\TestCase;

class AuthenticationTest extends TestCase
{
    use RefreshDatabase;

    public function test_guest_cannot_open_homepage(): void
    {
        $this->get(route('homepage'))->assertRedirect(route('login'));
    }

    public function test_registration_shows_confirmation_then_requires_login(): void
    {
        $this->post(route('register.store'), [
            'name' => 'Budi Santoso',
            'email' => 'budi@example.com',
            'gender' => 'pria',
            'password' => 'Password123!',
            'password_confirmation' => 'Password123!',
        ])->assertRedirect(route('login'))->assertSessionHas('status', 'Pendaftaran berhasil! Silakan login untuk memulai.');

        $user = User::where('email', 'budi@example.com')->firstOrFail();

        $this->assertGuest();
        $this->assertSame('pria', $user->gender);
        $this->assertTrue(Hash::check('Password123!', $user->password));
        $this->get(route('login'))->assertOk()->assertSeeText('Pendaftaran berhasil!');

        $this->post(route('login.attempt'), [
            'email' => 'budi@example.com',
            'password' => 'Password123!',
        ])->assertRedirect(route('homepage'));

        $this->assertAuthenticatedAs($user);
        $this->get(route('homepage'))->assertOk()->assertSeeText('Budi Santoso');
    }

    public function test_ajax_registration_returns_success_without_logging_in(): void
    {
        $this->postJson(route('register.store'), [
            'name' => 'Dina Putri',
            'email' => 'dina@example.com',
            'gender' => 'wanita',
            'password' => 'Password123!',
            'password_confirmation' => 'Password123!',
        ])->assertCreated()->assertJsonPath('redirect', route('login'));

        $this->assertDatabaseHas('users', ['email' => 'dina@example.com', 'gender' => 'wanita', 'completed_adventure_chapters' => 0]);
        $this->assertGuest();
    }

    public function test_ajax_login_returns_homepage_after_valid_credentials(): void
    {
        $user = User::factory()->create();

        $this->postJson(route('login.attempt'), [
            'email' => $user->email,
            'password' => 'password',
        ])->assertOk()->assertJsonPath('redirect', route('homepage'));

        $this->assertAuthenticatedAs($user);
    }

    public function test_login_checks_password_and_logout_ends_session(): void
    {
        $user = User::factory()->create(['name' => 'Siti Aminah']);

        $this->post(route('login.attempt'), [
            'email' => $user->email,
            'password' => 'salah',
        ])->assertSessionHasErrors('email');

        $this->assertGuest();

        $this->post(route('login.attempt'), [
            'email' => $user->email,
            'password' => 'password',
            'remember' => 'on',
        ])->assertRedirect(route('homepage'));

        $this->assertAuthenticatedAs($user);
        $this->get(route('homepage'))->assertOk()->assertSeeText('Siti Aminah');

        $this->post(route('logout'))->assertRedirect(route('home'));

        $this->assertGuest();
        $this->get(route('homepage'))->assertRedirect(route('login'));
    }

    public function test_registration_rejects_duplicate_email_and_mismatched_password(): void
    {
        $user = User::factory()->create();

        $this->post(route('register.store'), [
            'name' => 'Budi Santoso',
            'email' => $user->email,
            'password' => 'Password123!',
            'gender' => 'pria',
            'password_confirmation' => 'berbeda',
        ])->assertSessionHasErrors(['email', 'password']);

        $this->assertDatabaseCount('users', 1);
        $this->assertGuest();
    }

    #[DataProvider('invalidGenders')]
    public function test_registration_requires_a_valid_gender(mixed $gender): void
    {
        $this->postJson(route('register.store'), [
            'name' => 'Budi Santoso',
            'email' => 'budi@example.com',
            'gender' => $gender,
            'password' => 'Password123!',
            'password_confirmation' => 'Password123!',
        ])->assertUnprocessable()->assertJsonValidationErrors('gender');

        $this->assertDatabaseCount('users', 0);
        $this->assertGuest();
    }

    /** @return array<string, array{mixed}> */
    public static function invalidGenders(): array
    {
        return [
            'missing selection' => [null],
            'unsupported value' => ['lainnya'],
            'non-string value' => [['pria']],
        ];
    }

    public function test_registration_cannot_unlock_modes_by_submitting_progress(): void
    {
        $this->postJson(route('register.store'), [
            'name' => 'Budi Santoso',
            'email' => 'budi@example.com',
            'gender' => 'pria',
            'password' => 'Password123!',
            'password_confirmation' => 'Password123!',
            'completed_adventure_chapters' => 5,
        ])->assertCreated();

        $user = User::where('email', 'budi@example.com')->firstOrFail();

        $this->assertSame(0, $user->completedAdventureChapters());
        $this->assertFalse($user->isPracticeUnlocked());
        $this->assertFalse($user->isCertificationUnlocked());
    }
}
