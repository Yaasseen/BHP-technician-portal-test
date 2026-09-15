<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('app_settings', function (Blueprint $table) {
            $table->id();
            $table->unsignedInteger('outdoor_daily_order_cap')->default(12);
            $table->unsignedInteger('overdue_days_threshold')->default(30);
            $table->json('priority_tiers');
            $table->string('updated_by')->nullable();
            $table->timestamps();
        });

        DB::table('app_settings')->insert([
            'outdoor_daily_order_cap' => 12,
            'overdue_days_threshold' => 30,
            'priority_tiers' => json_encode([
                ['max_days' => 7, 'weight' => 1, 'priority' => 'LOW'],
                ['max_days' => 14, 'weight' => 2, 'priority' => 'LOW'],
                ['max_days' => 21, 'weight' => 3, 'priority' => 'MEDIUM'],
                ['max_days' => 30, 'weight' => 4, 'priority' => 'MEDIUM'],
                ['max_days' => 60, 'weight' => 5, 'priority' => 'HIGH'],
                ['max_days' => null, 'weight' => 6, 'priority' => 'HIGH'],
            ]),
            'created_at' => now(),
            'updated_at' => now(),
        ]);
    }

    public function down(): void
    {
        Schema::dropIfExists('app_settings');
    }
};
