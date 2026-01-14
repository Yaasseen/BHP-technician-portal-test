<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class TeamRegionActivity extends Model
{
    use HasFactory;
    protected $fillable = [
        'document_no',
        'team',
        'region',
        'assigned_by',
        'updated_by',
        'schedule_date',
        'assigned_date',
        'assigned_time',
    ];

    public function serviceOrder()
    {
        return $this->belongsTo(ServiceOrder::class, 'document_no', 'document_no');
    }
}
