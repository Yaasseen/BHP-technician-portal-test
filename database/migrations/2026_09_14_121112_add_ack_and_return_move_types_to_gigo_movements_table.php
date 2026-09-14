<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        DB::statement("ALTER TABLE gigo_movements MODIFY move_type ENUM('scan', 'bulk_scan', 'auto_assign', 'technician_ack', 'job_complete_return') NOT NULL DEFAULT 'scan'");
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        DB::statement("ALTER TABLE gigo_movements MODIFY move_type ENUM('scan', 'bulk_scan', 'auto_assign') NOT NULL DEFAULT 'scan'");
    }
};
