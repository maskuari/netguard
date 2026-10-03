<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Contracts\View\View;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    public function showLogin(): View|RedirectResponse
    {
        if (Auth::check()) {
            return redirect()->route(Auth::user()->isAdmin() ? 'admin.dashboard' : 'homepage');
        }

        return view('auth', ['mode' => 'login']);
    }

    public function showRegister(): View|RedirectResponse
    {
        if (Auth::check()) {
            return redirect()->route(Auth::user()->isAdmin() ? 'admin.dashboard' : 'homepage');
        }

        return view('auth', ['mode' => 'register']);
    }

    public function login(Request $request): RedirectResponse|JsonResponse
    {
        $credentials = $request->validate([
            'email' => ['required', 'email'],
            'password' => ['required', 'string'],
        ], [
            'email.required' => 'Email wajib diisi.',
            'email.email' => 'Format email tidak valid.',
            'password.required' => 'Password wajib diisi.',
        ]);

        if (! Auth::attempt([...$credentials, 'is_active' => true], $request->boolean('remember'))) {
            throw ValidationException::withMessages([
                'email' => 'Email atau password tidak sesuai, atau akun telah dinonaktifkan.',
            ]);
        }

        return $this->finishLogin($request);
    }

    public function showAdminLogin(): View|RedirectResponse
    {
        if (Auth::check()) {
            return redirect()->route(Auth::user()->isAdmin() ? 'admin.dashboard' : 'homepage');
        }

        return view('admin-login');
    }

    public function adminLogin(Request $request): RedirectResponse|JsonResponse
    {
        $credentials = $request->validate([
            'email' => ['required', 'email'],
            'password' => ['required', 'string'],
        ], [
            'email.required' => 'Email admin wajib diisi.',
            'email.email' => 'Format email tidak valid.',
            'password.required' => 'Password wajib diisi.',
        ]);

        if (! Auth::attempt([...$credentials, 'is_admin' => true, 'is_active' => true], $request->boolean('remember'))) {
            throw ValidationException::withMessages([
                'email' => 'Email atau password admin tidak sesuai, atau akun telah dinonaktifkan.',
            ]);
        }

        return $this->finishLogin($request);
    }

    private function finishLogin(Request $request): RedirectResponse|JsonResponse
    {
        $request->session()->regenerate();

        /** @var User $user */
        $user = $request->user();
        $user->last_login_at = now();
        $user->save();

        $destination = $user->isAdmin() ? 'admin' : 'homepage';
        $destinationRoute = $user->isAdmin() ? 'admin.dashboard' : 'homepage';

        if ($request->expectsJson()) {
            return response()->json([
                'redirect' => route($destinationRoute),
                'destination' => $destination,
            ]);
        }

        if ($user->isAdmin()) {
            $request->session()->forget('url.intended');

            return redirect()->route($destinationRoute);
        }

        $intendedUrl = $request->session()->get('url.intended');

        if (is_string($intendedUrl) && str_starts_with($intendedUrl, url('/admin'))) {
            $request->session()->forget('url.intended');
        }

        return redirect()->intended(route($destinationRoute));
    }

    public function register(Request $request): RedirectResponse|JsonResponse
    {
        $attributes = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255', 'unique:users,email'],
            'gender' => ['required', 'string', 'in:pria,wanita'],
            'password' => ['required', 'string', 'min:8', 'confirmed'],
        ], [
            'name.required' => 'Nama lengkap wajib diisi.',
            'email.required' => 'Email wajib diisi.',
            'email.email' => 'Format email tidak valid.',
            'email.unique' => 'Email ini sudah terdaftar. Silakan login.',
            'gender.required' => 'Pilih jenis kelamin terlebih dahulu.',
            'gender.in' => 'Pilih jenis kelamin pria atau wanita.',
            'password.required' => 'Password wajib diisi.',
            'password.min' => 'Password minimal 8 karakter.',
            'password.confirmed' => 'Konfirmasi password belum sama.',
        ]);

        User::create($attributes);

        if ($request->expectsJson()) {
            return response()->json([
                'message' => 'Pendaftaran berhasil! Silakan login untuk memulai.',
                'redirect' => route('login'),
            ], 201);
        }

        return redirect()->route('login')->with('status', 'Pendaftaran berhasil! Silakan login untuk memulai.');
    }

    public function logout(Request $request): RedirectResponse
    {
        Auth::logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect()->route('home');
    }
}
