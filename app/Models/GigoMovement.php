<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class GigoMovement extends Model
{
    use HasFactory;

    protected $fillable = [
        'document_no',
        'from_location_id',
        'to_location_id',
        'from_location_name',
        'to_location_name',
        'move_type',
        'moved_by',
        'moved_by_name',
    ];

    public function serviceOrder()
    {
        return $this->belongsTo(ServiceOrder::class, 'document_no', 'document_no');
    }

    public function toLocation()
    {
        return $this->belongsTo(GigoLocation::class, 'to_location_id');
    }

    public function fromLocation()
    {
        return $this->belongsTo(GigoLocation::class, 'from_location_id');
    }
}
