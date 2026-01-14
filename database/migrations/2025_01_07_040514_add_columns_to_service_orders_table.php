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
        Schema::table('service_orders', function (Blueprint $table) {
            $table->string('service_order_type')->nullable();
            $table->integer('replication_counter')->nullable();
            $table->integer('priority_weight')->default(1);
            $table->string('service_order_status')->nullable();
            $table->string('technician_name')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('service_orders', function (Blueprint $table) {
            //
        });
    }
};
