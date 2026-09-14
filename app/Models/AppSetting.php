<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AppSetting extends Model
{
    protected $fillable = [
        'outdoor_daily_order_cap',
        'overdue_days_threshold',
        'priority_tiers',
        'updated_by',
    ];

    protected $casts = [
        'priority_tiers' => 'array',
    ];

    public static function current(): self
    {
        $settings = static::first();

        if ($settings) {
            return $settings;
        }

        return static::create([
            'outdoor_daily_order_cap' => 12,
            'overdue_days_threshold' => 30,
            'priority_tiers' => [
                ['max_days' => 7, 'weight' => 1, 'priority' => 'LOW'],
                ['max_days' => 14, 'weight' => 2, 'priority' => 'LOW'],
                ['max_days' => 21, 'weight' => 3, 'priority' => 'MEDIUM'],
                ['max_days' => 30, 'weight' => 4, 'priority' => 'MEDIUM'],
                ['max_days' => 60, 'weight' => 5, 'priority' => 'HIGH'],
                ['max_days' => null, 'weight' => 6, 'priority' => 'HIGH'],
            ],
        ]);
    }
}
