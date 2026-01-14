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
        Schema::create('team_region_activities', function (Blueprint $table) {
            $table->id();
            $table->string('document_no'); 
            $table->string('team')->nullable(); 
            $table->string('region')->nullable();
            $table->string('assigned_by')->nullable(); 
            $table->string('updated_by')->nullable(); 
            $table->date('schedule_date')->nullable();
            $table->date('assigned_date')->nullable();
            $table->time('assigned_time')->nullable();
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
        Schema::dropIfExists('team_region_activities');
    }
};
