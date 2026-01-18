<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;



class HomeController extends Controller
{
    public function index()
    {
        return Inertia::render('HomePage');
    }

    public function logged_in_user() {
        $user = Auth::guard('in-memory')->user();

        Log::info("==> logger in user is ID", ['uset'=> $user->ID]);
        return response()->json(["ID" => $user->ID, "Role" => $user->Technician_Type, "First_Name" => $user->First_Name, "Last_Name" => $user->Last_Name]);
    }

}