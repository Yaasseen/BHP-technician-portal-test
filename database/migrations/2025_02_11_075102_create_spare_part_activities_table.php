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
        Schema::create('spare_part_activities', function (Blueprint $table) {
            $table->id();
            $table->string('document_no'); 
            $table->string('spare_part_no')->nullable(); 
            $table->string('description')->nullable();
            $table->integer('quantity')->nullable();
            $table->string('requested_by')->nullable(); 
            $table->string('updated_by')->nullable(); 
            $table->date('requested_date')->nullable();
            $table->time('requested_time')->nullable();
            $table->integer('consumer_code')->nullable();
            $table->string('consumer')->nullable();
            $table->timestamps();

            // Foreign key constraint
            $table->foreign('document_no')
                ->references('document_no')
                ->on('service_orders')
                ->onDelete('cascade'); 
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('spare_part_activities');
    }
};
