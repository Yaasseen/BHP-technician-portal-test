<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class GigoLocation extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'code',
        'type',
        'technician_id',
        'is_active',
        'created_by',
    ];

    protected $casts = [
        'is_active' => 'boolean',
    ];

    public function movements()
    {
        return $this->hasMany(GigoMovement::class, 'to_location_id');
    }
}
