<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ServiceOrder extends Model
{
    use HasFactory;

    protected $primaryKey = 'document_no';
    public $incrementing = false;
    protected $keyType = 'string';
    protected $fillable = [
        'document_no',
        'gspn_no',
        'order_date',
        'name',
        'address',
        'address_2',
        'city',
        'phone_no',
        'warranty_type',
        'remarks',
        "customer_complaint",
        'item_no',
        'description',
        'serial_no',
        "dop",
        'repair_status_code',
        'department',
        'region',
        'document_type',
        'shortcut_dimension_1_code',
        'line_no',
        'actual_purchase_date',
        'technician_id',
        'technician_name',
        "priority",
        'schedule_date',
        'schedule_time',
        'service_order_type',
        'replication_counter',
        'priority_weight',
        'service_order_status',
        'allocation_date',
        'service_item_no',
        'service_item_group_code',
        'status',
        'brand_code',
        'mobile_no',
        'customer_no',

    ];
}
