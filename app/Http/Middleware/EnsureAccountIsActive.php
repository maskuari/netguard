<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class EnsureAccountIsActive
{
    /**
     * Handle an incoming request.
     *
     * @param  Closure(Request): (Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        if ($request->user() !== null && ! $request->user()->is_active) {
            Auth::logout();
            $request->session()->invalidate();
            $request->session()->regenerateToken();

            $loginRoute = $request->is('admin', 'admin/*') ? 'admin.login' : 'login';
            $message = 'Akun Anda telah dinonaktifkan. Hubungi administrator.';

            if ($request->expectsJson()) {
                return response()->json([
                    'message' => $message,
                    'redirect' => route($loginRoute),
                ], 401);
            }

            return redirect()->route($loginRoute)->withErrors(['email' => $message]);
        }

        return $next($request);
    }
}
