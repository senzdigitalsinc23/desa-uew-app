<?php
declare(strict_types=1);

namespace App\Controllers\Api\v1;

use App\Core\Request;
use App\Core\Response;
use App\Core\Traits\JsonResponseTrait;
use App\Repositories\DesaRepository;

/**
 * DESA Admin API Controller — v1
 * All endpoints require AuthMiddleware.
 *
 * Endpoints:
 *   GET    /api/v1/admin/desa/stats
 *
 *   Regions
 *   GET    /api/v1/admin/desa/regions
 *   POST   /api/v1/admin/desa/regions
 *   PUT    /api/v1/admin/desa/regions/{id}
 *   DELETE /api/v1/admin/desa/regions/{id}
 *
 *   Study Centers
 *   GET    /api/v1/admin/desa/centers
 *   POST   /api/v1/admin/desa/centers
 *   PUT    /api/v1/admin/desa/centers/{id}
 *   DELETE /api/v1/admin/desa/centers/{id}
 *
 *   Programs
 *   GET    /api/v1/admin/desa/programs
 *   POST   /api/v1/admin/desa/programs
 *   PUT    /api/v1/admin/desa/programs/{id}
 *   DELETE /api/v1/admin/desa/programs/{id}
 *
 *   Coordinators
 *   GET    /api/v1/admin/desa/coordinators
 *   POST   /api/v1/admin/desa/coordinators
 *   PUT    /api/v1/admin/desa/coordinators/{id}
 *   DELETE /api/v1/admin/desa/coordinators/{id}
 *
 *   Nearby Hotels
 *   GET    /api/v1/admin/desa/hotels
 *   POST   /api/v1/admin/desa/hotels
 *   PUT    /api/v1/admin/desa/hotels/{id}
 *   DELETE /api/v1/admin/desa/hotels/{id}
 *
 *   Nearby Health
 *   GET    /api/v1/admin/desa/health
 *   POST   /api/v1/admin/desa/health
 *   PUT    /api/v1/admin/desa/health/{id}
 *   DELETE /api/v1/admin/desa/health/{id}
 *
 *   Nearby Restaurants
 *   GET    /api/v1/admin/desa/restaurants
 *   POST   /api/v1/admin/desa/restaurants
 *   PUT    /api/v1/admin/desa/restaurants/{id}
 *   DELETE /api/v1/admin/desa/restaurants/{id}
 *
 *   Announcements
 *   GET    /api/v1/admin/desa/announcements
 *   POST   /api/v1/admin/desa/announcements
 *   PUT    /api/v1/admin/desa/announcements/{id}
 *   DELETE /api/v1/admin/desa/announcements/{id}
 *
 *   Events
 *   GET    /api/v1/admin/desa/events
 *   POST   /api/v1/admin/desa/events
 *   PUT    /api/v1/admin/desa/events/{id}
 *   DELETE /api/v1/admin/desa/events/{id}
 *
 *   Hub About
 *   GET    /api/v1/admin/desa/hub/about
 *   PUT    /api/v1/admin/desa/hub/about
 *
 *   Hub Leadership
 *   GET    /api/v1/admin/desa/hub/leadership
 *   POST   /api/v1/admin/desa/hub/leadership
 *   PUT    /api/v1/admin/desa/hub/leadership/{id}
 *   DELETE /api/v1/admin/desa/hub/leadership/{id}
 *
 *   Hub Constitution
 *   GET    /api/v1/admin/desa/hub/constitution
 *   POST   /api/v1/admin/desa/hub/constitution
 *   PUT    /api/v1/admin/desa/hub/constitution/articles/{id}
 *   DELETE /api/v1/admin/desa/hub/constitution/articles/{id}
 *
 *   Hub Archives
 *   GET    /api/v1/admin/desa/hub/archives
 *   POST   /api/v1/admin/desa/hub/archives
 *   PUT    /api/v1/admin/desa/hub/archives/{id}
 *   DELETE /api/v1/admin/desa/hub/archives/{id}
 *
 *   Hub Assets
 *   GET    /api/v1/admin/desa/hub/assets
 *   POST   /api/v1/admin/desa/hub/assets
 *   PUT    /api/v1/admin/desa/hub/assets/{id}
 *   DELETE /api/v1/admin/desa/hub/assets/{id}
 *
 *   Hub Committees
 *   GET    /api/v1/admin/desa/hub/committees
 *   POST   /api/v1/admin/desa/hub/committees
 *   PUT    /api/v1/admin/desa/hub/committees/{id}
 *   DELETE /api/v1/admin/desa/hub/committees/{id}
 *
 *   Hub Gallery
 *   GET    /api/v1/admin/desa/hub/gallery
 *   POST   /api/v1/admin/desa/hub/gallery
 *   PUT    /api/v1/admin/desa/hub/gallery/{id}
 *   DELETE /api/v1/admin/desa/hub/gallery/{id}
 *
 *   Academics
 *   GET    /api/v1/admin/desa/academics
 *   POST   /api/v1/admin/desa/academics
 *   PUT    /api/v1/admin/desa/academics/{id}
 *   DELETE /api/v1/admin/desa/academics/{id}
 *
 *   Opportunities
 *   GET    /api/v1/admin/desa/opportunities
 *   POST   /api/v1/admin/desa/opportunities
 *   PUT    /api/v1/admin/desa/opportunities/{id}
 *   DELETE /api/v1/admin/desa/opportunities/{id}
 */
class DesaAdminController
{
    use JsonResponseTrait;

    private DesaRepository $repo;

    public function __construct(?DesaRepository $repo = null)
    {
        $this->repo = $repo ?? new DesaRepository(\App\Core\Database::getInstance());
    }

    // ── Dashboard Stats ──────────────────────────────────────────────────

    /** GET /api/v1/admin/desa/stats */
    public function stats(Request $request, Response $response): Response
    {
        try {
            $stats = $this->repo->getDashboardStats();
            return $this->json($response, 200, [
                'success' => true,
                'data'    => $stats,
            ]);
        } catch (\Throwable $e) {
            return $this->json($response, 500, [
                'success' => false,
                'error'   => 'STATS_ERROR',
                'message' => 'Failed to fetch stats',
            ]);
        }
    }

    // ── Helper: generate slug ────────────────────────────────────────────

    private function makeSlug(string $text): string
    {
        $slug = preg_replace('/[^a-zA-Z0-9\s-]/', '', $text);
        $slug = strtolower(trim($slug));
        $slug = preg_replace('/[\s-]+/', '-', $slug);
        return $slug ?: 'item-' . time();
    }

    // ── Regions CRUD ─────────────────────────────────────────────────────

    /** GET /api/v1/admin/desa/regions */
    public function listRegions(Request $request, Response $response): Response
    {
        try {
            $regions = $this->repo->getAllRegions();
            return $this->json($response, 200, ['success' => true, 'data' => $regions]);
        } catch (\Throwable $e) {
            return $this->json($response, 500, ['success' => false, 'error' => 'REGIONS_LIST_ERROR']);
        }
    }

    /** POST /api/v1/admin/desa/regions */
    public function createRegion(Request $request, Response $response): Response
    {
        try {
            $data = $request->getBodyParams();
            $data['slug'] = $data['slug'] ?? $this->makeSlug($data['name']);
            $data['created_at'] = date('Y-m-d H:i:s');
            $data['updated_at'] = date('Y-m-d H:i:s');
            $id = $this->repo->insert('regions', $data);
            return $this->json($response, 201, ['success' => true, 'data' => ['id' => $id]]);
        } catch (\Throwable $e) {
            return $this->json($response, 500, ['success' => false, 'error' => 'REGION_CREATE_ERROR']);
        }
    }

    /** PUT /api/v1/admin/desa/regions/{id} */
    public function updateRegion(Request $request, Response $response, array $params): Response
    {
        try {
            $data = $request->getBodyParams();
            $data['updated_at'] = date('Y-m-d H:i:s');
            $this->repo->update('regions', $data, 'id = ?', [(int)$params['id']]);
            return $this->json($response, 200, ['success' => true]);
        } catch (\Throwable $e) {
            return $this->json($response, 500, ['success' => false, 'error' => 'REGION_UPDATE_ERROR']);
        }
    }

    /** DELETE /api/v1/admin/desa/regions/{id} */
    public function deleteRegion(Request $request, Response $response, array $params): Response
    {
        try {
            $this->repo->update('regions', ['is_active' => 0, 'updated_at' => date('Y-m-d H:i:s')], 'id = ?', [(int)$params['id']]);
            return $this->json($response, 200, ['success' => true]);
        } catch (\Throwable $e) {
            return $this->json($response, 500, ['success' => false, 'error' => 'REGION_DELETE_ERROR']);
        }
    }

    // ── Study Centers CRUD ───────────────────────────────────────────────

    /** GET /api/v1/admin/desa/centers */
    public function listCenters(Request $request, Response $response): Response
    {
        try {
            $params = [
                'region_id' => $request->getQuery('region_id'),
                'search'    => $request->getQuery('search'),
                'limit'     => (int) $request->getQuery('limit', 100),
                'offset'    => (int) $request->getQuery('offset', 0),
            ];
            $centers = $this->repo->getAllCenters($params);
            return $this->json($response, 200, ['success' => true, 'data' => $centers]);
        } catch (\Throwable $e) {
            return $this->json($response, 500, ['success' => false, 'error' => 'CENTERS_LIST_ERROR']);
        }
    }

    /** POST /api/v1/admin/desa/centers */
    public function createCenter(Request $request, Response $response): Response
    {
        try {
            $data = $request->getBodyParams();
            $data['slug'] = $data['slug'] ?? $this->makeSlug($data['name']);
            $data['is_active'] = $data['is_active'] ?? 1;
            $data['public'] = $data['public'] ?? 1;
            $data['created_at'] = date('Y-m-d H:i:s');
            $data['updated_at'] = date('Y-m-d H:i:s');
            $id = $this->repo->insert('study_centers', $data);

            // Handle coordinators pivot
            if (!empty($data['coordinator_ids'])) {
                foreach ($data['coordinator_ids'] as $ci) {
                    $this->repo->insert('coordinator_center', [
                        'coordinator_id' => $ci,
                        'center_id' => $id,
                        'is_primary' => $ci == ($data['primary_coordinator_id'] ?? null) ? 1 : 0,
                        'created_at' => date('Y-m-d H:i:s'),
                        'updated_at' => date('Y-m-d H:i:s'),
                    ]);
                }
            }

            // Handle programs pivot
            if (!empty($data['program_ids'])) {
                foreach ($data['program_ids'] as $pid) {
                    $this->repo->insert('program_center', [
                        'program_id' => $pid,
                        'center_id' => $id,
                        'created_at' => date('Y-m-d H:i:s'),
                        'updated_at' => date('Y-m-d H:i:s'),
                    ]);
                }
            }

            return $this->json($response, 201, ['success' => true, 'data' => ['id' => $id]]);
        } catch (\Throwable $e) {
            return $this->json($response, 500, ['success' => false, 'error' => 'CENTER_CREATE_ERROR', 'message' => $e->getMessage()]);
        }
    }

    /** PUT /api/v1/admin/desa/centers/{id} */
    public function updateCenter(Request $request, Response $response, array $params): Response
    {
        try {
            $data = $request->getBodyParams();
            $data['updated_at'] = date('Y-m-d H:i:s');
            unset($data['coordinator_ids'], $data['program_ids'], $data['primary_coordinator_id']);
            $this->repo->update('study_centers', $data, 'id = ?', [(int)$params['id']]);

            // Rebuild coordinator pivot
            if (array_key_exists('coordinator_ids', $data)) {
                $this->repo->delete('coordinator_center', 'center_id = ?', [(int)$params['id']]);
                foreach ($data['coordinator_ids'] as $ci) {
                    $this->repo->insert('coordinator_center', [
                        'coordinator_id' => $ci,
                        'center_id' => $params['id'],
                        'is_primary' => $ci == ($data['primary_coordinator_id'] ?? null) ? 1 : 0,
                        'created_at' => date('Y-m-d H:i:s'),
                        'updated_at' => date('Y-m-d H:i:s'),
                    ]);
                }
            }

            // Rebuild program pivot
            if (array_key_exists('program_ids', $data)) {
                $this->repo->delete('program_center', 'center_id = ?', [(int)$params['id']]);
                foreach ($data['program_ids'] as $pid) {
                    $this->repo->insert('program_center', [
                        'program_id' => $pid,
                        'center_id' => $params['id'],
                        'created_at' => date('Y-m-d H:i:s'),
                        'updated_at' => date('Y-m-d H:i:s'),
                    ]);
                }
            }

            return $this->json($response, 200, ['success' => true]);
        } catch (\Throwable $e) {
            return $this->json($response, 500, ['success' => false, 'error' => 'CENTER_UPDATE_ERROR']);
        }
    }

    /** DELETE /api/v1/admin/desa/centers/{id} */
    public function deleteCenter(Request $request, Response $response, array $params): Response
    {
        try {
            $this->repo->update('study_centers', ['is_active' => 0, 'updated_at' => date('Y-m-d H:i:s')], 'id = ?', [(int)$params['id']]);
            return $this->json($response, 200, ['success' => true]);
        } catch (\Throwable $e) {
            return $this->json($response, 500, ['success' => false, 'error' => 'CENTER_DELETE_ERROR']);
        }
    }

    /** POST /api/v1/admin/desa/centers/{id}/link-coordinator */
    public function linkCoordinatorToCenter(Request $request, Response $response, array $params): Response
    {
        try {
            $data = $request->getBodyParams();
            $centerId = (int) $params['id'];
            $coordinatorName = trim($data['name'] ?? '');
            $coordinatorPhone = trim($data['phone'] ?? '');
            $coordinatorEmail = trim($data['email'] ?? '');
            $coordinatorTitle = trim($data['title'] ?? 'Study Center Coordinator');
            $coordinatorOffice = trim($data['office'] ?? '');
            $coordinatorHours = trim($data['hours'] ?? '');

            // Find or create the coordinator
            $existing = $this->repo->fetchSingle(
                "SELECT id FROM coordinators WHERE email = :email AND is_active = 1 LIMIT 1",
                ['email' => $coordinatorEmail]
            );
            if ($existing) {
                $coordinatorId = (int) $existing['id'];
            } else {
                $firstName = '';
                $lastName = '';
                if (!empty($coordinatorName)) {
                    $parts = explode(' ', $coordinatorName, 2);
                    $firstName = $parts[0];
                    $lastName = $parts[1] ?? '';
                }
                $coordinatorId = $this->repo->insert('coordinators', [
                    'first_name' => $firstName,
                    'last_name'  => $lastName,
                    'full_name'  => $coordinatorName ?: ($firstName ?: $coordinatorTitle),
                    'title'      => $coordinatorTitle,
                    'phone'      => $coordinatorPhone,
                    'email'      => $coordinatorEmail,
                    'office'     => $coordinatorOffice,
                    'office_hours' => $coordinatorHours,
                    'is_active'  => 1,
                    'created_at' => date('Y-m-d H:i:s'),
                    'updated_at' => date('Y-m-d H:i:s'),
                ]);
            }

            // Link coordinator to center (avoid duplicates)
            $alreadyLinked = $this->repo->fetchSingle(
                "SELECT id FROM coordinator_center WHERE center_id = :cid AND coordinator_id = :coi LIMIT 1",
                ['cid' => $centerId, 'coi' => $coordinatorId]
            );
            if (!$alreadyLinked) {
                $this->repo->insert('coordinator_center', [
                    'center_id'      => $centerId,
                    'coordinator_id' => $coordinatorId,
                    'is_primary'     => 1,
                    'is_active'      => 1,
                    'created_at'     => date('Y-m-d H:i:s'),
                    'updated_at'     => date('Y-m-d H:i:s'),
                ]);
            }

            return $this->json($response, 200, ['success' => true, 'data' => ['coordinator_id' => $coordinatorId]]);
        } catch (\Throwable $e) {
            return $this->json($response, 500, ['success' => false, 'error' => 'COORDINATOR_LINK_ERROR', 'message' => $e->getMessage()]);
        }
    }

    // ── Programs CRUD ────────────────────────────────────────────────────

    /** GET /api/v1/admin/desa/programs */
    public function listPrograms(Request $request, Response $response): Response
    {
        try {
            $params = ['search' => $request->getQuery('search'), 'department' => $request->getQuery('department')];
            $programs = $this->repo->getAllPrograms($params);
            return $this->json($response, 200, ['success' => true, 'data' => $programs]);
        } catch (\Throwable $e) {
            return $this->json($response, 500, ['success' => false, 'error' => 'PROGRAMS_LIST_ERROR']);
        }
    }

    /** POST /api/v1/admin/desa/programs */
    public function createProgram(Request $request, Response $response): Response
    {
        try {
            $data = $request->getBodyParams();
            $data['slug'] = $data['slug'] ?? $this->makeSlug($data['title']);
            $data['is_active'] = $data['is_active'] ?? 1;
            $data['public'] = $data['public'] ?? 1;
            $data['created_at'] = date('Y-m-d H:i:s');
            $data['updated_at'] = date('Y-m-d H:i:s');
            $id = $this->repo->insert('academic_programs', $data);
            return $this->json($response, 201, ['success' => true, 'data' => ['id' => $id]]);
        } catch (\Throwable $e) {
            return $this->json($response, 500, ['success' => false, 'error' => 'PROGRAM_CREATE_ERROR']);
        }
    }

    /** PUT /api/v1/admin/desa/programs/{id} */
    public function updateProgram(Request $request, Response $response, array $params): Response
    {
        try {
            $data = $request->getBodyParams();
            $data['updated_at'] = date('Y-m-d H:i:s');
            $this->repo->update('academic_programs', $data, 'id = ?', [(int)$params['id']]);
            return $this->json($response, 200, ['success' => true]);
        } catch (\Throwable $e) {
            return $this->json($response, 500, ['success' => false, 'error' => 'PROGRAM_UPDATE_ERROR']);
        }
    }

    /** DELETE /api/v1/admin/desa/programs/{id} */
    public function deleteProgram(Request $request, Response $response, array $params): Response
    {
        try {
            $this->repo->update('academic_programs', ['is_active' => 0, 'updated_at' => date('Y-m-d H:i:s')], 'id = ?', [(int)$params['id']]);
            return $this->json($response, 200, ['success' => true]);
        } catch (\Throwable $e) {
            return $this->json($response, 500, ['success' => false, 'error' => 'PROGRAM_DELETE_ERROR']);
        }
    }

    // ── Coordinators CRUD ────────────────────────────────────────────────

    /** GET /api/v1/admin/desa/coordinators */
    public function listCoordinators(Request $request, Response $response): Response
    {
        try {
            $sql = "SELECT * FROM coordinators WHERE is_active = 1 ORDER BY last_name, first_name";
            return $this->json($response, 200, ['success' => true, 'data' => $this->repo->fetchAll($sql)]);
        } catch (\Throwable $e) {
            return $this->json($response, 500, ['success' => false, 'error' => 'COORDINATORS_LIST_ERROR']);
        }
    }

    /** POST /api/v1/admin/desa/coordinators */
    public function createCoordinator(Request $request, Response $response): Response
    {
        try {
            $data = $request->getBodyParams();
            $data['created_at'] = date('Y-m-d H:i:s');
            $data['updated_at'] = date('Y-m-d H:i:s');
            $id = $this->repo->insert('coordinators', $data);
            return $this->json($response, 201, ['success' => true, 'data' => ['id' => $id]]);
        } catch (\Throwable $e) {
            return $this->json($response, 500, ['success' => false, 'error' => 'COORDINATOR_CREATE_ERROR']);
        }
    }

    /** PUT /api/v1/admin/desa/coordinators/{id} */
    public function updateCoordinator(Request $request, Response $response, array $params): Response
    {
        try {
            $data = $request->getBodyParams();
            $data['updated_at'] = date('Y-m-d H:i:s');
            $this->repo->update('coordinators', $data, 'id = ?', [(int)$params['id']]);
            return $this->json($response, 200, ['success' => true]);
        } catch (\Throwable $e) {
            return $this->json($response, 500, ['success' => false, 'error' => 'COORDINATOR_UPDATE_ERROR']);
        }
    }

    /** DELETE /api/v1/admin/desa/coordinators/{id} */
    public function deleteCoordinator(Request $request, Response $response, array $params): Response
    {
        try {
            $this->repo->update('coordinators', ['is_active' => 0, 'updated_at' => date('Y-m-d H:i:s')], 'id = ?', [(int)$params['id']]);
            return $this->json($response, 200, ['success' => true]);
        } catch (\Throwable $e) {
            return $this->json($response, 500, ['success' => false, 'error' => 'COORDINATOR_DELETE_ERROR']);
        }
    }

    // ── Nearby Hotels CRUD ───────────────────────────────────────────────

    /** GET /api/v1/admin/desa/hotels */
    public function listHotels(Request $request, Response $response): Response
    {
        try {
            $sql = "SELECT * FROM nearby_hotels WHERE is_active = 1 ORDER BY name";
            return $this->json($response, 200, ['success' => true, 'data' => $this->repo->fetchAll($sql)]);
        } catch (\Throwable $e) {
            return $this->json($response, 500, ['success' => false, 'error' => 'HOTELS_LIST_ERROR']);
        }
    }

    /** POST /api/v1/admin/desa/hotels */
    public function createHotel(Request $request, Response $response): Response
    {
        try {
            $data = $request->getBodyParams();
            $data['slug'] = $data['slug'] ?? $this->makeSlug($data['name']);
            $data['created_at'] = date('Y-m-d H:i:s');
            $data['updated_at'] = date('Y-m-d H:i:s');
            $id = $this->repo->insert('nearby_hotels', $data);
            return $this->json($response, 201, ['success' => true, 'data' => ['id' => $id]]);
        } catch (\Throwable $e) {
            return $this->json($response, 500, ['success' => false, 'error' => 'HOTEL_CREATE_ERROR']);
        }
    }

    /** PUT /api/v1/admin/desa/hotels/{id} */
    public function updateHotel(Request $request, Response $response, array $params): Response
    {
        try {
            $data = $request->getBodyParams();
            $data['updated_at'] = date('Y-m-d H:i:s');
            $this->repo->update('nearby_hotels', $data, 'id = ?', [(int)$params['id']]);
            return $this->json($response, 200, ['success' => true]);
        } catch (\Throwable $e) {
            return $this->json($response, 500, ['success' => false, 'error' => 'HOTEL_UPDATE_ERROR']);
        }
    }

    /** DELETE /api/v1/admin/desa/hotels/{id} */
    public function deleteHotel(Request $request, Response $response, array $params): Response
    {
        try {
            $this->repo->update('nearby_hotels', ['is_active' => 0, 'updated_at' => date('Y-m-d H:i:s')], 'id = ?', [(int)$params['id']]);
            return $this->json($response, 200, ['success' => true]);
        } catch (\Throwable $e) {
            return $this->json($response, 500, ['success' => false, 'error' => 'HOTEL_DELETE_ERROR']);
        }
    }

    // ── Nearby Health CRUD ───────────────────────────────────────────────

    /** GET /api/v1/admin/desa/health */
    public function listHealth(Request $request, Response $response): Response
    {
        try {
            $sql = "SELECT * FROM nearby_health_facilities WHERE is_active = 1 ORDER BY name";
            return $this->json($response, 200, ['success' => true, 'data' => $this->repo->fetchAll($sql)]);
        } catch (\Throwable $e) {
            return $this->json($response, 500, ['success' => false, 'error' => 'HEALTH_LIST_ERROR']);
        }
    }

    /** POST /api/v1/admin/desa/health */
    public function createHealth(Request $request, Response $response): Response
    {
        try {
            $data = $request->getBodyParams();
            $data['slug'] = $data['slug'] ?? $this->makeSlug($data['name']);
            $data['created_at'] = date('Y-m-d H:i:s');
            $data['updated_at'] = date('Y-m-d H:i:s');
            $id = $this->repo->insert('nearby_health_facilities', $data);
            return $this->json($response, 201, ['success' => true, 'data' => ['id' => $id]]);
        } catch (\Throwable $e) {
            return $this->json($response, 500, ['success' => false, 'error' => 'HEALTH_CREATE_ERROR']);
        }
    }

    /** PUT /api/v1/admin/desa/health/{id} */
    public function updateHealth(Request $request, Response $response, array $params): Response
    {
        try {
            $data = $request->getBodyParams();
            $data['updated_at'] = date('Y-m-d H:i:s');
            $this->repo->update('nearby_health_facilities', $data, 'id = ?', [(int)$params['id']]);
            return $this->json($response, 200, ['success' => true]);
        } catch (\Throwable $e) {
            return $this->json($response, 500, ['success' => false, 'error' => 'HEALTH_UPDATE_ERROR']);
        }
    }

    /** DELETE /api/v1/admin/desa/health/{id} */
    public function deleteHealth(Request $request, Response $response, array $params): Response
    {
        try {
            $this->repo->update('nearby_health_facilities', ['is_active' => 0, 'updated_at' => date('Y-m-d H:i:s')], 'id = ?', [(int)$params['id']]);
            return $this->json($response, 200, ['success' => true]);
        } catch (\Throwable $e) {
            return $this->json($response, 500, ['success' => false, 'error' => 'HEALTH_DELETE_ERROR']);
        }
    }

    // ── Nearby Restaurants CRUD ──────────────────────────────────────────

    /** GET /api/v1/admin/desa/restaurants */
    public function listRestaurants(Request $request, Response $response): Response
    {
        try {
            $sql = "SELECT * FROM nearby_restaurants WHERE is_active = 1 ORDER BY name";
            return $this->json($response, 200, ['success' => true, 'data' => $this->repo->fetchAll($sql)]);
        } catch (\Throwable $e) {
            return $this->json($response, 500, ['success' => false, 'error' => 'RESTAURANTS_LIST_ERROR']);
        }
    }

    /** POST /api/v1/admin/desa/restaurants */
    public function createRestaurant(Request $request, Response $response): Response
    {
        try {
            $data = $request->getBodyParams();
            $data['slug'] = $data['slug'] ?? $this->makeSlug($data['name']);
            $data['created_at'] = date('Y-m-d H:i:s');
            $data['updated_at'] = date('Y-m-d H:i:s');
            $id = $this->repo->insert('nearby_restaurants', $data);
            return $this->json($response, 201, ['success' => true, 'data' => ['id' => $id]]);
        } catch (\Throwable $e) {
            return $this->json($response, 500, ['success' => false, 'error' => 'RESTAURANT_CREATE_ERROR']);
        }
    }

    /** PUT /api/v1/admin/desa/restaurants/{id} */
    public function updateRestaurant(Request $request, Response $response, array $params): Response
    {
        try {
            $data = $request->getBodyParams();
            $data['updated_at'] = date('Y-m-d H:i:s');
            $this->repo->update('nearby_restaurants', $data, 'id = ?', [(int)$params['id']]);
            return $this->json($response, 200, ['success' => true]);
        } catch (\Throwable $e) {
            return $this->json($response, 500, ['success' => false, 'error' => 'RESTAURANT_UPDATE_ERROR']);
        }
    }

    /** DELETE /api/v1/admin/desa/restaurants/{id} */
    public function deleteRestaurant(Request $request, Response $response, array $params): Response
    {
        try {
            $this->repo->update('nearby_restaurants', ['is_active' => 0, 'updated_at' => date('Y-m-d H:i:s')], 'id = ?', [(int)$params['id']]);
            return $this->json($response, 200, ['success' => true]);
        } catch (\Throwable $e) {
            return $this->json($response, 500, ['success' => false, 'error' => 'RESTAURANT_DELETE_ERROR']);
        }
    }

    /** POST /api/v1/admin/desa/hotels/{id}/link-center */
    public function linkHotelToCenter(Request $request, Response $response, array $params): Response
    {
        try {
            $body = $request->getBodyParams();
            $centerId = (int)($body['center_id'] ?? 0);
            if (!$centerId) {
                return $this->json($response, 400, ['success' => false, 'error' => 'CENTER_ID_REQUIRED']);
            }
            $this->repo->insert('hotel_center', ['hotel_id' => (int)$params['id'], 'center_id' => $centerId]);
            return $this->json($response, 201, ['success' => true]);
        } catch (\Throwable $e) {
            return $this->json($response, 500, ['success' => false, 'error' => 'HOTEL_LINK_ERROR']);
        }
    }

    /** DELETE /api/v1/admin/desa/hotels/{id}/centers/{centerId} */
    public function unlinkHotelFromCenter(Request $request, Response $response, array $params): Response
    {
        try {
            $this->repo->delete('hotel_center', 'hotel_id = ? AND center_id = ?', [(int)$params['id'], (int)$params['centerId']]);
            return $this->json($response, 200, ['success' => true]);
        } catch (\Throwable $e) {
            return $this->json($response, 500, ['success' => false, 'error' => 'HOTEL_UNLINK_ERROR']);
        }
    }

    /** GET /api/v1/admin/desa/hotels/{id}/centers */
    public function getHotelCenters(Request $request, Response $response, array $params): Response
    {
        try {
            $sql = "SELECT c.* FROM study_centers c
                    JOIN hotel_center hc ON hc.center_id = c.id
                    WHERE hc.hotel_id = ? AND c.is_active = 1";
            return $this->json($response, 200, ['success' => true, 'data' => $this->repo->fetchAll($sql, [(int)$params['id']])]);
        } catch (\Throwable $e) {
            return $this->json($response, 500, ['success' => false, 'error' => 'HOTEL_CENTERS_ERROR']);
        }
    }

    /** POST /api/v1/admin/desa/health/{id}/link-center */
    public function linkHealthToCenter(Request $request, Response $response, array $params): Response
    {
        try {
            $body = $request->getBodyParams();
            $centerId = (int)($body['center_id'] ?? 0);
            if (!$centerId) {
                return $this->json($response, 400, ['success' => false, 'error' => 'CENTER_ID_REQUIRED']);
            }
            $this->repo->insert('health_center', ['facility_id' => (int)$params['id'], 'center_id' => $centerId]);
            return $this->json($response, 201, ['success' => true]);
        } catch (\Throwable $e) {
            return $this->json($response, 500, ['success' => false, 'error' => 'HEALTH_LINK_ERROR']);
        }
    }

    /** DELETE /api/v1/admin/desa/health/{id}/centers/{centerId} */
    public function unlinkHealthFromCenter(Request $request, Response $response, array $params): Response
    {
        try {
            $this->repo->delete('health_center', 'facility_id = ? AND center_id = ?', [(int)$params['id'], (int)$params['centerId']]);
            return $this->json($response, 200, ['success' => true]);
        } catch (\Throwable $e) {
            return $this->json($response, 500, ['success' => false, 'error' => 'HEALTH_UNLINK_ERROR']);
        }
    }

    /** GET /api/v1/admin/desa/health/{id}/centers */
    public function getHealthCenters(Request $request, Response $response, array $params): Response
    {
        try {
            $sql = "SELECT c.* FROM study_centers c
                    JOIN health_center hc ON hc.center_id = c.id
                    WHERE hc.facility_id = ? AND c.is_active = 1";
            return $this->json($response, 200, ['success' => true, 'data' => $this->repo->fetchAll($sql, [(int)$params['id']])]);
        } catch (\Throwable $e) {
            return $this->json($response, 500, ['success' => false, 'error' => 'HEALTH_CENTERS_ERROR']);
        }
    }

    /** POST /api/v1/admin/desa/restaurants/{id}/link-center */
    public function linkRestaurantToCenter(Request $request, Response $response, array $params): Response
    {
        try {
            $body = $request->getBodyParams();
            $centerId = (int)($body['center_id'] ?? 0);
            if (!$centerId) {
                return $this->json($response, 400, ['success' => false, 'error' => 'CENTER_ID_REQUIRED']);
            }
            $this->repo->insert('restaurant_center', ['restaurant_id' => (int)$params['id'], 'center_id' => $centerId]);
            return $this->json($response, 201, ['success' => true]);
        } catch (\Throwable $e) {
            return $this->json($response, 500, ['success' => false, 'error' => 'RESTAURANT_LINK_ERROR']);
        }
    }

    /** DELETE /api/v1/admin/desa/restaurants/{id}/centers/{centerId} */
    public function unlinkRestaurantFromCenter(Request $request, Response $response, array $params): Response
    {
        try {
            $this->repo->delete('restaurant_center', 'restaurant_id = ? AND center_id = ?', [(int)$params['id'], (int)$params['centerId']]);
            return $this->json($response, 200, ['success' => true]);
        } catch (\Throwable $e) {
            return $this->json($response, 500, ['success' => false, 'error' => 'RESTAURANT_UNLINK_ERROR']);
        }
    }

    /** GET /api/v1/admin/desa/restaurants/{id}/centers */
    public function getRestaurantCenters(Request $request, Response $response, array $params): Response
    {
        try {
            $sql = "SELECT c.* FROM study_centers c
                    JOIN restaurant_center rc ON rc.center_id = c.id
                    WHERE rc.restaurant_id = ? AND c.is_active = 1";
            return $this->json($response, 200, ['success' => true, 'data' => $this->repo->fetchAll($sql, [(int)$params['id']])]);
        } catch (\Throwable $e) {
            return $this->json($response, 500, ['success' => false, 'error' => 'RESTAURANT_CENTERS_ERROR']);
        }
    }

    // ── Announcements CRUD ───────────────────────────────────────────────

    /** GET /api/v1/admin/desa/announcements */
    public function listAnnouncements(Request $request, Response $response): Response
    {
        try {
            $params = [
                'limit'  => (int) $request->getQuery('limit', 100),
                'offset' => (int) $request->getQuery('offset', 0),
            ];
            $announcements = $this->repo->getAllAnnouncements($params);
            return $this->json($response, 200, ['success' => true, 'data' => $announcements]);
        } catch (\Throwable $e) {
            return $this->json($response, 500, ['success' => false, 'error' => 'ANNOUNCEMENTS_LIST_ERROR']);
        }
    }

    /** POST /api/v1/admin/desa/announcements */
    public function createAnnouncement(Request $request, Response $response): Response
    {
        try {
            $data = $request->getBodyParams();
            $data['slug'] = $data['slug'] ?? $this->makeSlug($data['title']);
            $data['is_active'] = $data['is_active'] ?? 1;
            $data['public'] = $data['public'] ?? 1;
            $data['created_at'] = date('Y-m-d H:i:s');
            $data['updated_at'] = date('Y-m-d H:i:s');
            if (isset($data['published_at']) && empty($data['published_at'])) {
                $data['published_at'] = date('Y-m-d H:i:s');
            }
            $id = $this->repo->insert('announcements', $data);
            return $this->json($response, 201, ['success' => true, 'data' => ['id' => $id]]);
        } catch (\Throwable $e) {
            return $this->json($response, 500, ['success' => false, 'error' => 'ANNOUNCEMENT_CREATE_ERROR']);
        }
    }

    /** PUT /api/v1/admin/desa/announcements/{id} */
    public function updateAnnouncement(Request $request, Response $response, array $params): Response
    {
        try {
            $data = $request->getBodyParams();
            $data['updated_at'] = date('Y-m-d H:i:s');
            $this->repo->update('announcements', $data, 'id = ?', [(int)$params['id']]);
            return $this->json($response, 200, ['success' => true]);
        } catch (\Throwable $e) {
            return $this->json($response, 500, ['success' => false, 'error' => 'ANNOUNCEMENT_UPDATE_ERROR']);
        }
    }

    /** DELETE /api/v1/admin/desa/announcements/{id} */
    public function deleteAnnouncement(Request $request, Response $response, array $params): Response
    {
        try {
            $this->repo->update('announcements', ['is_active' => 0, 'updated_at' => date('Y-m-d H:i:s')], 'id = ?', [(int)$params['id']]);
            return $this->json($response, 200, ['success' => true]);
        } catch (\Throwable $e) {
            return $this->json($response, 500, ['success' => false, 'error' => 'ANNOUNCEMENT_DELETE_ERROR']);
        }
    }

    // ── Events CRUD ──────────────────────────────────────────────────────

    /** GET /api/v1/admin/desa/events */
    public function listEvents(Request $request, Response $response): Response
    {
        try {
            $params = [
                'limit'  => (int) $request->getQuery('limit', 100),
                'offset' => (int) $request->getQuery('offset', 0),
            ];
            $events = $this->repo->getAllEvents($params);
            return $this->json($response, 200, ['success' => true, 'data' => $events]);
        } catch (\Throwable $e) {
            return $this->json($response, 500, ['success' => false, 'error' => 'EVENTS_LIST_ERROR']);
        }
    }

    /** POST /api/v1/admin/desa/events */
    public function createEvent(Request $request, Response $response): Response
    {
        try {
            $data = $request->getBodyParams();
            $data['slug'] = $data['slug'] ?? $this->makeSlug($data['title']);
            $data['is_active'] = $data['is_active'] ?? 1;
            $data['public'] = $data['public'] ?? 1;
            $data['created_at'] = date('Y-m-d H:i:s');
            $data['updated_at'] = date('Y-m-d H:i:s');
            $id = $this->repo->insert('events', $data);
            return $this->json($response, 201, ['success' => true, 'data' => ['id' => $id]]);
        } catch (\Throwable $e) {
            return $this->json($response, 500, ['success' => false, 'error' => 'EVENT_CREATE_ERROR']);
        }
    }

    /** PUT /api/v1/admin/desa/events/{id} */
    public function updateEvent(Request $request, Response $response, array $params): Response
    {
        try {
            $data = $request->getBodyParams();
            $data['updated_at'] = date('Y-m-d H:i:s');
            $this->repo->update('events', $data, 'id = ?', [(int)$params['id']]);
            return $this->json($response, 200, ['success' => true]);
        } catch (\Throwable $e) {
            return $this->json($response, 500, ['success' => false, 'error' => 'EVENT_UPDATE_ERROR']);
        }
    }

    /** DELETE /api/v1/admin/desa/events/{id} */
    public function deleteEvent(Request $request, Response $response, array $params): Response
    {
        try {
            $this->repo->update('events', ['is_active' => 0, 'updated_at' => date('Y-m-d H:i:s')], 'id = ?', [(int)$params['id']]);
            return $this->json($response, 200, ['success' => true]);
        } catch (\Throwable $e) {
            return $this->json($response, 500, ['success' => false, 'error' => 'EVENT_DELETE_ERROR']);
        }
    }

    // ── Hub About ────────────────────────────────────────────────────────

    /** GET /api/v1/admin/desa/hub/about */
    public function adminHubAbout(Request $request, Response $response): Response
    {
        try {
            $about = $this->repo->getHubAbout();
            return $this->json($response, 200, ['success' => true, 'data' => $about ?? []]);
        } catch (\Throwable $e) {
            return $this->json($response, 500, ['success' => false, 'error' => 'HUB_ABOUT_ERROR']);
        }
    }

    /** PUT /api/v1/admin/desa/hub/about */
    public function updateHubAbout(Request $request, Response $response): Response
    {
        try {
            $data = $request->getBodyParams();
            $data['updated_at'] = date('Y-m-d H:i:s');
            $existing = $this->repo->getHubAbout();
            if ($existing) {
                $this->repo->update('hub_about', $data, 'id = ?', [(int)$existing['id']]);
            } else {
                $data['id'] = 1;
                $data['created_at'] = date('Y-m-d H:i:s');
                $this->repo->insert('hub_about', $data);
            }
            return $this->json($response, 200, ['success' => true]);
        } catch (\Throwable $e) {
            return $this->json($response, 500, ['success' => false, 'error' => 'HUB_ABOUT_UPDATE_ERROR']);
        }
    }

    // ── Hub Leadership ───────────────────────────────────────────────────

    /** GET /api/v1/admin/desa/hub/leadership */
    public function adminHubLeadership(Request $request, Response $response): Response
    {
        try {
            $leaders = $this->repo->getAllLeaderships();
            return $this->json($response, 200, ['success' => true, 'data' => $leaders]);
        } catch (\Throwable $e) {
            return $this->json($response, 500, ['success' => false, 'error' => 'HUB_LEADERSHIP_ERROR']);
        }
    }

    /** POST /api/v1/admin/desa/hub/leadership */
    public function createLeadership(Request $request, Response $response): Response
    {
        try {
            $data = $request->getBodyParams();
            $data['is_current'] = $data['is_current'] ?? 0;
            $data['is_active'] = $data['is_active'] ?? 1;
            $data['created_at'] = date('Y-m-d H:i:s');
            $data['updated_at'] = date('Y-m-d H:i:s');
            $id = $this->repo->insert('hub_leaderships', $data);
            return $this->json($response, 201, ['success' => true, 'data' => ['id' => $id]]);
        } catch (\Throwable $e) {
            return $this->json($response, 500, ['success' => false, 'error' => 'LEADERSHIP_CREATE_ERROR']);
        }
    }

    /** PUT /api/v1/admin/desa/hub/leadership/{id} */
    public function updateLeadership(Request $request, Response $response, array $params): Response
    {
        try {
            $data = $request->getBodyParams();
            $data['updated_at'] = date('Y-m-d H:i:s');
            $this->repo->update('hub_leaderships', $data, 'id = ?', [(int)$params['id']]);
            return $this->json($response, 200, ['success' => true]);
        } catch (\Throwable $e) {
            return $this->json($response, 500, ['success' => false, 'error' => 'LEADERSHIP_UPDATE_ERROR']);
        }
    }

    /** DELETE /api/v1/admin/desa/hub/leadership/{id} */
    public function deleteLeadership(Request $request, Response $response, array $params): Response
    {
        try {
            $this->repo->update('hub_leaderships', ['is_active' => 0, 'updated_at' => date('Y-m-d H:i:s')], 'id = ?', [(int)$params['id']]);
            return $this->json($response, 200, ['success' => true]);
        } catch (\Throwable $e) {
            return $this->json($response, 500, ['success' => false, 'error' => 'LEADERSHIP_DELETE_ERROR']);
        }
    }

    // ── Hub Constitution ─────────────────────────────────────────────────

    /** GET /api/v1/admin/desa/hub/constitution */
    public function adminHubConstitution(Request $request, Response $response): Response
    {
        try {
            $constitution = $this->repo->getConstitution();
            return $this->json($response, 200, ['success' => true, 'data' => $constitution ?? []]);
        } catch (\Throwable $e) {
            return $this->json($response, 500, ['success' => false, 'error' => 'HUB_CONSTITUTION_ERROR']);
        }
    }

    /** POST /api/v1/admin/desa/hub/constitution */
    public function createConstitution(Request $request, Response $response): Response
    {
        try {
            $data = $request->getBodyParams();
            $data['is_active'] = 1;
            $data['created_at'] = date('Y-m-d H:i:s');
            $data['updated_at'] = date('Y-m-d H:i:s');
            $id = $this->repo->insert('hub_constitution', $data);

            // Insert articles if provided
            if (!empty($data['articles'])) {
                foreach ($data['articles'] as $i => $article) {
                    $article['constitution_id'] = $id;
                    $article['sort_order'] = $i;
                    $article['is_active'] = 1;
                    $article['created_at'] = date('Y-m-d H:i:s');
                    $article['updated_at'] = date('Y-m-d H:i:s');
                    $this->repo->insert('hub_constitution_articles', $article);
                }
            }
            return $this->json($response, 201, ['success' => true, 'data' => ['id' => $id]]);
        } catch (\Throwable $e) {
            return $this->json($response, 500, ['success' => false, 'error' => 'CONSTITUTION_CREATE_ERROR']);
        }
    }

    // ── Hub Archives ─────────────────────────────────────────────────────

    /** GET /api/v1/admin/desa/hub/archives */
    public function adminHubArchives(Request $request, Response $response): Response
    {
        try {
            $archives = $this->repo->getAllArchives();
            return $this->json($response, 200, ['success' => true, 'data' => $archives]);
        } catch (\Throwable $e) {
            return $this->json($response, 500, ['success' => false, 'error' => 'HUB_ARCHIVES_ERROR']);
        }
    }

    /** POST /api/v1/admin/desa/hub/archives */
    public function createArchive(Request $request, Response $response): Response
    {
        try {
            $data = $request->getBodyParams();
            $data['is_active'] = 1;
            $data['created_at'] = date('Y-m-d H:i:s');
            $data['updated_at'] = date('Y-m-d H:i:s');
            $id = $this->repo->insert('hub_archives', $data);
            return $this->json($response, 201, ['success' => true, 'data' => ['id' => $id]]);
        } catch (\Throwable $e) {
            return $this->json($response, 500, ['success' => false, 'error' => 'ARCHIVE_CREATE_ERROR']);
        }
    }

    /** PUT /api/v1/admin/desa/hub/archives/{id} */
    public function updateArchive(Request $request, Response $response, array $params): Response
    {
        try {
            $data = $request->getBodyParams();
            $data['updated_at'] = date('Y-m-d H:i:s');
            $this->repo->update('hub_archives', $data, 'id = ?', [(int)$params['id']]);
            return $this->json($response, 200, ['success' => true]);
        } catch (\Throwable $e) {
            return $this->json($response, 500, ['success' => false, 'error' => 'ARCHIVE_UPDATE_ERROR']);
        }
    }

    /** DELETE /api/v1/admin/desa/hub/archives/{id} */
    public function deleteArchive(Request $request, Response $response, array $params): Response
    {
        try {
            $this->repo->update('hub_archives', ['is_active' => 0, 'updated_at' => date('Y-m-d H:i:s')], 'id = ?', [(int)$params['id']]);
            return $this->json($response, 200, ['success' => true]);
        } catch (\Throwable $e) {
            return $this->json($response, 500, ['success' => false, 'error' => 'ARCHIVE_DELETE_ERROR']);
        }
    }

    // ── Hub Assets ───────────────────────────────────────────────────────

    /** GET /api/v1/admin/desa/hub/assets */
    public function adminHubAssets(Request $request, Response $response): Response
    {
        try {
            $assets = $this->repo->getAllAssets();
            return $this->json($response, 200, ['success' => true, 'data' => $assets]);
        } catch (\Throwable $e) {
            return $this->json($response, 500, ['success' => false, 'error' => 'HUB_ASSETS_ERROR']);
        }
    }

    /** POST /api/v1/admin/desa/hub/assets */
    public function createAsset(Request $request, Response $response): Response
    {
        try {
            $data = $request->getBodyParams();
            $data['is_active'] = 1;
            $data['created_at'] = date('Y-m-d H:i:s');
            $data['updated_at'] = date('Y-m-d H:i:s');
            $id = $this->repo->insert('hub_assets', $data);
            return $this->json($response, 201, ['success' => true, 'data' => ['id' => $id]]);
        } catch (\Throwable $e) {
            return $this->json($response, 500, ['success' => false, 'error' => 'ASSET_CREATE_ERROR']);
        }
    }

    /** PUT /api/v1/admin/desa/hub/assets/{id} */
    public function updateAsset(Request $request, Response $response, array $params): Response
    {
        try {
            $data = $request->getBodyParams();
            $data['updated_at'] = date('Y-m-d H:i:s');
            $this->repo->update('hub_assets', $data, 'id = ?', [(int)$params['id']]);
            return $this->json($response, 200, ['success' => true]);
        } catch (\Throwable $e) {
            return $this->json($response, 500, ['success' => false, 'error' => 'ASSET_UPDATE_ERROR']);
        }
    }

    /** DELETE /api/v1/admin/desa/hub/assets/{id} */
    public function deleteAsset(Request $request, Response $response, array $params): Response
    {
        try {
            $this->repo->update('hub_assets', ['is_active' => 0, 'updated_at' => date('Y-m-d H:i:s')], 'id = ?', [(int)$params['id']]);
            return $this->json($response, 200, ['success' => true]);
        } catch (\Throwable $e) {
            return $this->json($response, 500, ['success' => false, 'error' => 'ASSET_DELETE_ERROR']);
        }
    }

    // ── Hub Committees ───────────────────────────────────────────────────

    /** GET /api/v1/admin/desa/hub/committees */
    public function adminHubCommittees(Request $request, Response $response): Response
    {
        try {
            $committees = $this->repo->getAllCommittees();
            return $this->json($response, 200, ['success' => true, 'data' => $committees]);
        } catch (\Throwable $e) {
            return $this->json($response, 500, ['success' => false, 'error' => 'HUB_COMMITTEES_ERROR']);
        }
    }

    /** POST /api/v1/admin/desa/hub/committees */
    public function createCommittee(Request $request, Response $response): Response
    {
        try {
            $data = $request->getBodyParams();
            $data['slug'] = $data['slug'] ?? $this->makeSlug($data['name']);
            $data['is_active'] = 1;
            $data['created_at'] = date('Y-m-d H:i:s');
            $data['updated_at'] = date('Y-m-d H:i:s');
            $id = $this->repo->insert('hub_committees', $data);
            return $this->json($response, 201, ['success' => true, 'data' => ['id' => $id]]);
        } catch (\Throwable $e) {
            return $this->json($response, 500, ['success' => false, 'error' => 'COMMITTEE_CREATE_ERROR']);
        }
    }

    /** PUT /api/v1/admin/desa/hub/committees/{id} */
    public function updateCommittee(Request $request, Response $response, array $params): Response
    {
        try {
            $data = $request->getBodyParams();
            $data['updated_at'] = date('Y-m-d H:i:s');
            $this->repo->update('hub_committees', $data, 'id = ?', [(int)$params['id']]);
            return $this->json($response, 200, ['success' => true]);
        } catch (\Throwable $e) {
            return $this->json($response, 500, ['success' => false, 'error' => 'COMMITTEE_UPDATE_ERROR']);
        }
    }

    /** DELETE /api/v1/admin/desa/hub/committees/{id} */
    public function deleteCommittee(Request $request, Response $response, array $params): Response
    {
        try {
            $this->repo->update('hub_committees', ['is_active' => 0, 'updated_at' => date('Y-m-d H:i:s')], 'id = ?', [(int)$params['id']]);
            return $this->json($response, 200, ['success' => true]);
        } catch (\Throwable $e) {
            return $this->json($response, 500, ['success' => false, 'error' => 'COMMITTEE_DELETE_ERROR']);
        }
    }

    // ── Hub Gallery ──────────────────────────────────────────────────────

    /** GET /api/v1/admin/desa/hub/gallery */
    public function adminHubGallery(Request $request, Response $response): Response
    {
        try {
            $images = $this->repo->getGalleryImages();
            return $this->json($response, 200, ['success' => true, 'data' => $images]);
        } catch (\Throwable $e) {
            return $this->json($response, 500, ['success' => false, 'error' => 'HUB_GALLERY_ERROR']);
        }
    }

    /** POST /api/v1/admin/desa/hub/gallery */
    public function createGalleryImage(Request $request, Response $response): Response
    {
        try {
            $data = $request->getBodyParams();
            $data['is_active'] = 1;
            $data['created_at'] = date('Y-m-d H:i:s');
            $data['updated_at'] = date('Y-m-d H:i:s');
            $id = $this->repo->insert('hub_gallery_images', $data);
            return $this->json($response, 201, ['success' => true, 'data' => ['id' => $id]]);
        } catch (\Throwable $e) {
            return $this->json($response, 500, ['success' => false, 'error' => 'GALLERY_CREATE_ERROR']);
        }
    }

    /** PUT /api/v1/admin/desa/hub/gallery/{id} */
    public function updateGalleryImage(Request $request, Response $response, array $params): Response
    {
        try {
            $data = $request->getBodyParams();
            $data['updated_at'] = date('Y-m-d H:i:s');
            $this->repo->update('hub_gallery_images', $data, 'id = ?', [(int)$params['id']]);
            return $this->json($response, 200, ['success' => true]);
        } catch (\Throwable $e) {
            return $this->json($response, 500, ['success' => false, 'error' => 'GALLERY_UPDATE_ERROR']);
        }
    }

    /** DELETE /api/v1/admin/desa/hub/gallery/{id} */
    public function deleteGalleryImage(Request $request, Response $response, array $params): Response
    {
        try {
            $this->repo->update('hub_gallery_images', ['is_active' => 0, 'updated_at' => date('Y-m-d H:i:s')], 'id = ?', [(int)$params['id']]);
            return $this->json($response, 200, ['success' => true]);
        } catch (\Throwable $e) {
            return $this->json($response, 500, ['success' => false, 'error' => 'GALLERY_DELETE_ERROR']);
        }
    }

    // ── Academics CRUD ───────────────────────────────────────────────────

    /** GET /api/v1/admin/desa/academics */
    public function listAcademics(Request $request, Response $response): Response
    {
        try {
            $params = [
                'category' => $request->getQuery('category'),
                'limit'    => (int) $request->getQuery('limit', 100),
                'offset'   => (int) $request->getQuery('offset', 0),
            ];
            $academics = $this->repo->getAllAcademics($params);
            return $this->json($response, 200, ['success' => true, 'data' => $academics]);
        } catch (\Throwable $e) {
            return $this->json($response, 500, ['success' => false, 'error' => 'ACADEMICS_LIST_ERROR']);
        }
    }

    /** POST /api/v1/admin/desa/academics */
    public function createAcademic(Request $request, Response $response): Response
    {
        try {
            $data = $request->getBodyParams();
            $data['slug'] = $data['slug'] ?? $this->makeSlug($data['title']);
            $data['is_active'] = $data['is_active'] ?? 1;
            $data['public'] = $data['public'] ?? 1;
            $data['created_at'] = date('Y-m-d H:i:s');
            $data['updated_at'] = date('Y-m-d H:i:s');
            $id = $this->repo->insert('academics', $data);
            return $this->json($response, 201, ['success' => true, 'data' => ['id' => $id]]);
        } catch (\Throwable $e) {
            return $this->json($response, 500, ['success' => false, 'error' => 'ACADEMIC_CREATE_ERROR']);
        }
    }

    /** PUT /api/v1/admin/desa/academics/{id} */
    public function updateAcademic(Request $request, Response $response, array $params): Response
    {
        try {
            $data = $request->getBodyParams();
            $data['updated_at'] = date('Y-m-d H:i:s');
            $this->repo->update('academics', $data, 'id = ?', [(int)$params['id']]);
            return $this->json($response, 200, ['success' => true]);
        } catch (\Throwable $e) {
            return $this->json($response, 500, ['success' => false, 'error' => 'ACADEMIC_UPDATE_ERROR']);
        }
    }

    /** DELETE /api/v1/admin/desa/academics/{id} */
    public function deleteAcademic(Request $request, Response $response, array $params): Response
    {
        try {
            $this->repo->update('academics', ['is_active' => 0, 'updated_at' => date('Y-m-d H:i:s')], 'id = ?', [(int)$params['id']]);
            return $this->json($response, 200, ['success' => true]);
        } catch (\Throwable $e) {
            return $this->json($response, 500, ['success' => false, 'error' => 'ACADEMIC_DELETE_ERROR']);
        }
    }

    // ── Opportunities CRUD ───────────────────────────────────────────────

    /** GET /api/v1/admin/desa/opportunities */
    public function listOpportunities(Request $request, Response $response): Response
    {
        try {
            $params = [
                'category' => $request->getQuery('category'),
                'limit'    => (int) $request->getQuery('limit', 100),
                'offset'   => (int) $request->getQuery('offset', 0),
            ];
            $opportunities = $this->repo->getAllOpportunities($params);
            return $this->json($response, 200, ['success' => true, 'data' => $opportunities]);
        } catch (\Throwable $e) {
            return $this->json($response, 500, ['success' => false, 'error' => 'OPPORTUNITIES_LIST_ERROR']);
        }
    }

    /** POST /api/v1/admin/desa/opportunities */
    public function createOpportunity(Request $request, Response $response): Response
    {
        try {
            $data = $request->getBodyParams();
            $data['slug'] = $data['slug'] ?? $this->makeSlug($data['title']);
            $data['is_active'] = $data['is_active'] ?? 1;
            $data['public'] = $data['public'] ?? 1;
            $data['created_at'] = date('Y-m-d H:i:s');
            $data['updated_at'] = date('Y-m-d H:i:s');
            $id = $this->repo->insert('opportunities', $data);
            return $this->json($response, 201, ['success' => true, 'data' => ['id' => $id]]);
        } catch (\Throwable $e) {
            return $this->json($response, 500, ['success' => false, 'error' => 'OPPORTUNITY_CREATE_ERROR']);
        }
    }

    /** PUT /api/v1/admin/desa/opportunities/{id} */
    public function updateOpportunity(Request $request, Response $response, array $params): Response
    {
        try {
            $data = $request->getBodyParams();
            $data['updated_at'] = date('Y-m-d H:i:s');
            $this->repo->update('opportunities', $data, 'id = ?', [(int)$params['id']]);
            return $this->json($response, 200, ['success' => true]);
        } catch (\Throwable $e) {
            return $this->json($response, 500, ['success' => false, 'error' => 'OPPORTUNITY_UPDATE_ERROR']);
        }
    }

    /** DELETE /api/v1/admin/desa/opportunities/{id} */
    public function deleteOpportunity(Request $request, Response $response, array $params): Response
    {
        try {
            $this->repo->update('opportunities', ['is_active' => 0, 'updated_at' => date('Y-m-d H:i:s')], 'id = ?', [(int)$params['id']]);
            return $this->json($response, 200, ['success' => true]);
        } catch (\Throwable $e) {
            return $this->json($response, 500, ['success' => false, 'error' => 'OPPORTUNITY_DELETE_ERROR']);
        }
    }
}
