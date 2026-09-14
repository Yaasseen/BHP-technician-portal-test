<?php

use App\Http\Controllers\RepairStatusController;
use App\Http\Controllers\TaskStatisticsController;
use App\Http\Controllers\TechnicianController;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Auth\LoginController;
use Illuminate\Support\Facades\Auth;
use App\Http\Controllers\HomeController;
use App\Http\Controllers\ServiceOrderController;
use App\Http\Controllers\AssignServiceOrder;
use App\Http\Controllers\NotificationController;
use App\Http\Controllers\ServiceOrderActivityController;
use App\Http\Controllers\SparePartActivityController;
use App\Http\Controllers\TeamRegionActivityController;
use App\Http\Controllers\TeamScheduleController;
use App\Http\Controllers\ServiceOrderFilterController;
use App\Http\Controllers\GigoLocationController;
use App\Http\Controllers\GigoMovementController;
use App\Http\Controllers\AgeingController;
use Inertia\Inertia;

Route::middleware('web')->group(function () {
    Route::get('/login', [LoginController::class, 'showLoginForm'])->name('login');
    Route::get('/', [HomeController::class, 'index'])->name('app');
    Route::post('/login', [LoginController::class, 'login']);
    
});


Route::middleware(['web', 'auth'])->group(function () {
    Route::get('/user', [HomeController::class, 'logged_in_user']);
    Route::post('/logout',[LoginController::class, 'logout'])->name('logout');
   
    // Route::get('/service-orders', [ServiceOrderController::class, 'getServiceOrdersByDateRange']);
    // Service Order
    Route::post('/service-orders', [ServiceOrderController::class, 'getServiceOrders']);
    Route::get('/service-orders/{document_no}', [ServiceOrderController::class, 'getServiceOrder']);
    Route::put('/service-orders/{document_no}', [ServiceOrderController::class, 'updateServiceOrder']);
    Route::delete('/service-orders/{document_no}', [ServiceOrderController::class, 'destroyServiceOrder']);
    
    // Outdoor Service Order
    Route::post('/outdoor-service-orders', [ServiceOrderController::class, 'getOutdoorServiceOrders']);
    Route::get('/outdoor-service-orders/count-scheduled', [ServiceOrderController::class, 'countScheduledServiceOrders']);

    Route::post('/service-orders/assign-outdoor-department-region', [AssignServiceOrder::class, 'assignOutdoorServiceDepartmentRegion']);

    Route::put('/service-orders/schedule/{document_no}', [AssignServiceOrder::class, 'scheduleServiceOrder']);
    Route::put('/service-orders/department-region/{document_no}', [AssignServiceOrder::class, 'assignDepartmentRegion']);
    Route::put('/service-orders/assign-technician/{document_no}', [AssignServiceOrder::class, 'assignTechnician']);
    Route::put('/assign-technician-bulk', [AssignServiceOrder::class, 'assignTechnicianBulk']);

    // GIGO location tracking
    Route::get('/gigo-locations', [GigoLocationController::class, 'index']);
    Route::post('/gigo-locations', [GigoLocationController::class, 'store']);
    Route::put('/gigo-locations/{id}', [GigoLocationController::class, 'update']);
    Route::delete('/gigo-locations/{id}', [GigoLocationController::class, 'destroy']);
    Route::get('/gigo-locations/{id}/contents', [GigoMovementController::class, 'locationContents']);
    Route::post('/gigo-movements/scan', [GigoMovementController::class, 'scanSingle']);
    Route::post('/gigo-movements/scan-bulk', [GigoMovementController::class, 'scanBulk']);
    Route::get('/gigo-movements/history/{document_no}', [GigoMovementController::class, 'history']);

    Route::get('/technician-list', [TechnicianController::class, 'getTechnicianList']);
    Route::get('/technician/{id}', [TechnicianController::class, 'getTechnician']);
    Route::get('/region-list', [TechnicianController::class, 'getRegionList']);
    Route::get('/team-list', [TechnicianController::class, 'getTeamList']);
    Route::get('/spare-part-list', [TechnicianController::class, 'getsparePartList']);
    Route::get('/location-list', [TechnicianController::class, 'getLocationList']);
    Route::get('/statuses', [TechnicianController::class, 'getStatuses']);
    Route::get('/repair-status-list', [RepairStatusController::class, 'getRepairStatusList'])->name('repair-status-list');


    // Service ORder Activities
    Route::post('/service-order-activities', [ServiceOrderActivityController::class, 'store']);
    Route::get('/service-order-activities', [ServiceOrderActivityController::class, 'index']);
    
    Route::get('/service-order-activities/{id}/image', [ServiceOrderActivityController::class, 'getImage'])->name('service-order-activities.image');
    Route::get('/service-order-activities/{id}/signature', [ServiceOrderActivityController::class, 'getSignature'])->name('service-order-activities.signature');
    
    // Spare Part Activity
    Route::get('/spare-part-activity', [SparePartActivityController::class, 'index']);
    Route::post('/spare-part-request',[SparePartActivityController::class, 'storeSparePart']);
    Route::get('/service-spare-parts',[SparePartActivityController::class, 'getServiceSpareParts']);

    // Team Region Activity
    Route::get('/team-region-activity', [TeamRegionActivityController::class, 'getTeamRegionActivity']);
    Route::get('/team-region-activity/single', [TeamRegionActivityController::class, 'getSingleTeamRegionActivity']);
    // Route::get('/team-region-activity/{document_no}', [TeamRegionActivityController::class, 'getSingleTeamRegionActivity']);

    // Notifications
    Route::get('/notifications', [NotificationController::class, 'index']);
    Route::put('/notifications/{id}/mark-read', [NotificationController::class, 'markAsRead']);
    Route::put('/notifications/mark-all-read', [NotificationController::class, 'markAllAsRead']);
    Route::delete('/notifications/{id}', [NotificationController::class, 'delete']);

    Route::get('/task-statastics', [TaskStatisticsController::class, 'getServiceOrderCounts']);
    Route::get('/ageing-summary', [AgeingController::class, 'getSummary']);
    Route::get('/weekly-schedule-overview', [TaskStatisticsController::class, 'getWeeklyScheduleOverview']);

    // Team Schedule
    Route::get('/team-schedules-configuration', [TeamScheduleController::class, 'getTeamRegionConfiguration']);
    Route::get('/team-schedules', [TeamScheduleController::class, 'index']);
    // Route::get('/team-schedules', [TeamScheduleController::class, 'storeTeamRegionConfiguration']);
    Route::post('/team-schedules', [TeamScheduleController::class, 'store']);


    // Filter
    Route::get('/repair-status-code', [ServiceOrderFilterController::class, 'getServiceRepairStatusCode']);
    Route::get('/brand-code', [ServiceOrderFilterController::class, 'getBrandCode']);
    Route::get('/allocated-teams', [ServiceOrderFilterController::class, 'fetchTeams']);
    Route::get('/service-order-portal-status', [ServiceOrderFilterController::class, 'getStatuses']);

});



