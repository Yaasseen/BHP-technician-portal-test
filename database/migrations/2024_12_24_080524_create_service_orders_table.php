<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('service_orders', function (Blueprint $table) {
            $table->string('document_no')->primary();
            $table->string('gspn_no')->nullable();
            $table->date('order_date')->nullable();
            $table->string('name')->nullable();
            $table->string('address')->nullable();
            $table->string('address_2')->nullable();
            $table->string('city')->nullable();
            $table->string('phone_no')->nullable();
            $table->string('warranty_type')->nullable();
            $table->text('remarks')->nullable()->nullable();
            $table->text('customer_complaint')->nullable();
            $table->string('item_no')->nullable();
            $table->string('description')->nullable();
            $table->string('serial_no')->nullable();
            $table->string('dop')->nullable();
            $table->string('repair_status_code')->nullable();
            $table->string('department')->nullable();
            $table->string('region')->nullable();
            $table->string('document_type')->nullable();
            $table->string('shortcut_dimension_1_code')->nullable();
            $table->integer('line_no')->nullable();
            $table->date('actual_purchase_date')->nullable();
            $table->string('technician_id')->nullable();
            $table->string('priority')->default("LOW");
            $table->date('schedule_date')->nullable();
            $table->time('schedule_time')->nullable();

            $table->timestamps(); 
        });

    }

    public function down(): void
    {
        Schema::dropIfExists('service_orders');
    }
};
