<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->boolean('is_admin')->default(false)->index();
            $table->boolean('is_active')->default(true)->index();
            $table->timestamp('last_login_at')->nullable();
            $table->unsignedTinyInteger('practice_score')->nullable();
            $table->unsignedTinyInteger('certification_score')->nullable();
        });

        Schema::create('admin_activity_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('admin_id')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('action', 50);
            $table->string('subject_name');
            $table->string('subject_email');
            $table->json('metadata')->nullable();
            $table->timestamp('created_at')->useCurrent()->index();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('admin_activity_logs');

        Schema::table('users', function (Blueprint $table) {
            $table->dropIndex(['is_admin']);
            $table->dropIndex(['is_active']);
            $table->dropColumn(['is_admin', 'is_active', 'last_login_at', 'practice_score', 'certification_score']);
        });
    }
};
