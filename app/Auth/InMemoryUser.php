<?php


namespace App\Auth;
use Illuminate\Support\Facades\Log;


use Illuminate\Contracts\Auth\Authenticatable;

class InMemoryUser implements Authenticatable
{
    protected $attributes;

    public function __construct(array $attributes)
    {
        $this->attributes = $attributes;
    }

    public function getAuthIdentifierName()
    {
        return 'ID';
    }

    public function getAuthIdentifier()
    {
        return $this->attributes['ID'];
    }

    public function getAuthPasswordName()
    {
        return 'Password';
    }

    public function getAuthPassword()
    {
        return $this->attributes['Password'];
    }

    public function getRememberToken()
    {
        return null;
    }

    public function setRememberToken($value)
    {
        // Not required for in-memory users.
    }

    public function getRememberTokenName()
    {
        return null;
    }

    public function __get($key)
    {
        return $this->attributes[$key] ?? null;
    }
  
}
