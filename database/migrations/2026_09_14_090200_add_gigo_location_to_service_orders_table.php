<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('service_orders', function (Blueprint $table) {
            $table->unsignedBigInteger('gigo_location_id')->nullable()->after('technician_name');
            $table->string('gigo_location_name')->nullable()->after('gigo_location_id');
            $table->timestamp('gigo_location_updated_at')->nullable()->after('gigo_location_name');

            $table->foreign('gigo_location_id')->references('id')->on('gigo_locations')->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('service_orders', function (Blueprint $table) {
            $table->dropForeign(['gigo_location_id']);
            $table->dropColumn(['gigo_location_id', 'gigo_location_name', 'gigo_location_updated_at']);
        });
    }
};
