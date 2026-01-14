<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('service_order_activities', function (Blueprint $table) {
            $table->id(); 
            $table->string('document_no'); 
            $table->string('repair_status_code')->nullable();
            $table->string('description')->nullable();
            $table->binary('image_data')->nullable();
            $table->string('image_name')->nullable();
            $table->binary('signature_data')->nullable(); 
            $table->string('signature_name')->nullable(); 
            $table->string('created_by')->nullable(); 
            $table->string('updated_by')->nullable(); 
            $table->date('date')->nullable();
            $table->time('time')->nullable();

            $table->timestamps(); 

            // Foreign key constraint
            $table->foreign('document_no')
                ->references('document_no')
                ->on('service_orders')
                ->onDelete('cascade'); 
        });

        DB::statement('ALTER TABLE service_order_activities MODIFY image_data LONGBLOB NULL');
        DB::statement('ALTER TABLE service_order_activities MODIFY signature_data BLOB NULL');
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('service_order_activities');
    }
};
