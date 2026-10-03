<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use LogicException;

class AdminUserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $admin = User::firstOrNew(['email' => 'admin@netguard.com']);

        if ($admin->exists) {
            if (! $admin->isAdmin()) {
                throw new LogicException('Email admin@netguard.com sudah digunakan akun peserta. Akun tersebut tidak diubah.');
            }

            return;
        }

        $adminPassword = config('auth.admin_password');

        if (! is_string($adminPassword) || trim($adminPassword) === '') {
            throw new LogicException('NETGUARD_ADMIN_PASSWORD harus diatur di .env sebelum membuat akun admin.');
        }

        $admin->forceFill([
            'name' => 'Administrator',
            'gender' => 'pria',
            'password' => $adminPassword,
            'is_admin' => true,
            'is_active' => true,
            'email_verified_at' => now(),
        ])->save();
    }
}
