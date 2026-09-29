<?php

use App\Controllers\Api\HealthController;
use App\Controllers\Api\DocumentationController;
use App\Controllers\Api\v1\AuthController;
use App\Controllers\Api\v1\GraphQLController;
use App\Controllers\Api\v1\AuditController;
use App\Controllers\Api\v1\DesaController;
use App\Controllers\Api\v1\DesaAdminController;
use App\Controllers\Api\v1\CsrfController;
use App\Controllers\Api\v1\UploadController;
use App\Repositories\DesaRepository;
use App\Core\Response as CoreResponse;

use App\Middleware\CompressionMiddleware;
use App\Middleware\RequestTrackingMiddleware;
use App\Middleware\ApiVersionMiddleware;
use App\Middleware\CsrfMiddleware;
use App\Middleware\WAFMiddleware;
use App\Middleware\RateLimiter;
use App\Middleware\CorsMiddleware;
use App\Middleware\FeatureGateMiddleware;
use App\Middleware\SecurityHeaders;
use App\Middleware\ContentTypeEnforcer;
use App\Middleware\JsonBodyParser;
use App\Middleware\AuditMiddleware;
use App\Middleware\APIKeyMiddleware;
use App\Middleware\AuthMiddleware;
use App\Middleware\BruteForceLockoutMiddleware;
use App\Middleware\CorrelationIdMiddleware;
use App\Middleware\RateLimitHeadersMiddleware;
use App\Middleware\IdempotencyMiddleware;
use App\Middleware\ResponseCacheMiddleware;



// Global API middleware (order matters)
$router->middleware([
    CompressionMiddleware::class,
    RequestTrackingMiddleware::class,
    ApiVersionMiddleware::class,
    CsrfMiddleware::class,
    WAFMiddleware::class,
    RateLimiter::class,
    CorsMiddleware::class,
    FeatureGateMiddleware::class,
    SecurityHeaders::class,
    ContentTypeEnforcer::class,
    JsonBodyParser::class,
    AuditMiddleware::class,
    CorrelationIdMiddleware::class,       // injects X-Correlation-ID on every response
    RateLimitHeadersMiddleware::class,    // X-RateLimit-* headers on every response
    IdempotencyMiddleware::class,         // deduplicates mutating requests by Idempotency-Key header
    ResponseCacheMiddleware::class,       // caches GET responses for anonymous users (TTL configurable)
]);

// Health check endpoints (no authentication required)
$router->getApi('v1', '/health', [HealthController::class, 'check'], []);
$router->getApi('v1', '/ping', [HealthController::class, 'ping'], []);

// Config — API key required, no user auth
$router->getApi('v1', '/config', [ConfigController::class, 'index'], [APIKeyMiddleware::class]);

// v1 Auth
$router->getApi('v1', '/mdware/auth/csrf', [CsrfController::class, 'token'], [RateLimiter::class]);
$router->postApi('v1', '/register', [AuthController::class, 'register'], [RateLimiter::class, BruteForceLockoutMiddleware::class]);
$router->postApi('v1', '/auth/login',  [AuthController::class, 'login'],   [RateLimiter::class, BruteForceLockoutMiddleware::class]);
$router->postApi('v1', '/refresh', [AuthController::class, 'refresh'], [RateLimiter::class]);
$router->postApi('v1', '/logout',  [AuthController::class, 'logout'],  [AuthMiddleware::class]);
$router->postApi('v1', '/logout-all', [AuthController::class, 'logoutAll'], [AuthMiddleware::class]);
$router->getApi('v1', '/me',       [AuthController::class, 'me'],      [AuthMiddleware::class]);


$router->postApi('v1', '/test/mail', [TestController::class, 'mail'], []);


// Swagger/OpenAPI documentation routes
$router->getApi('v1', '/swagger', [DocumentationController::class, 'index']);
$router->getApi('v1', '/docs', [DocumentationController::class, 'docs']);

// GraphQL endpoint
$router->postApi('v1', '/graphql', [GraphQLController::class, 'execute'], [JsonBodyParser::class]);

// Audit logs
$router->getApi('v1', '/audit/logs', [AuditController::class, 'index'], [AuthMiddleware::class]);
$router->getApi('v1', '/audit/logs/export', [AuditController::class, 'export'], [AuthMiddleware::class]);
$router->getApi('v1', '/audit/logs/{id}', [AuditController::class, 'show'], [AuthMiddleware::class]);

// ── File Upload (public — no auth required; tracking uploaded_by from session) ─
$router->postApi('v1', '/upload',          [UploadController::class, 'upload'],      []);
$router->getApi('v1',  '/media',          [UploadController::class, 'listFiles'],    []);
$router->getApi('v1',  '/media/{id}',     [UploadController::class, 'getFile'],      []);
$router->deleteApi('v1', '/media/{id}',   [UploadController::class, 'deleteFile'],   []);
$router->getApi('v1',  '/buckets',        [UploadController::class, 'getBuckets'],   []);
// Public file serving (bypasses auth for embedded images/docs)
// Uses a catch-all route registered via addCatchAllRoute to support nested paths
$router->addCatchAllRoute('GET', '/api/v1/storage/(?P<path>.*)', function ($request, $response, $params) {
    $path = urldecode($params['path'] ?? '');
    if (empty($path) || str_contains($path, '..')) {
        return (new \App\Core\Response())->jsonResponse(['success' => false, 'error' => 'INVALID_PATH', 'message' => 'Invalid file path.'], 400);
    }
    $contents = \App\Core\Storage::get($path);
    if ($contents === false) {
        return (new \App\Core\Response())->jsonResponse(['success' => false, 'error' => 'NOT_FOUND', 'message' => 'File not found.'], 404);
    }
    $ext         = strtolower(pathinfo($path, PATHINFO_EXTENSION));
    $mimeMap     = require __DIR__ . '/../config/storage_mimes.php';
    $contentType = $mimeMap[$ext] ?? 'application/octet-stream';
    $response->setHeader('Content-Type', $contentType);
    $response->setHeader('Cache-Control', 'public, max-age=86400');
    $response->setContent($contents);
    return $response;
}, []);



// Regions
$router->getApi('v1', '/desa/regions', [DesaController::class, 'regions'], []);
$router->getApi('v1', '/desa/regions/{slug}', [DesaController::class, 'region'], []);

// Study Centers
$router->getApi('v1', '/desa/study-centers', [DesaController::class, 'studyCenters'], []);
$router->getApi('v1', '/desa/study-centers/{slug}', [DesaController::class, 'studyCenter'], []);
// Center amenities (public)
$router->getApi('v1', '/desa/centers/{id}/coordinators', [DesaController::class, 'getCenterCoordinators'], []);
$router->getApi('v1', '/desa/centers/{id}/hotels',       [DesaController::class, 'getCenterHotels'], []);
$router->getApi('v1', '/desa/centers/{id}/health',       [DesaController::class, 'getCenterHealth'], []);
$router->getApi('v1', '/desa/centers/{id}/restaurants',  [DesaController::class, 'getCenterRestaurants'], []);

// Programs
$router->getApi('v1', '/desa/programs', [DesaController::class, 'programs'], []);

// Announcements & Events
$router->getApi('v1', '/desa/announcements', [DesaController::class, 'announcements'], []);
$router->getApi('v1', '/desa/events', [DesaController::class, 'events'], []);

// Academics & Opportunities
$router->getApi('v1', '/desa/academics', [DesaController::class, 'academics'], []);
$router->getApi('v1', '/desa/opportunities', [DesaController::class, 'opportunities'], []);

// Unified Search
$router->getApi('v1', '/desa/search', [DesaController::class, 'search'], []);

// DESA Hub
$router->getApi('v1', '/desa/hub/about',      [DesaController::class, 'hubAbout'], []);
$router->getApi('v1', '/desa/hub/leadership', [DesaController::class, 'hubLeadership'], []);
$router->getApi('v1', '/desa/hub/constitution',[DesaController::class, 'hubConstitution'], []);
$router->getApi('v1', '/desa/hub/archives',   [DesaController::class, 'hubArchives'], []);
$router->getApi('v1', '/desa/hub/assets',     [DesaController::class, 'hubAssets'], []);
$router->getApi('v1', '/desa/hub/committees', [DesaController::class, 'hubCommittees'], []);
$router->getApi('v1', '/desa/hub/gallery',    [DesaController::class, 'hubGallery'], []);

// ── DESA Admin API Endpoints (auth required) ────────────────────────────

// Dashboard stats
$router->getApi('v1', '/admin/desa/stats', [DesaAdminController::class, 'stats'], [AuthMiddleware::class]);

// Regions CRUD
$router->getApi('v1', '/admin/desa/regions',        [DesaAdminController::class, 'listRegions'], [AuthMiddleware::class]);
$router->postApi('v1', '/admin/desa/regions',       [DesaAdminController::class, 'createRegion'], [AuthMiddleware::class]);
$router->putApi('v1', '/admin/desa/regions/{id}',   [DesaAdminController::class, 'updateRegion'], [AuthMiddleware::class]);
$router->deleteApi('v1', '/admin/desa/regions/{id}', [DesaAdminController::class, 'deleteRegion'], [AuthMiddleware::class]);

// Study Centers CRUD
$router->getApi('v1', '/admin/desa/centers',        [DesaAdminController::class, 'listCenters'], [AuthMiddleware::class]);
$router->postApi('v1', '/admin/desa/centers',       [DesaAdminController::class, 'createCenter'], [AuthMiddleware::class]);
$router->putApi('v1', '/admin/desa/centers/{id}',   [DesaAdminController::class, 'updateCenter'], [AuthMiddleware::class]);
$router->deleteApi('v1', '/admin/desa/centers/{id}', [DesaAdminController::class, 'deleteCenter'], [AuthMiddleware::class]);
$router->postApi('v1', '/admin/desa/centers/{id}/link-coordinator', [DesaAdminController::class, 'linkCoordinatorToCenter'], [AuthMiddleware::class]);

// Programs CRUD
$router->getApi('v1', '/admin/desa/programs',       [DesaAdminController::class, 'listPrograms'], [AuthMiddleware::class]);
$router->postApi('v1', '/admin/desa/programs',      [DesaAdminController::class, 'createProgram'], [AuthMiddleware::class]);
$router->putApi('v1', '/admin/desa/programs/{id}',  [DesaAdminController::class, 'updateProgram'], [AuthMiddleware::class]);
$router->deleteApi('v1', '/admin/desa/programs/{id}', [DesaAdminController::class, 'deleteProgram'], [AuthMiddleware::class]);

// Coordinators CRUD
$router->getApi('v1', '/admin/desa/coordinators',   [DesaAdminController::class, 'listCoordinators'], [AuthMiddleware::class]);
$router->postApi('v1', '/admin/desa/coordinators',  [DesaAdminController::class, 'createCoordinator'], [AuthMiddleware::class]);
$router->putApi('v1', '/admin/desa/coordinators/{id}', [DesaAdminController::class, 'updateCoordinator'], [AuthMiddleware::class]);
$router->deleteApi('v1', '/admin/desa/coordinators/{id}', [DesaAdminController::class, 'deleteCoordinator'], [AuthMiddleware::class]);

// Nearby Hotels CRUD
$router->getApi('v1', '/admin/desa/hotels',         [DesaAdminController::class, 'listHotels'], [AuthMiddleware::class]);
$router->postApi('v1', '/admin/desa/hotels',        [DesaAdminController::class, 'createHotel'], [AuthMiddleware::class]);
$router->putApi('v1', '/admin/desa/hotels/{id}',    [DesaAdminController::class, 'updateHotel'], [AuthMiddleware::class]);
$router->deleteApi('v1', '/admin/desa/hotels/{id}', [DesaAdminController::class, 'deleteHotel'], [AuthMiddleware::class]);
$router->postApi('v1', '/admin/desa/hotels/{id}/link-center', [DesaAdminController::class, 'linkHotelToCenter'], [AuthMiddleware::class]);
$router->deleteApi('v1', '/admin/desa/hotels/{id}/centers/{centerId}', [DesaAdminController::class, 'unlinkHotelFromCenter'], [AuthMiddleware::class]);
$router->getApi('v1', '/admin/desa/hotels/{id}/centers', [DesaAdminController::class, 'getHotelCenters'], [AuthMiddleware::class]);

// Nearby Health CRUD
$router->getApi('v1', '/admin/desa/health',         [DesaAdminController::class, 'listHealth'], [AuthMiddleware::class]);
$router->postApi('v1', '/admin/desa/health',        [DesaAdminController::class, 'createHealth'], [AuthMiddleware::class]);
$router->putApi('v1', '/admin/desa/health/{id}',    [DesaAdminController::class, 'updateHealth'], [AuthMiddleware::class]);
$router->deleteApi('v1', '/admin/desa/health/{id}', [DesaAdminController::class, 'deleteHealth'], [AuthMiddleware::class]);
$router->postApi('v1', '/admin/desa/health/{id}/link-center', [DesaAdminController::class, 'linkHealthToCenter'], [AuthMiddleware::class]);
$router->deleteApi('v1', '/admin/desa/health/{id}/centers/{centerId}', [DesaAdminController::class, 'unlinkHealthFromCenter'], [AuthMiddleware::class]);
$router->getApi('v1', '/admin/desa/health/{id}/centers', [DesaAdminController::class, 'getHealthCenters'], [AuthMiddleware::class]);

// Nearby Restaurants CRUD
$router->getApi('v1', '/admin/desa/restaurants',    [DesaAdminController::class, 'listRestaurants'], [AuthMiddleware::class]);
$router->postApi('v1', '/admin/desa/restaurants',   [DesaAdminController::class, 'createRestaurant'], [AuthMiddleware::class]);
$router->putApi('v1', '/admin/desa/restaurants/{id}', [DesaAdminController::class, 'updateRestaurant'], [AuthMiddleware::class]);
$router->deleteApi('v1', '/admin/desa/restaurants/{id}', [DesaAdminController::class, 'deleteRestaurant'], [AuthMiddleware::class]);
$router->postApi('v1', '/admin/desa/restaurants/{id}/link-center', [DesaAdminController::class, 'linkRestaurantToCenter'], [AuthMiddleware::class]);
$router->deleteApi('v1', '/admin/desa/restaurants/{id}/centers/{centerId}', [DesaAdminController::class, 'unlinkRestaurantFromCenter'], [AuthMiddleware::class]);
$router->getApi('v1', '/admin/desa/restaurants/{id}/centers', [DesaAdminController::class, 'getRestaurantCenters'], [AuthMiddleware::class]);

// Announcements CRUD
$router->getApi('v1', '/admin/desa/announcements',  [DesaAdminController::class, 'listAnnouncements'], [AuthMiddleware::class]);
$router->postApi('v1', '/admin/desa/announcements', [DesaAdminController::class, 'createAnnouncement'], [AuthMiddleware::class]);
$router->putApi('v1', '/admin/desa/announcements/{id}', [DesaAdminController::class, 'updateAnnouncement'], [AuthMiddleware::class]);
$router->deleteApi('v1', '/admin/desa/announcements/{id}', [DesaAdminController::class, 'deleteAnnouncement'], [AuthMiddleware::class]);

// Events CRUD
$router->getApi('v1', '/admin/desa/events',         [DesaAdminController::class, 'listEvents'], [AuthMiddleware::class]);
$router->postApi('v1', '/admin/desa/events',        [DesaAdminController::class, 'createEvent'], [AuthMiddleware::class]);
$router->putApi('v1', '/admin/desa/events/{id}',    [DesaAdminController::class, 'updateEvent'], [AuthMiddleware::class]);
$router->deleteApi('v1', '/admin/desa/events/{id}', [DesaAdminController::class, 'deleteEvent'], [AuthMiddleware::class]);

// Hub About
$router->getApi('v1', '/admin/desa/hub/about',      [DesaAdminController::class, 'adminHubAbout'], [AuthMiddleware::class]);
$router->putApi('v1', '/admin/desa/hub/about',      [DesaAdminController::class, 'updateHubAbout'], [AuthMiddleware::class]);

// Hub Leadership
$router->getApi('v1', '/admin/desa/hub/leadership', [DesaAdminController::class, 'adminHubLeadership'], [AuthMiddleware::class]);
$router->postApi('v1', '/admin/desa/hub/leadership',[DesaAdminController::class, 'createLeadership'], [AuthMiddleware::class]);
$router->putApi('v1', '/admin/desa/hub/leadership/{id}', [DesaAdminController::class, 'updateLeadership'], [AuthMiddleware::class]);
$router->deleteApi('v1', '/admin/desa/hub/leadership/{id}', [DesaAdminController::class, 'deleteLeadership'], [AuthMiddleware::class]);

// Hub Constitution
$router->getApi('v1', '/admin/desa/hub/constitution',[DesaAdminController::class, 'adminHubConstitution'], [AuthMiddleware::class]);
$router->postApi('v1', '/admin/desa/hub/constitution',[DesaAdminController::class, 'createConstitution'], [AuthMiddleware::class]);

// Hub Archives
$router->getApi('v1', '/admin/desa/hub/archives',   [DesaAdminController::class, 'adminHubArchives'], [AuthMiddleware::class]);
$router->postApi('v1', '/admin/desa/hub/archives',  [DesaAdminController::class, 'createArchive'], [AuthMiddleware::class]);
$router->putApi('v1', '/admin/desa/hub/archives/{id}', [DesaAdminController::class, 'updateArchive'], [AuthMiddleware::class]);
$router->deleteApi('v1', '/admin/desa/hub/archives/{id}', [DesaAdminController::class, 'deleteArchive'], [AuthMiddleware::class]);

// Hub Assets
$router->getApi('v1', '/admin/desa/hub/assets',     [DesaAdminController::class, 'adminHubAssets'], [AuthMiddleware::class]);
$router->postApi('v1', '/admin/desa/hub/assets',    [DesaAdminController::class, 'createAsset'], [AuthMiddleware::class]);
$router->putApi('v1', '/admin/desa/hub/assets/{id}', [DesaAdminController::class, 'updateAsset'], [AuthMiddleware::class]);
$router->deleteApi('v1', '/admin/desa/hub/assets/{id}', [DesaAdminController::class, 'deleteAsset'], [AuthMiddleware::class]);

// Hub Committees
$router->getApi('v1', '/admin/desa/hub/committees', [DesaAdminController::class, 'adminHubCommittees'], [AuthMiddleware::class]);
$router->postApi('v1', '/admin/desa/hub/committees',[DesaAdminController::class, 'createCommittee'], [AuthMiddleware::class]);
$router->putApi('v1', '/admin/desa/hub/committees/{id}', [DesaAdminController::class, 'updateCommittee'], [AuthMiddleware::class]);
$router->deleteApi('v1', '/admin/desa/hub/committees/{id}', [DesaAdminController::class, 'deleteCommittee'], [AuthMiddleware::class]);

// Hub Gallery
$router->getApi('v1', '/admin/desa/hub/gallery',    [DesaAdminController::class, 'adminHubGallery'], [AuthMiddleware::class]);
$router->postApi('v1', '/admin/desa/hub/gallery',   [DesaAdminController::class, 'createGalleryImage'], [AuthMiddleware::class]);
$router->putApi('v1', '/admin/desa/hub/gallery/{id}', [DesaAdminController::class, 'updateGalleryImage'], [AuthMiddleware::class]);
$router->deleteApi('v1', '/admin/desa/hub/gallery/{id}', [DesaAdminController::class, 'deleteGalleryImage'], [AuthMiddleware::class]);

// Academics CRUD
$router->getApi('v1', '/admin/desa/academics',      [DesaAdminController::class, 'listAcademics'], [AuthMiddleware::class]);
$router->postApi('v1', '/admin/desa/academics',     [DesaAdminController::class, 'createAcademic'], [AuthMiddleware::class]);
$router->putApi('v1', '/admin/desa/academics/{id}', [DesaAdminController::class, 'updateAcademic'], [AuthMiddleware::class]);
$router->deleteApi('v1', '/admin/desa/academics/{id}', [DesaAdminController::class, 'deleteAcademic'], [AuthMiddleware::class]);

// Opportunities CRUD
$router->getApi('v1', '/admin/desa/opportunities',  [DesaAdminController::class, 'listOpportunities'], [AuthMiddleware::class]);
$router->postApi('v1', '/admin/desa/opportunities', [DesaAdminController::class, 'createOpportunity'], [AuthMiddleware::class]);
$router->putApi('v1', '/admin/desa/opportunities/{id}', [DesaAdminController::class, 'updateOpportunity'], [AuthMiddleware::class]);
$router->deleteApi('v1', '/admin/desa/opportunities/{id}', [DesaAdminController::class, 'deleteOpportunity'], [AuthMiddleware::class]);

// ── Legacy Data Compatibility Routes (backward compat for frontend) ────

/** GET /api/v1/data/centers — returns regions with embedded centers */
$router->getApi('v1', '/data/centers', function ($request, $response) {
    $db = \App\Core\Config::get('database');
    $logger = new \App\Core\Logger(dirname(__DIR__, 2) . '/storage/logs/db.log');
    $database = new \App\Core\Database($db, $logger);
    $repo = new DesaRepository($database);
    $regions = $repo->getAllRegions();
    $resp = new CoreResponse();
    $resp->setStatusCode(200);
    $resp->setHeader('Content-Type', 'application/json');
    $resp->setContent(json_encode(['success' => true, 'data' => $regions]));
    return $resp;
}, []);


/** GET /api/v1/data/announcements — returns {announcements, events} */
$router->getApi('v1', '/data/announcements', function ($request, $response) {
    $db = \App\Core\Config::get('database');
    $logger = new \App\Core\Logger(dirname(__DIR__, 2) . '/storage/logs/db.log');
    $database = new \App\Core\Database($db, $logger);
    $repo = new DesaRepository($database);
    $anns = $repo->getAllAnnouncements(['limit' => 100]);
    $evts = $repo->getAllEvents(['limit' => 100]);
    $resp = new CoreResponse();
    $resp->setStatusCode(200);
    $resp->setHeader('Content-Type', 'application/json');
    $resp->setContent(json_encode(['success' => true, 'data' => [
        'announcements' => $anns,
        'events'        => $evts,
    ]]));
    return $resp;
}, []);

/** GET /api/v1/data/mockData — returns academics + opportunities merged as legacy items */
$router->getApi('v1', '/data/mockData', function ($request, $response) {
    $db = \App\Core\Config::get('database');
    $logger = new \App\Core\Logger(dirname(__DIR__, 2) . '/storage/logs/db.log');
    $database = new \App\Core\Database($db, $logger);
    $repo = new DesaRepository($database);
    $academics = $repo->getAllAcademics(['limit' => 200]);
    $opportunities = $repo->getAllOpportunities(['limit' => 200]);

    $items = [];
    foreach ($academics as $a) {
        $catMap = [
            'peer_ppt' => 'Academic Peer PPT',
            'academic_vault' => '24/7 Academic Vault',
            'study_material' => '24/7 Academic Vault',
            'past_questions' => '24/7 Academic Vault',
            'lecture_notes' => 'Academic Peer PPT',
            'syllabus' => 'Academic Peer PPT',
            'reading_list' => '24/7 Academic Vault',
        ];
        $items[] = [
            'id'          => 'acad-' . $a['id'],
            'title'       => $a['title'],
            'category'    => $catMap[$a['category'] ?? ''] ?? 'DESA Hub',
            'program'     => $a['course_title'] ?? '',
            'level'       => $a['level'] ? 'Level ' . $a['level'] : '',
            'description' => $a['description'] ?? '',
            'date'        => $a['academic_year'] ?? '2025/2026',
            'fileSize'    => $a['file_size'] ?? 'PDF Document',
            'fileType'    => $a['file_type'] ?? 'PDF Document',
            'downloadUrl' => $a['file_url'] ?? '#',
            'tags'        => $a['tags'] ?? [],
        ];
    }
    foreach ($opportunities as $o) {
        $catMap = [
            'opportunity_radar' => 'DESA Opportunity Radar',
            'internship' => 'Internship Opportunity Network',
            'digital_board' => 'Digital Student Opportunity Board',
            'supervisor_connection' => 'Supervisor Connection Initiative',
            'welfare' => 'Welfare',
            'alumni' => 'Alumni',
        ];
        $items[] = [
            'id'          => 'opp-' . $o['id'],
            'title'       => $o['title'],
            'category'    => $catMap[$o['category'] ?? ''] ?? 'DESA Hub',
            'program'     => $o['organization'] ?? '',
            'level'       => $o['location'] ?? '',
            'description' => $o['description'] ?? '',
            'date'        => $o['deadline'] ?? '',
            'fileSize'    => '',
            'fileType'    => 'Opportunity',
            'downloadUrl' => $o['application_link'] ?? '#',
            'tags'        => ['opportunity', strtolower($o['category'] ?? '')],
        ];
    }
    $resp = new CoreResponse();
    $resp->setStatusCode(200);
    $resp->setHeader('Content-Type', 'application/json');
    $resp->setContent(json_encode(['success' => true, 'data' => $items]));
    return $resp;
}, []);

/** GET /api/v1/data/hubData — returns all hub data merged */
$router->getApi('v1', '/data/hubData', function ($request, $response) {
    $db = \App\Core\Config::get('database');
    $logger = new \App\Core\Logger(dirname(__DIR__, 2) . '/storage/logs/db.log');
    $database = new \App\Core\Database($db, $logger);
    $repo = new DesaRepository($database);
    $about      = $repo->getHubAbout();
    $leaders    = $repo->getAllLeaderships();
    $constitution = $repo->getConstitution();
    $archives   = $repo->getAllArchives();
    $assets     = $repo->getAllAssets();
    $committees = $repo->getAllCommittees();
    $gallery    = $repo->getGalleryImages();

    $articles = [];
    foreach (($constitution['articles'] ?? []) as $a) {
        $articles[] = ['number' => $a['article_number'], 'title' => $a['title'], 'content' => $a['content']];
    }

    $resp = new CoreResponse();
    $resp->setStatusCode(200);
    $resp->setHeader('Content-Type', 'application/json');
    $resp->setContent(json_encode([
        'success' => true,
        'data'    => [
            'about'        => $about ?? [],
            'leadership'   => $leaders,
            'constitution' => [
                'title'    => $constitution['title'] ?? 'DESA Constitution',
                'preamble' => $constitution['preamble'] ?? '',
                'articles' => $articles,
            ],
            'archives'   => $archives,
            'assets'     => $assets,
            'activities' => [],
            'committees' => $committees,
            'gallery'    => $gallery,
        ],
    ]));
    return $resp;
}, []);

/** POST /api/v1/data/hubData — upserts all hub tables from one payload */
$router->postApi('v1', '/data/hubData', function ($request, $response) {
    $db = \App\Core\Config::get('database');
    $logger = new \App\Core\Logger(dirname(__DIR__, 2) . '/storage/logs/db.log');
    $database = new \App\Core\Database($db, $logger);
    $body = $request->getBodyParams();
    $now  = date('Y-m-d H:i:s');

    if (!empty($body['about'])) {
        $existing = $database->fetchSingle("SELECT id FROM hub_about LIMIT 1");
        if ($existing) {
            $database->update('hub_about', [...$body['about'], 'updated_at' => $now], 'id = ?', [$existing['id']]);
        } else {
            $database->insert('hub_about', [...$body['about'], 'id' => 1, 'created_at' => $now, 'updated_at' => $now]);
        }
    }

    if (!empty($body['leadership']) && is_array($body['leadership'])) {
        $database->query("DELETE FROM hub_leaderships");
        foreach ($body['leadership'] as $i => $l) {
            // Parse term_start/year from "2023–2025" style string
            preg_match('/(\d{4})[^\d]*?(\d{4})?/', $l['term'] ?? '', $tm);
            $yearStart = !empty($tm[1]) ? (int)$tm[1] : (int)date('Y');
            $yearEnd   = !empty($tm[2]) ? (int)$tm[2] : null;
            $database->insert('hub_leaderships', [
                'role'       => $l['role'] ?? '',
                'name'       => $l['name'] ?? '',
                'term_start' => $yearStart,
                'term_end'   => $yearEnd,
                'is_current' => $l['is_current'] ?? ($i === 0 ? 1 : 0),
                'sort_order' => $i,
                'is_active'  => 1,
                'created_at' => $now,
                'updated_at' => $now,
            ]);
        }
    }

    if (!empty($body['constitution'])) {
        $c = $body['constitution'];
        $articles = $c['articles'] ?? [];
        unset($c['articles']);
        $existing = $database->fetchSingle("SELECT id FROM hub_constitution LIMIT 1");
        if ($existing) {
            $database->update('hub_constitution', [...$c, 'updated_at' => $now], 'id = ?', [$existing['id']]);
            $database->query("DELETE FROM hub_constitution_articles WHERE constitution_id = ?", [$existing['id']]);
            if (!empty($articles)) {
                foreach ($articles as $i => $a) {
                    $database->insert('hub_constitution_articles', [
                        'constitution_id' => $existing['id'],
                        'article_number'  => $a['number'] ?? $a['article_number'] ?? '',
                        'title'           => $a['title'] ?? '',
                        'content'         => $a['content'] ?? '',
                        'sort_order'      => $i,
                        'is_active'       => 1,
                        'created_at'      => $now,
                        'updated_at'      => $now,
                    ]);
                }
            }
        } else {
            $cid = $database->insert('hub_constitution', [...$c, 'id' => 1, 'is_active' => 1, 'created_at' => $now, 'updated_at' => $now]);
            if (!empty($articles)) {
                foreach ($articles as $i => $a) {
                    $database->insert('hub_constitution_articles', [
                        'constitution_id' => $cid,
                        'article_number'  => $a['number'] ?? $a['article_number'] ?? '',
                        'title'           => $a['title'] ?? '',
                        'content'         => $a['content'] ?? '',
                        'sort_order'      => $i,
                        'is_active'       => 1,
                        'created_at'      => $now,
                        'updated_at'      => $now,
                    ]);
                }
            }
        }
    }

    if (!empty($body['archives']) && is_array($body['archives'])) {
        $database->query("DELETE FROM hub_archives");
        foreach ($body['archives'] as $i => $a) {
            $database->insert('hub_archives', ['year' => $a['year'] ?? '', 'title' => $a['title'] ?? '', 'doc_type' => $a['type'] ?? 'PDF', 'file_url' => $a['file_url'] ?? '#', 'is_active' => 1, 'created_at' => $now, 'updated_at' => $now]);
        }
    }

    if (!empty($body['assets']) && is_array($body['assets'])) {
        $database->query("DELETE FROM hub_assets");
        foreach ($body['assets'] as $i => $a) {
            $dateAcquired = $a['dateAcquired'] ?? null;
            if (preg_match('/^\d{4}$/', $dateAcquired)) { $dateAcquired .= '-01-01'; }
            $database->insert('hub_assets', ['item_name' => $a['item'] ?? $a['sn'] ?? '', 'description' => $a['description'] ?? '', 'quantity' => 1, 'unit' => 'unit', 'date_acquired' => $dateAcquired, 'condition' => $a['status'] ?? 'good', 'is_active' => 1, 'created_at' => $now, 'updated_at' => $now]);
        }
    }

    if (!empty($body['committees']) && is_array($body['committees'])) {
        $database->query("DELETE FROM hub_committees");
        foreach ($body['committees'] as $i => $c) {
             $nameSlug = strtolower($c['name'] ?? '');
             $nameSlug = preg_replace('/[^a-zA-Z0-9\s]/', '', $nameSlug);
             $nameSlug = preg_replace('/\s+/', ' ', trim($nameSlug));
             $nameSlug = str_replace(' ', '-', $nameSlug);
             $database->insert('hub_committees', ['name' => $c['name'] ?? '', 'slug' => $nameSlug, 'description' => $c['description'] ?? '', 'member_count' => $c['members'] ?? 0, 'sort_order' => $i, 'is_active' => 1, 'created_at' => $now, 'updated_at' => $now]);
        }
    }

    if (!empty($body['gallery']) && is_array($body['gallery'])) {
        $database->query("DELETE FROM hub_gallery_images");
        foreach ($body['gallery'] as $i => $g) {
            $database->insert('hub_gallery_images', ['title' => $g['title'] ?? '', 'url' => $g['url'] ?? $g['src'] ?? '#', 'sort_order' => $i, 'is_featured' => $g['is_featured'] ?? 0, 'is_active' => 1, 'created_at' => $now, 'updated_at' => $now]);
        }
    }

    // Invalidate response cache for corresponding GET endpoints
    $cacheKey = 'resp_cache:' . md5("GET|/api/v1/data/hubData|");
    (new \App\Core\Cache())->forget($cacheKey);

    $resp = new CoreResponse();
    $resp->setStatusCode(200);
    $resp->setHeader('Content-Type', 'application/json');
    $resp->setContent(json_encode(['success' => true, 'message' => 'Hub data saved']));
    return $resp;
}, []);

/** POST /api/v1/data/centers — upserts regions & study centers */
$router->postApi('v1', '/data/centers', function ($request, $response) {
    $db = \App\Core\Config::get('database');
    $logger = new \App\Core\Logger(dirname(__DIR__, 2) . '/storage/logs/db.log');
    $database = new \App\Core\Database($db, $logger);
    $body = $request->getBodyParams();
    $now  = date('Y-m-d H:i:s');

    if (is_array($body)) {
        $database->query("DELETE FROM restaurant_center");
        $database->query("DELETE FROM health_center");
        $database->query("DELETE FROM hotel_center");
        $database->query("DELETE FROM program_center");
        $database->query("DELETE FROM coordinator_center");
        $database->query("DELETE FROM coordinators");
        $database->query("DELETE FROM study_centers");
        $database->query("DELETE FROM regions");

        foreach ($body as $region) {
            $rid = $database->insert('regions', [
                'slug'        => $region['slug'] ?? '',
                'name'        => $region['name'] ?? '',
                'short_name'  => $region['shortName'] ?? $region['short_name'] ?? '',
                'code'        => $region['code'] ?? '',
                'capital'     => $region['capital'] ?? '',
                'description' => $region['description'] ?? '',
                'is_active'   => 1,
                'sort_order'  => 0,
                'created_at'  => $now,
                'updated_at'  => $now,
            ]);
            if (!empty($region['centers'])) {
                foreach ($region['centers'] as $center) {
                    $cid = $database->insert('study_centers', [
                        'region_id' => $rid,
                        'slug'      => $center['slug'] ?? $center['id'] ?? '',
                        'name'      => $center['name'] ?? '',
                        'premises'  => $center['premises'] ?? '',
                        'city'      => $center['city'] ?? '',
                        'landmark'  => $center['landmark'] ?? '',
                        'schedule'  => $center['schedule'] ?? '',
                        'is_active' => 1,
                        'public'    => 1,
                        'created_at'=> $now,
                        'updated_at'=> $now,
                    ]);

                    // Save coordinator if present
                    $coord = $center['coordinator'] ?? $center['coordinators'] ?? null;
                    if (is_array($coord) && !empty($coord['email'])) {
                        $coordinatorData = [
                            'first_name'   => $coord['first_name'] ?? '',
                            'last_name'    => $coord['last_name'] ?? '',
                            'full_name'    => $coord['full_name'] ?? $coord['name'] ?? '',
                            'title'        => $coord['title'] ?? 'Study Center Coordinator',
                            'phone'        => $coord['phone'] ?? '',
                            'email'        => $coord['email'] ?? '',
                            'office'       => $coord['office'] ?? '',
                            'office_hours' => $coord['hours'] ?? $coord['office_hours'] ?? '',
                            'is_active'    => 1,
                            'created_at'   => $now,
                            'updated_at'   => $now,
                        ];
                        // Check if coordinator with this email already exists
                        $existing = $database->fetchSingle(
                            "SELECT id FROM coordinators WHERE email = :email LIMIT 1",
                            ['email' => $coordinatorData['email']]
                        );
                        if ($existing) {
                            $coordinatorId = (int) $existing['id'];
                        } else {
                            $coordinatorId = $database->insert('coordinators', $coordinatorData);
                        }
                        $database->insert('coordinator_center', [
                            'center_id'      => $cid,
                            'coordinator_id' => $coordinatorId,
                            'is_primary'     => 1,
                            'is_active'      => 1,
                            'created_at'     => $now,
                            'updated_at'     => $now,
                        ]);
                    }
                }
            }
        }
    }

    // Invalidate response cache for corresponding GET endpoints
    $cacheKey = 'resp_cache:' . md5("GET|/api/v1/data/centers|");
    (new \App\Core\Cache())->forget($cacheKey);

    $resp = new CoreResponse();
    $resp->setStatusCode(200);
    $resp->setHeader('Content-Type', 'application/json');
    $resp->setContent(json_encode(['success' => true, 'message' => 'Centers data saved']));
    return $resp;
}, []);

/** POST /api/v1/data/announcements — upserts announcements & events */
$router->postApi('v1', '/data/announcements', function ($request, $response) {
    $db = \App\Core\Config::get('database');
    $logger = new \App\Core\Logger(dirname(__DIR__, 2) . '/storage/logs/db.log');
    $database = new \App\Core\Database($db, $logger);
    $body = $request->getBodyParams();
    $now  = date('Y-m-d H:i:s');

    if (is_array($body)) {
        $database->query("DELETE FROM events");
        $database->query("DELETE FROM announcements");

        foreach (($body['announcements'] ?? []) as $a) {
            $database->insert('announcements', ['slug' => $a['slug'] ?? '', 'title' => $a['title'] ?? '', 'excerpt' => $a['excerpt'] ?? '', 'body' => $a['body'] ?? '', 'type' => $a['type'] ?? 'announcement', 'published_at' => $a['published_at'] ?? $a['date'] ?? null, 'thumbnail' => $a['thumbnail'] ?? null, 'is_active' => 1, 'public' => 1, 'created_at' => $now, 'updated_at' => $now]);
        }
        foreach (($body['events'] ?? []) as $e) {
            $database->insert('events', ['slug' => $e['slug'] ?? '', 'title' => $e['title'] ?? '', 'excerpt' => $e['excerpt'] ?? '', 'body' => $e['body'] ?? '', 'type' => $e['type'] ?? 'event', 'start_date' => $e['start_date'] ?? $e['date'] ?? null, 'venue' => $e['venue'] ?? $e['location'] ?? '', 'location' => $e['location'] ?? '', 'thumbnail' => $e['thumbnail'] ?? null, 'is_active' => 1, 'public' => 1, 'created_at' => $now, 'updated_at' => $now]);
        }
    }

    // Invalidate response cache for corresponding GET endpoints
    $cacheKey = 'resp_cache:' . md5("GET|/api/v1/data/announcements|");
    (new \App\Core\Cache())->forget($cacheKey);

    $resp = new CoreResponse();
    $resp->setStatusCode(200);
    $resp->setHeader('Content-Type', 'application/json');
    $resp->setContent(json_encode(['success' => true, 'message' => 'Announcements data saved']));
    return $resp;
}, []);

/** POST /api/v1/data/mockData — upserts academics & opportunities */
$router->postApi('v1', '/data/mockData', function ($request, $response) {
    $db = \App\Core\Config::get('database');
    $logger = new \App\Core\Logger(dirname(__DIR__, 2) . '/storage/logs/db.log');
    $database = new \App\Core\Database($db, $logger);
    $body = $request->getBodyParams();
    $now  = date('Y-m-d H:i:s');

    if (is_array($body)) {
        $database->query("DELETE FROM opportunities");
        $database->query("DELETE FROM academics");

        foreach ($body as $item) {
            $type = $item['category'] ?? $item['type'] ?? '';
            if (in_array($type, ['peer_ppt','academic_vault','study_material','past_questions','lecture_notes','syllabus','reading_list'])) {
                $database->insert('academics', ['slug' => $item['id'] ?? '', 'title' => $item['title'] ?? '', 'category' => $type, 'course_code' => $item['course_code'] ?? $item['code'] ?? '', 'course_title' => $item['program'] ?? '', 'level' => $item['level'] ?? null, 'description' => $item['description'] ?? '', 'file_type' => $item['fileType'] ?? 'PDF', 'file_size' => $item['fileSize'] ?? '', 'file_url' => $item['downloadUrl'] ?? '#', 'tags' => json_encode($item['tags'] ?? []), 'academic_year' => $item['date'] ?? '2025/2026', 'is_active' => 1, 'public' => 1, 'created_at' => $now, 'updated_at' => $now]);
            } elseif (in_array($type, ['opportunity_radar','internship','digital_board','supervisor_connection','welfare','alumni'])) {
                $database->insert('opportunities', ['slug' => $item['id'] ?? '', 'title' => $item['title'] ?? '', 'category' => $type, 'organization' => $item['program'] ?? '', 'location' => $item['level'] ?? '', 'description' => $item['description'] ?? '', 'deadline' => $item['date'] ?? null, 'application_link' => $item['downloadUrl'] ?? '#', 'is_active' => 1, 'public' => 1, 'created_at' => $now, 'updated_at' => $now]);
            }
        }
    }

    // Invalidate response cache for corresponding GET endpoints
    $cacheKey = 'resp_cache:' . md5("GET|/api/v1/data/mockData|");
    (new \App\Core\Cache())->forget($cacheKey);

    $resp = new CoreResponse();
    $resp->setStatusCode(200);
    $resp->setHeader('Content-Type', 'application/json');
    $resp->setContent(json_encode(['success' => true, 'message' => 'Mock data saved']));
    return $resp;
}, []);

/** POST /api/v1/data/reset — clears all data tables */
$router->postApi('v1', '/data/reset', function ($request, $response) {
    $db = \App\Core\Config::get('database');
    $logger = new \App\Core\Logger(dirname(__DIR__, 2) . '/storage/logs/db.log');
    $database = new \App\Core\Database($db, $logger);
    $tables = [
        'hub_about', 'hub_leaderships', 'hub_constitution', 'hub_constitution_articles',
        'hub_archives', 'hub_assets', 'hub_committees', 'hub_gallery_images',
        'regions', 'study_centers', 'program_center', 'coordinator_center',
        'nearby_hotels', 'nearby_health_facilities', 'nearby_restaurants',
        'hotel_center', 'health_center', 'restaurant_center',
        'coordinators', 'academic_programs',
        'announcements', 'events', 'academics', 'opportunities',
    ];
    foreach ($tables as $table) {
        try { $database->query("DELETE FROM `{$table}`"); } catch (\Throwable $e) { /* ignore */ }
    }
    // Invalidate all data caches
    $keys = ['hubData', 'centers', 'announcements', 'mockData'];
    foreach ($keys as $key) {
        (new \App\Core\Cache())->forget('resp_cache:' . md5("GET|/api/v1/data/{$key}|"));
    }

    $resp = new CoreResponse();
    $resp->setStatusCode(200);
    $resp->setHeader('Content-Type', 'application/json');
    $resp->setContent(json_encode(['success' => true, 'message' => 'All data cleared']));
    return $resp;
}, []);

