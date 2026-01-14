<?php

namespace App\Providers;

use App\Auth\CustomGuard;
use App\Auth\InMemoryUserProvider;
use Illuminate\Support\Facades\Auth;
use Illuminate\Foundation\Support\Providers\AuthServiceProvider as ServiceProvider;
use Symfony\Component\HttpFoundation\Request;
use Illuminate\Contracts\Cookie\QueueingFactory as CookieJar;
use App\Services\BusinessCentral;
use Illuminate\Support\Facades\Log;




class AuthServiceProvider extends ServiceProvider
{

    
    public function boot(): void
    {
        // Register the custom user provider
        Auth::provider('in-memory', function ($app, array $config) {

            $businessCentral = BusinessCentral::getInstance(); 

    
            return new InMemoryUserProvider($businessCentral);
        });

        // Register the custom guard
        Auth::extend('custom', function ($app, $name, array $config) {
            $provider = Auth::createUserProvider($config['provider']);
            $session = $app['session.store'];
            $request = $app->make(Request::class);
            $cookie = $app->make(CookieJar::class);
            return new \App\Auth\CustomGuard($name, $provider, $session, $request, $cookie);
        });
    }
}


