<?php

use App\Http\Controllers\AdminController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\ChapterOneController;
use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return view('welcome');
})->name('home');

Route::view('/uji-hap', 'hap-preview')->name('hap.preview');

Route::get('/login', [AuthController::class, 'showLogin'])->name('login');
Route::post('/login', [AuthController::class, 'login'])->middleware('throttle:10,1')->name('login.attempt');
Route::get('/register', [AuthController::class, 'showRegister'])->name('register');
Route::post('/register', [AuthController::class, 'register'])->middleware('throttle:5,1')->name('register.store');
Route::post('/logout', [AuthController::class, 'logout'])->middleware('auth')->name('logout');
Route::view('/homepage', 'homepage')->middleware(['auth', 'active'])->name('homepage');
Route::view('/adventure', 'adventure')->middleware(['auth', 'active'])->name('adventure');
Route::get('/adventure/chapter-1', [ChapterOneController::class, 'show'])->middleware(['auth', 'active'])->name('chapter.one');
Route::post('/adventure/chapter-1/complete', [ChapterOneController::class, 'complete'])->middleware(['auth', 'active', 'throttle:10,1'])->name('chapter.one.complete');
Route::post('/adventure/chapter-1/reset', [ChapterOneController::class, 'resetProgress'])->middleware(['auth', 'active', 'throttle:5,1'])->name('chapter.one.reset');

Route::get('/admin/login', [AuthController::class, 'showAdminLogin'])->name('admin.login');
Route::post('/admin/login', [AuthController::class, 'adminLogin'])->middleware('throttle:10,1')->name('admin.login.attempt');

Route::prefix('admin')->name('admin.')->middleware(['auth', 'active', 'admin'])->group(function (): void {
    Route::get('/', [AdminController::class, 'index'])->name('dashboard');
    Route::get('/users/export', [AdminController::class, 'export'])->name('users.export');
    Route::post('/users', [AdminController::class, 'store'])->name('users.store');
    Route::get('/users/{user}', [AdminController::class, 'show'])->name('users.show');
    Route::patch('/users/{user}', [AdminController::class, 'update'])->name('users.update');
    Route::delete('/users/{user}', [AdminController::class, 'destroy'])->name('users.destroy');
    Route::put('/password', [AdminController::class, 'changePassword'])->name('password.update');
});
