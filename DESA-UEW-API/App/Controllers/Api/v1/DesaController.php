<?php
declare(strict_types=1);

namespace App\Controllers\Api\v1;

use App\Core\Request;
use App\Core\Response;
use App\Core\Traits\JsonResponseTrait;
use App\Repositories\DesaRepository;

/**
 * DESA Public API Controller — v1
 *
 * Endpoints:
 *   GET  /api/v1/desa/regions
 *   GET  /api/v1/desa/regions/{slug}
 *   GET  /api/v1/desa/study-centers
 *   GET  /api/v1/desa/study-centers/{slug}
 *   GET  /api/v1/desa/programs
 *   GET  /api/v1/desa/announcements
 *   GET  /api/v1/desa/events
 *   GET  /api/v1/desa/academics
 *   GET  /api/v1/desa/opportunities
 *   GET  /api/v1/desa/search
 *   GET  /api/v1/desa/hub/about
 *   GET  /api/v1/desa/hub/leadership
 *   GET  /api/v1/desa/hub/constitution
 *   GET  /api/v1/desa/hub/archives
 *   GET  /api/v1/desa/hub/assets
 *   GET  /api/v1/desa/hub/committees
 *   GET  /api/v1/desa/hub/gallery
 */
class DesaController
{
    use JsonResponseTrait;

    private DesaRepository $repo;

    public function __construct(?DesaRepository $repo = null)
    {
        $this->repo = $repo ?? new DesaRepository(\App\Core\Database::getInstance());
    }

    // ── Regions ──────────────────────────────────────────────────────────

    /** GET /api/v1/desa/regions */
    public function regions(Request $request, Response $response): Response
    {
        try {
            $regions = $this->repo->getAllRegions();
            return $this->json($response, 200, [
                'success' => true,
                'data'    => $regions,
                'meta'    => ['total' => count($regions)],
            ]);
        } catch (\Throwable $e) {
            return $this->json($response, 500, [
                'success' => false,
                'error'   => 'REGIONS_FETCH_ERROR',
                'message' => 'Failed to fetch regions',
            ]);
        }
    }

    /** GET /api/v1/desa/regions/{slug} */
    public function region(Request $request, Response $response, array $params): Response
    {
        try {
            $region = $this->repo->getRegion($params['slug']);
            if (!$region) {
                return $this->json($response, 404, [
                    'success' => false,
                    'error'   => 'REGION_NOT_FOUND',
                    'message' => 'Region not found',
                ]);
            }
            return $this->json($response, 200, [
                'success' => true,
                'data'    => $region,
            ]);
        } catch (\Throwable $e) {
            return $this->json($response, 500, [
                'success' => false,
                'error'   => 'REGION_FETCH_ERROR',
                'message' => 'Failed to fetch region',
            ]);
        }
    }

    // ── Study Centers ────────────────────────────────────────────────────

    /** GET /api/v1/desa/study-centers */
    public function studyCenters(Request $request, Response $response): Response
    {
        try {
            $params = [
                'region_id' => $request->getQuery('region_id'),
                'search'    => $request->getQuery('search'),
                'limit'     => (int) $request->getQuery('limit', 50),
                'offset'    => (int) $request->getQuery('offset', 0),
            ];
            $centers = $this->repo->getAllCenters($params);
            return $this->json($response, 200, [
                'success' => true,
                'data'    => $centers,
                'meta'    => [
                    'total' => count($centers),
                    'limit' => $params['limit'],
                    'offset' => $params['offset'],
                ],
            ]);
        } catch (\Throwable $e) {
            return $this->json($response, 500, [
                'success' => false,
                'error'   => 'CENTERS_FETCH_ERROR',
                'message' => 'Failed to fetch study centers',
            ]);
        }
    }

    /** GET /api/v1/desa/study-centers/{slug} */
    public function studyCenter(Request $request, Response $response, array $params): Response
    {
        try {
            $center = $this->repo->getCenter($params['slug']);
            if (!$center) {
                return $this->json($response, 404, [
                    'success' => false,
                    'error'   => 'CENTER_NOT_FOUND',
                    'message' => 'Study center not found',
                ]);
            }
            return $this->json($response, 200, [
                'success' => true,
                'data'    => $center,
            ]);
        } catch (\Throwable $e) {
            return $this->json($response, 500, [
                'success' => false,
                'error'   => 'CENTER_FETCH_ERROR',
                'message' => 'Failed to fetch study center',
            ]);
        }
    }

    // ── Programs ─────────────────────────────────────────────────────────

    /** GET /api/v1/desa/programs */
    public function programs(Request $request, Response $response): Response
    {
        try {
            $params = [
                'department' => $request->getQuery('department'),
                'search'     => $request->getQuery('search'),
            ];
            $programs = $this->repo->getAllPrograms($params);
            return $this->json($response, 200, [
                'success' => true,
                'data'    => $programs,
                'meta'    => ['total' => count($programs)],
            ]);
        } catch (\Throwable $e) {
            return $this->json($response, 500, [
                'success' => false,
                'error'   => 'PROGRAMS_FETCH_ERROR',
                'message' => 'Failed to fetch programs',
            ]);
        }
    }

    // ── Announcements ────────────────────────────────────────────────────

    /** GET /api/v1/desa/announcements */
    public function announcements(Request $request, Response $response): Response
    {
        try {
            $params = [
                'limit'  => (int) $request->getQuery('limit', 20),
                'offset' => (int) $request->getQuery('offset', 0),
                'type'   => $request->getQuery('type'),
            ];
            $announcements = $this->repo->getAllAnnouncements($params);
            return $this->json($response, 200, [
                'success' => true,
                'data'    => $announcements,
                'meta'    => ['total' => count($announcements)],
            ]);
        } catch (\Throwable $e) {
            return $this->json($response, 500, [
                'success' => false,
                'error'   => 'ANNOUNCEMENTS_FETCH_ERROR',
                'message' => 'Failed to fetch announcements',
            ]);
        }
    }

    // ── Events ───────────────────────────────────────────────────────────

    /** GET /api/v1/desa/events */
    public function events(Request $request, Response $response): Response
    {
        try {
            $params = [
                'limit'  => (int) $request->getQuery('limit', 20),
                'offset' => (int) $request->getQuery('offset', 0),
                'type'   => $request->getQuery('type'),
            ];
            $events = $this->repo->getAllEvents($params);
            return $this->json($response, 200, [
                'success' => true,
                'data'    => $events,
                'meta'    => ['total' => count($events)],
            ]);
        } catch (\Throwable $e) {
            return $this->json($response, 500, [
                'success' => false,
                'error'   => 'EVENTS_FETCH_ERROR',
                'message' => $e->getMessage(),
            ]);
        }
    }

    // ── Academics ────────────────────────────────────────────────────────

    /** GET /api/v1/desa/academics */
    public function academics(Request $request, Response $response): Response
    {
        try {
            $params = [
                'category' => $request->getQuery('category'),
                'limit'    => (int) $request->getQuery('limit', 50),
                'offset'   => (int) $request->getQuery('offset', 0),
            ];
            $academics = $this->repo->getAllAcademics($params);
            return $this->json($response, 200, [
                'success' => true,
                'data'    => $academics,
                'meta'    => ['total' => count($academics)],
            ]);
        } catch (\Throwable $e) {
            file_put_contents(__DIR__ . '/../../../storage/logs/controller_error.log', date('Y-m-d H:i:s') . ' ACADEMICS: ' . $e->getMessage() . PHP_EOL, FILE_APPEND);
            return $this->json($response, 500, [
                'success' => false,
                'error'   => 'ACADEMICS_FETCH_ERROR',
                'message' => 'Failed to fetch academic resources',
            ]);
        }
    }

    // ── Opportunities ────────────────────────────────────────────────────

    /** GET /api/v1/desa/opportunities */
    public function opportunities(Request $request, Response $response): Response
    {
        try {
            $params = [
                'category' => $request->getQuery('category'),
                'limit'    => (int) $request->getQuery('limit', 50),
                'offset'   => (int) $request->getQuery('offset', 0),
            ];
            $opportunities = $this->repo->getAllOpportunities($params);
            return $this->json($response, 200, [
                'success' => true,
                'data'    => $opportunities,
                'meta'    => ['total' => count($opportunities)],
            ]);
        } catch (\Throwable $e) {
            file_put_contents(__DIR__ . '/../../../storage/logs/controller_error.log', date('Y-m-d H:i:s') . ' OPPORTUNITIES: ' . $e->getMessage() . PHP_EOL, FILE_APPEND);
            return $this->json($response, 500, [
                'success' => false,
                'error'   => 'OPPORTUNITIES_FETCH_ERROR',
                'message' => 'Failed to fetch opportunities',
            ]);
        }
    }

    // ── Unified Search ───────────────────────────────────────────────────

    /** GET /api/v1/desa/search */
    public function search(Request $request, Response $response): Response
    {
        try {
            $query      = $request->getQuery('q', '');
            $category   = $request->getQuery('category', '');
            $regionSlug = $request->getQuery('region', '');
            $limit      = (int) $request->getQuery('limit', 50);
            $offset     = (int) $request->getQuery('offset', 0);

            $results = $this->repo->searchDirectory($query, $category, $regionSlug, $limit, $offset);
            return $this->json($response, 200, [
                'success' => true,
                'data'    => $results['items'],
                'meta'    => [
                    'total'  => $results['total'],
                    'limit'  => $results['limit'],
                    'offset' => $results['offset'],
                    'query'  => $query,
                    'category' => $category,
                ],
            ]);
        } catch (\Throwable $e) {
            file_put_contents(__DIR__ . '/../../../storage/logs/controller_error.log', date('Y-m-d H:i:s') . ' SEARCH: ' . $e->getMessage() . PHP_EOL, FILE_APPEND);
            return $this->json($response, 500, [
                'success' => false,
                'error'   => 'SEARCH_ERROR',
                'message' => 'Search failed',
            ]);
        }
    }

    // ── Hub: About ───────────────────────────────────────────────────────

    /** GET /api/v1/desa/hub/about */
    public function hubAbout(Request $request, Response $response): Response
    {
        try {
            $about = $this->repo->getHubAbout();
            return $this->json($response, 200, [
                'success' => true,
                'data'    => $about ?? [],
            ]);
        } catch (\Throwable $e) {
            return $this->json($response, 500, [
                'success' => false,
                'error'   => 'HUB_ABOUT_ERROR',
                'message' => 'Failed to fetch hub about',
            ]);
        }
    }

    // ── Hub: Leadership ──────────────────────────────────────────────────

    /** GET /api/v1/desa/hub/leadership */
    public function hubLeadership(Request $request, Response $response): Response
    {
        try {
            $leaders = $this->repo->getAllLeaderships();
            return $this->json($response, 200, [
                'success' => true,
                'data'    => $leaders,
                'meta'    => ['total' => count($leaders)],
            ]);
        } catch (\Throwable $e) {
            return $this->json($response, 500, [
                'success' => false,
                'error'   => 'HUB_LEADERSHIP_ERROR',
                'message' => 'Failed to fetch leadership',
            ]);
        }
    }

    // ── Hub: Constitution ────────────────────────────────────────────────

    /** GET /api/v1/desa/hub/constitution */
    public function hubConstitution(Request $request, Response $response): Response
    {
        try {
            $constitution = $this->repo->getConstitution();
            return $this->json($response, 200, [
                'success' => true,
                'data'    => $constitution ?? [],
            ]);
        } catch (\Throwable $e) {
            return $this->json($response, 500, [
                'success' => false,
                'error'   => 'HUB_CONSTITUTION_ERROR',
                'message' => 'Failed to fetch constitution',
            ]);
        }
    }

    // ── Hub: Archives ────────────────────────────────────────────────────

    /** GET /api/v1/desa/hub/archives */
    public function hubArchives(Request $request, Response $response): Response
    {
        try {
            $archives = $this->repo->getAllArchives();
            return $this->json($response, 200, [
                'success' => true,
                'data'    => $archives,
                'meta'    => ['total' => count($archives)],
            ]);
        } catch (\Throwable $e) {
            return $this->json($response, 500, [
                'success' => false,
                'error'   => 'HUB_ARCHIVES_ERROR',
                'message' => 'Failed to fetch archives',
            ]);
        }
    }

    // ── Hub: Assets ──────────────────────────────────────────────────────

    /** GET /api/v1/desa/hub/assets */
    public function hubAssets(Request $request, Response $response): Response
    {
        try {
            $assets = $this->repo->getAllAssets();
            return $this->json($response, 200, [
                'success' => true,
                'data'    => $assets,
                'meta'    => ['total' => count($assets)],
            ]);
        } catch (\Throwable $e) {
            return $this->json($response, 500, [
                'success' => false,
                'error'   => 'HUB_ASSETS_ERROR',
                'message' => 'Failed to fetch assets',
            ]);
        }
    }

    // ── Hub: Committees ──────────────────────────────────────────────────

    /** GET /api/v1/desa/hub/committees */
    public function hubCommittees(Request $request, Response $response): Response
    {
        try {
            $committees = $this->repo->getAllCommittees();
            return $this->json($response, 200, [
                'success' => true,
                'data'    => $committees,
                'meta'    => ['total' => count($committees)],
            ]);
        } catch (\Throwable $e) {
            return $this->json($response, 500, [
                'success' => false,
                'error'   => 'HUB_COMMITTEES_ERROR',
                'message' => 'Failed to fetch committees',
            ]);
        }
    }

    // ── Hub: Gallery ─────────────────────────────────────────────────────

    /** GET /api/v1/desa/hub/gallery */
    public function hubGallery(Request $request, Response $response): Response
    {
        try {
            $images = $this->repo->getGalleryImages();
            return $this->json($response, 200, [
                'success' => true,
                'data'    => $images,
                'meta'    => ['total' => count($images)],
            ]);
        } catch (\Throwable $e) {
            return $this->json($response, 500, [
                'success' => false,
                'error'   => 'HUB_GALLERY_ERROR',
                'message' => 'Failed to fetch gallery',
            ]);
        }
    }

    // ── Center Amenities ────────────────────────────────────────────────────

    /** GET /api/v1/desa/centers/{id}/coordinators */
    public function getCenterCoordinators(Request $request, Response $response, array $params): Response
    {
        try {
            $sql = "SELECT co.id, co.first_name, co.last_name, co.full_name, co.title,
                           co.phone, co.email, co.office, co.office_hours
                    FROM coordinators co
                    JOIN coordinator_center cc ON cc.coordinator_id = co.id
                    WHERE cc.center_id = ? AND co.is_active = 1 AND cc.is_active = 1
                    ORDER BY cc.is_primary DESC, co.last_name ASC";
            return $this->json($response, 200, ['success' => true, 'data' => $this->repo->fetchAll($sql, [(int)$params['id']])]);
        } catch (\Throwable $e) {
            return $this->json($response, 500, ['success' => false, 'error' => 'COORDINATORS_FETCH_ERROR']);
        }
    }

    /** GET /api/v1/desa/centers/{id}/hotels */
    public function getCenterHotels(Request $request, Response $response, array $params): Response
    {
        try {
            $sql = "SELECT h.id, h.name, h.distance, h.rate_range, h.phone, h.rating, h.amenities
                    FROM nearby_hotels h
                    JOIN hotel_center hc ON hc.hotel_id = h.id
                    WHERE hc.center_id = ? AND h.is_active = 1";
            return $this->json($response, 200, ['success' => true, 'data' => $this->repo->fetchAll($sql, [(int)$params['id']])]);
        } catch (\Throwable $e) {
            return $this->json($response, 500, ['success' => false, 'error' => 'HOTELS_FETCH_ERROR']);
        }
    }

    /** GET /api/v1/desa/centers/{id}/health */
    public function getCenterHealth(Request $request, Response $response, array $params): Response
    {
        try {
            $sql = "SELECT hf.id, hf.name, hf.type, hf.distance, hf.phone, hf.hours, hf.is_24_7
                    FROM nearby_health_facilities hf
                    JOIN health_center hcf ON hcf.facility_id = hf.id
                    WHERE hcf.center_id = ? AND hf.is_active = 1";
            return $this->json($response, 200, ['success' => true, 'data' => $this->repo->fetchAll($sql, [(int)$params['id']])]);
        } catch (\Throwable $e) {
            return $this->json($response, 500, ['success' => false, 'error' => 'HEALTH_FETCH_ERROR']);
        }
    }

    /** GET /api/v1/desa/centers/{id}/restaurants */
    public function getCenterRestaurants(Request $request, Response $response, array $params): Response
    {
        try {
            $sql = "SELECT r.id, r.name, r.distance, r.specialty, r.open_hours, r.cuisine_type, r.price_range
                    FROM nearby_restaurants r
                    JOIN restaurant_center rc ON rc.restaurant_id = r.id
                    WHERE rc.center_id = ? AND r.is_active = 1";
            return $this->json($response, 200, ['success' => true, 'data' => $this->repo->fetchAll($sql, [(int)$params['id']])]);
        } catch (\Throwable $e) {
            return $this->json($response, 500, ['success' => false, 'error' => 'RESTAURANTS_FETCH_ERROR']);
        }
    }
}
