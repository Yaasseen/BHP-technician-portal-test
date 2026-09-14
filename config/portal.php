<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Portal Service Order Statuses
    |--------------------------------------------------------------------------
    |
    | The canonical set of portal `status` values (distinct from BC's own
    | `repair_status_code`). Referenced from multiple controllers so the
    | set can't drift out of sync between them.
    |
    */

    'statuses' => [
        'PENDING' => 'Pending',
        'TECH-ASSN' => 'Technician Assigned',
        'RESCH-UNAVAI' => 'Rescheduled - Unavailable',
        'RESCH-COMP' => 'Rescheduled - Complete',
        'INPROGRESS' => 'In Progress',
        'COMPLETED' => 'Completed',
    ],

    /*
    |--------------------------------------------------------------------------
    | Technician-selectable statuses
    |--------------------------------------------------------------------------
    |
    | Subset of the statuses above that a technician may manually pick when
    | saving a service order activity. PENDING and TECH-ASSN are deliberately
    | excluded here - those are set automatically by the system (initial
    | state / technician assignment), not something a technician chooses.
    |
    */

    'technician_selectable_statuses' => [
        'RESCH-UNAVAI' => 'Reschedule due to client unavailability',
        'RESCH-COMP' => 'Reschedule due to client complaint',
        'INPROGRESS' => 'Task is currently in Progress',
        'COMPLETED' => 'Task Completed',
    ],

];
