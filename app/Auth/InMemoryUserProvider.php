<?php

namespace App\Auth;

use Illuminate\Contracts\Auth\UserProvider;
use Illuminate\Contracts\Auth\Authenticatable;
use Illuminate\Support\Facades\Log;


class InMemoryUserProvider implements UserProvider
{
    protected $businessCentral;

    public function __construct($businessCentral)
    {
        $this->businessCentral = $businessCentral;
    }

    public function retrieveById($identifier)
    {
        $technicianList = $this->businessCentral->technicianList();
        foreach ($technicianList as $technician) {
            if ($technician['ID'] === $identifier) {
                return new InMemoryUser($technician);
            }
        }
        return null;
        // throw new \Exception("This User ID is not registered", 401);

    }

    public function retrieveByToken($identifier, $token)
    {
        return null;
    }

    public function updateRememberToken(Authenticatable $user, $token)
    {
        // Not required for in-memory users.
    }

    public function retrieveByCredentials(array $credentials)
    {
        $technicianList = $this->businessCentral->technicianList();
        // Log::info("In memory auth provider", [$technicianList]);
        foreach ($technicianList as $technician) {
            Log::info("In memory auth provider", [$technician]);

            if ($technician['ID'] === $credentials['username']) {
                return new InMemoryUser($technician);
            }
        }

        // return null;
        return null;
        // throw new \Exception("This User ID is not registered", 401);

    }

    public function validateCredentials(Authenticatable $user, array $credentials)
    {
        // Log::info('user password: ', $user);
        Log::info('login password: ', $credentials);

        return $user->getAuthPassword() === $credentials['password'];
    }

    public function rehashPasswordIfRequired(Authenticatable $user, array $credentials, bool $force = false): bool
    {
        return false;
    }
}








// <?php

// namespace App\Auth;

// use Illuminate\Contracts\Auth\UserProvider;
// use Illuminate\Contracts\Auth\Authenticatable;
// use App\Services\BusinessCentral;


// class InMemoryUserProvider implements UserProvider
// {
//     protected $users;

//     public function __construct(BusinessCentral $businessCentral)
//     {
//         $this->users = $businessCentral->technicianList();
//     }

//     public function retrieveById($identifier)
//     {
//         return $this->retrieveByCredentials(['id' => $identifier]);
//     }

//     public function retrieveByToken($identifier, $token)
//     {
//         return null;
//     }

//     public function updateRememberToken(Authenticatable $user, $token)
//     {
//         // Not required for in-memory users.
//     }

//     public function retrieveByCredentials(array $credentials)
//     {
//         foreach ($this->users as $user) {
//             if ($user['email'] === $credentials['email']) {
//                 return new InMemoryUser($user);
//             }
//         }

//         return null;
//     }

//     public function validateCredentials(Authenticatable $user, array $credentials)
//     {
//         return $user->getAuthPassword() === $credentials['password'];
//     }

//     public function rehashPasswordIfRequired(Authenticatable $user, array $credentials, bool $force = false): bool
//     {
//         return true;
//     }
// }
