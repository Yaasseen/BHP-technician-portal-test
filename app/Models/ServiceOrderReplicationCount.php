<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;


class ServiceOrderReplicationCount extends Model
{
    use HasFactory;

    protected $table = 'service_order_replication_counts';

    protected $fillable = [
        'max_replication_count'
    ];
}
