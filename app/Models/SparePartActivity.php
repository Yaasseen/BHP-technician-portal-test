<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class SparePartActivity extends Model
{
    use HasFactory;
    protected $fillable = [
        'document_no',
        'spare_part_no',
        'description',
        'quantity',
        'requested_by',
        'updated_by',
        'requested_date',
        'requested_time',
        'consumer_code',
        'consumer',
        
    ];

    public function serviceOrder()
    {
        return $this->belongsTo(ServiceOrder::class, 'document_no', 'document_no');
    }
}
