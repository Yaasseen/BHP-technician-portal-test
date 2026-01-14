<?php

namespace App\Auth;

namespace App\Auth;
use Illuminate\Auth\SessionGuard;
use Illuminate\Contracts\Cookie\QueueingFactory as CookieJar;
use Illuminate\Contracts\Session\Session;
use Symfony\Component\HttpFoundation\Request;

class CustomGuard extends SessionGuard
{
    public function __construct($name, $provider, Session $session, Request $request, CookieJar $cookie)
    {
        // Pass the cookie jar to the parent constructor
        parent::__construct($name, $provider, $session, $request);
        // Set the cookie jar
        $this->setCookieJar($cookie);
    }
}