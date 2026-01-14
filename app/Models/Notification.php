<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Notification extends Model
{
    protected $fillable = [
        'title',          
        'message',         
        'recipient_id',    
        'sender_id',       
        'read_status',     
        'service_order_id',
        'notification_type', // Type (e.g., "status_update", "order_assignment")
    ];
    
}
