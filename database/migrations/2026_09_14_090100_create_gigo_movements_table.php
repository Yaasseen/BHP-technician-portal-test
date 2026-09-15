<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('gigo_movements', function (Blueprint $table) {
            $table->id();
            $table->string('document_no');
            $table->unsignedBigInteger('from_location_id')->nullable();
            $table->unsignedBigInteger('to_location_id')->nullable();
            $table->string('from_location_name')->nullable();
            $table->string('to_location_name');
            $table->enum('move_type', ['scan', 'bulk_scan', 'auto_assign'])->default('scan');
            $table->string('moved_by')->nullable();
            $table->string('moved_by_name')->nullable();
            $table->timestamps();

            $table->foreign('document_no')->references('document_no')->on('service_orders')->onDelete('cascade');
            $table->foreign('from_location_id')->references('id')->on('gigo_locations')->nullOnDelete();
            $table->foreign('to_location_id')->references('id')->on('gigo_locations')->nullOnDelete();
            $table->index(['document_no', 'created_at']);
            $table->index('to_location_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('gigo_movements');
    }
};
