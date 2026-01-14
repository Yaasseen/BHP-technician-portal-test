<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;


class TeamSchedule extends Model
{
    use HasFactory;

    protected $fillable = ['active', 'day', 'team', 'region', 'date'];
}
