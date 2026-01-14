<?php

namespace App\Http\Controllers\Auth;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Auth;
use App\Http\Requests\Auth\LoginRequest;
use App\Http\Controllers\Controller;
use App\Services\BusinessCentral;
use Inertia\Inertia;


class LoginController extends Controller
{
    protected $businessCentral;

    public function __construct()
    {
        $this->businessCentral = BusinessCentral::getInstance();
    }


    public function showLoginForm()
    {
        Log::info("Received login request.");
        if (Auth::check()) {
            return view('dashboard', ['user' => Auth::user()]);
        } else {
            return view('auth/login', ["errors" => []]);
        }

    }

    public function login(LoginRequest $request)
    {
        try {
            $validatedData = $request->validated();
            if (Auth::guard('in-memory')->attempt([
                'username' => $validatedData['username'],
                'password' => $validatedData['password']
            ])) {
                return response()->json();
            } else {
                return response()->json(["password" => "Password Does not match"], 401);
            }

        } catch (\Exception $e) {
            return response()->json(["username" => $e->getMessage()], 401);
        }
    }

    public function logout(Request $request)
    {
        try {
            Auth::guard('in-memory')->logout();
            $request->session()->invalidate();
            $request->session()->regenerateToken();
            return response()->json();
        } catch (\Exception $e) {
            return response()->json(["username" => $e->getMessage()], 401);
        }  
    }
}