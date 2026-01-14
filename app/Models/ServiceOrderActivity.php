<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class ServiceOrderActivity extends Model
{
    use HasFactory;


    protected $fillable = [
        'document_no',
        'repair_status_code',
        'service_order_status',
        'description',
        'image_data',
        'image_name',
        'signature_data',
        'signature_name',
        'allocation_status',
        'created_by',
        'updated_by',
        'date',
        'time',
    ];

    /**
     * Relationship with ServiceOrder
     */
    public function serviceOrder()
    {
        return $this->belongsTo(ServiceOrder::class, 'document_no', 'document_no');
    }
}
