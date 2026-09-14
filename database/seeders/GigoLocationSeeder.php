<?php

namespace Database\Seeders;

use App\Models\GigoLocation;
use Illuminate\Database\Seeder;

class GigoLocationSeeder extends Seeder
{
    public function run(): void
    {
        $defaults = [
            ['name' => 'GIGO', 'code' => 'GIGO'],
            ['name' => 'Workshop', 'code' => 'WORKSHOP'],
            ['name' => 'Dispatch', 'code' => 'DISPATCH'],
        ];

        foreach ($defaults as $location) {
            GigoLocation::firstOrCreate(
                ['code' => $location['code']],
                ['name' => $location['name'], 'type' => 'static', 'is_active' => true]
            );
        }
    }
}
