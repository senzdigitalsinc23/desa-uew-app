<?php
declare(strict_types=1);

namespace App\Repositories;

use App\Core\Database;

class DesaRepository
{
    private Database $db;

    public function __construct(Database $db)
    {
        $this->db = $db;
    }

    // ─── REGIONS ─────────────────────────────────────────────────────────

    public function getAllRegions(array $params = []): array
    {
        $sql = "SELECT r.*, COUNT(sc.id) AS center_count
                FROM regions r
                LEFT JOIN study_centers sc ON sc.region_id = r.id AND sc.is_active = 1
                WHERE r.is_active = 1
                GROUP BY r.id
                ORDER BY r.sort_order ASC, r.name ASC";
        $regions = $this->db->fetch($sql);

        // Attach actual centers to each region
        $centersSql = "SELECT sc.*, r.slug AS region_slug, r.short_name AS region_short
                       FROM study_centers sc
                       JOIN regions r ON r.id = sc.region_id
                       WHERE sc.is_active = 1
                       ORDER BY r.sort_order ASC, sc.name ASC";
        $stmt = $this->db->getConnection()->prepare($centersSql);
        $stmt->execute();
        $allCenters = $stmt->fetchAll(\PDO::FETCH_ASSOC);

        $byRegion = [];
        foreach ($allCenters as $c) {
            $byRegion[$c['region_id']][] = $c;
        }
        foreach ($regions as &$region) {
            $region['centers'] = $byRegion[$region['id']] ?? [];
        }
        unset($region);

        // Attach programs to each region (deduplicated)
        $progSql = "SELECT pc.center_id, ap.id, ap.slug, ap.code, ap.title, ap.department,
                            ap.level_start, ap.level_end, ap.mode, ap.public
                    FROM academic_programs ap
                    JOIN program_center pc ON pc.program_id = ap.id
                    JOIN study_centers sc ON sc.id = pc.center_id
                    WHERE ap.is_active = 1 AND ap.public = 1
                    ORDER BY ap.id ASC";
        $stmt2 = $this->db->getConnection()->prepare($progSql);
        $stmt2->execute();
        $allPrograms = $stmt2->fetchAll(\PDO::FETCH_ASSOC);

        $progByRegion = [];
        foreach ($allPrograms as $p) {
            $progByRegion[$p['center_id']][] = $p;
        }
        $centersById = [];
        foreach ($allCenters as $c) {
            $centersById[$c['id']] = $c['region_id'];
        }

        // Build set of center_ids per region for program filtering
        $regionCenterIds = [];
        foreach ($allCenters as $c) {
            $regionCenterIds[$c['region_id']][] = $c['id'];
        }

        foreach ($regions as &$region) {
            $regionPrograms = [];
            $seenProgIds = [];
            foreach ($allPrograms as $p) {
                $inRegion = false;
                foreach (($regionCenterIds[$region['id']] ?? []) as $cid) {
                    if ((int)$p['center_id'] === (int)$cid) {
                        $inRegion = true;
                        break;
                    }
                }
                if ($inRegion && !in_array($p['id'], $seenProgIds)) {
                    $seenProgIds[] = $p['id'];
                    $regionPrograms[] = [
                        'id'         => $p['id'],
                        'slug'       => $p['slug'],
                        'code'       => $p['code'],
                        'title'      => $p['title'],
                        'department' => $p['department'],
                        'level'      => ($p['level_start'] ?? '') . ' - ' . ($p['level_end'] ?? ''),
                        'mode'       => $p['mode'],
                        'public'     => (bool)($p['public'] ?? true),
                    ];
                }
            }
            $region['programs'] = $regionPrograms;
        }
        unset($region);

        // Attach coordinators to each center (separate query, MySQL 5.7 compatible)
        $coordSql = "SELECT cc.center_id, co.id AS coordinator_id, co.first_name, co.last_name,
                             co.full_name, co.title, co.phone, co.email, co.office, co.office_hours,
                             cc.is_primary
                      FROM coordinator_center cc
                      JOIN coordinators co ON co.id = cc.coordinator_id
                      WHERE co.is_active = 1 AND cc.is_active = 1
                      ORDER BY cc.center_id ASC";
        $stmt3 = $this->db->getConnection()->prepare($coordSql);
        $stmt3->execute();
        $allCoords = $stmt3->fetchAll(\PDO::FETCH_ASSOC);
        $byCenter = [];
        foreach ($allCoords as $co) {
            $byCenter[$co['center_id']][] = [
                'id'           => (int)$co['coordinator_id'],
                'first_name'   => $co['first_name'],
                'last_name'    => $co['last_name'],
                'full_name'    => $co['full_name'],
                'title'        => $co['title'],
                'phone'        => $co['phone'],
                'email'        => $co['email'],
                'office'       => $co['office'],
                'office_hours' => $co['office_hours'],
                'is_primary'   => (bool)$co['is_primary'],
            ];
        }
        foreach ($regions as $ri => $region) {
            $regionCoops = [];
            foreach (($region['centers'] ?? []) as $ci => $center) {
                $regionCoops[$ci] = $byCenter[(int)$center['id']] ?? [];
            }
            foreach ($regionCoops as $ci => $coops) {
                $regions[$ri]['centers'][$ci]['coordinators'] = $coops;
            }
        }
        return $regions;
    }

    public function getRegion(string $slug): ?array
    {
        $sql = "SELECT r.*,
                (SELECT JSON_ARRAYAGG(JSON_OBJECT(
                    'id', sc.id, 'slug', sc.slug, 'name', sc.name, 'premises', sc.premises,
                    'city', sc.city, 'landmark', sc.landmark, 'schedule', sc.schedule,
                    'public', sc.public, 'is_active', sc.is_active
                ))
                 FROM study_centers sc WHERE sc.region_id = r.id AND sc.is_active = 1 AND sc.public = 1) AS centers,
                (SELECT JSON_ARRAYAGG(JSON_OBJECT(
                    'id', ap.id, 'slug', ap.slug, 'code', ap.code, 'title', ap.title,
                    'department', ap.department, 'level', CONCAT(ap.level_start, ' - ', ap.level_end),
                    'mode', ap.mode, 'public', ap.public
                ))
                 FROM academic_programs ap
                 JOIN program_center pc ON pc.program_id = ap.id
                 JOIN study_centers sc ON sc.id = pc.center_id
                 WHERE sc.region_id = r.id AND ap.is_active = 1 AND ap.public = 1
                 GROUP BY ap.id) AS programs
                FROM regions r
                WHERE r.slug = :slug AND r.is_active = 1
                LIMIT 1";

        return $this->db->fetchSingle($sql, ['slug' => $slug]);
    }

    // ─── STUDY CENTERS ────────────────────────────────────────────────────

    public function getAllCenters(array $params = []): array
    {
        $regionId = $params['region_id'] ?? null;
        $search = $params['search'] ?? '';
        $limit = (int)($params['limit'] ?? 50);
        $offset = (int)($params['offset'] ?? 0);

        $where = "sc.is_active = 1 AND sc.public = 1";
        $bindings = [];

        if ($regionId) {
            $where .= " AND sc.region_id = :region_id";
            $bindings[':region_id'] = $regionId;
        }

        if ($search) {
            $where .= " AND (MATCH(sc.name, sc.premises, sc.city, sc.landmark, sc.slug) AGAINST (:search IN BOOLEAN MODE)
                         OR sc.name LIKE :search_like
                         OR sc.city LIKE :search_like)";
            $bindings[':search'] = $search;
            $bindings[':search_like'] = "%{$search}%";
        }

        $sql = "SELECT sc.*, r.slug AS region_slug, r.name AS region_name, r.short_name AS region_short, r.capital AS region_capital
                FROM study_centers sc
                JOIN regions r ON r.id = sc.region_id
                WHERE {$where}
                ORDER BY r.sort_order ASC, sc.name ASC
                LIMIT :limit OFFSET :offset";

        $stmt = $this->db->getConnection()->prepare($sql);
        foreach ($bindings as $key => $value) {
            $stmt->bindValue($key, $value);
        }
        $stmt->bindValue(':limit', $limit, \PDO::PARAM_INT);
        $stmt->bindValue(':offset', $offset, \PDO::PARAM_INT);
        $stmt->execute();
        return $stmt->fetchAll(\PDO::FETCH_ASSOC);
    }

    public function getCenter(string $slug): ?array
    {
        $sql = "SELECT sc.*,
                r.slug AS region_slug, r.name AS region_name, r.short_name AS region_short, r.capital AS region_capital,
                (SELECT JSON_ARRAYAGG(JSON_OBJECT(
                    'id', ap.id, 'slug', ap.slug, 'code', ap.code, 'title', ap.title,
                    'department', ap.department, 'level', CONCAT(ap.level_start, ' - ', ap.level_end), 'mode', ap.mode
                ))
                 FROM academic_programs ap
                 JOIN program_center pc ON pc.program_id = ap.id
                 WHERE pc.center_id = sc.id AND ap.is_active = 1 AND ap.public = 1
                 GROUP BY ap.id) AS programs,
                (SELECT JSON_ARRAYAGG(JSON_OBJECT(
                    'id', co.id, 'first_name', co.first_name, 'last_name', co.last_name,
                    'full_name', co.full_name, 'title', co.title, 'phone', co.phone,
                    'email', co.email, 'office', co.office, 'office_hours', co.office_hours,
                    'is_primary', cc.is_primary
                ))
                 FROM coordinators co
                 JOIN coordinator_center cc ON cc.coordinator_id = co.id
                 WHERE cc.center_id = sc.id AND co.is_active = 1 AND cc.is_active = 1
                 GROUP BY co.id) AS coordinators,
                (SELECT JSON_ARRAYAGG(JSON_OBJECT(
                    'id', h.id, 'name', h.name, 'distance', h.distance, 'rate_range', h.rate_range,
                    'phone', h.phone, 'rating', h.rating, 'amenities', h.amenities
                ))
                 FROM nearby_hotels h
                 JOIN hotel_center hc ON hc.hotel_id = h.id
                 WHERE hc.center_id = sc.id AND h.is_active = 1
                 GROUP BY h.id) AS nearby_hotels,
                (SELECT JSON_ARRAYAGG(JSON_OBJECT(
                    'id', hf.id, 'name', hf.name, 'type', hf.type, 'distance', hf.distance,
                    'phone', hf.phone, 'hours', hf.hours, 'is_24_7', hf.is_24_7
                ))
                 FROM nearby_health_facilities hf
                 JOIN health_center hcf ON hcf.facility_id = hf.id
                 WHERE hcf.center_id = sc.id AND hf.is_active = 1
                 GROUP BY hf.id) AS nearby_health,
                (SELECT JSON_ARRAYAGG(JSON_OBJECT(
                    'id', rest.id, 'name', rest.name, 'distance', rest.distance,
                    'specialty', rest.specialty, 'open_hours', rest.open_hours,
                    'cuisine_type', rest.cuisine_type, 'price_range', rest.price_range
                ))
                 FROM nearby_restaurants rest
                 JOIN restaurant_center rc ON rc.restaurant_id = rest.id
                 WHERE rc.center_id = sc.id AND rest.is_active = 1
                 GROUP BY rest.id) AS nearby_restaurants
                FROM study_centers sc
                JOIN regions r ON r.id = sc.region_id
                WHERE sc.slug = :slug AND sc.is_active = 1
                LIMIT 1";

        return $this->db->fetchSingle($sql, ['slug' => $slug]);
    }

    // ─── SEARCH (Unified Directory) ───────────────────────────────────────

    public function searchDirectory(string $query = '', string $category = '', string $regionSlug = '', int $limit = 50, int $offset = 0): array
    {
        $results = [];
        $tokens = array_filter(array_map('trim', explode(' ', strtolower($query))));

        if ($category === 'Study Centers' || empty($category)) {
            $centerResults = $this->searchCenters($tokens, $regionSlug, 20, $offset);
            $results = array_merge($results, $centerResults['items']);
            if (empty($results) && !empty($centerResults['count'])) {
                $results = $centerResults['items'];
            }
        }

        if ($category === 'Announcement Hub' || empty($category)) {
            $annResults = $this->searchAnnouncements($tokens, 15);
            $results = array_merge($results, $annResults);
        }

        if ($category === 'DESA Hub' || empty($category)) {
            $eventResults = $this->searchEvents($tokens, 10);
            $results = array_merge($results, $eventResults);
        }

        if (empty($category) || in_array($category, ['Academic Peer PPT', '24/7 Academic Vault'])) {
            $acadResults = $this->searchAcademics($tokens, 10);
            $results = array_merge($results, $acadResults);
        }

        if (empty($category) || $category === 'DESA Hub') {
            $hubResults = $this->searchHubAbout($tokens);
            $results = array_merge($results, $hubResults);
            $hubLeadership = $this->searchHubLeaderships($tokens);
            $results = array_merge($results, $hubLeadership);
            $hubConstitution = $this->searchHubConstitution($tokens);
            $results = array_merge($results, $hubConstitution);
            $hubCommittees = $this->searchHubCommittees($tokens);
            $results = array_merge($results, $hubCommittees);
            $hubArchives = $this->searchHubArchives($tokens);
            $results = array_merge($results, $hubArchives);
            $hubAssets = $this->searchHubAssets($tokens);
            $results = array_merge($results, $hubAssets);
        }

        if (empty($category) || in_array($category, ['DESA Opportunity Radar', 'Digital Student Opportunity Board', 'Internship Opportunity Network', 'Supervisor Connection Initiative', 'Welfare', 'Alumni'])) {
            $oppResults = $this->searchOpportunities($tokens, 10);
            $results = array_merge($results, $oppResults);
        }

        $total = count($results);
        $results = array_slice($results, $offset, $limit);

        return ['items' => $results, 'total' => $total, 'limit' => $limit, 'offset' => $offset];
    }

    private function searchCenters(array $tokens, string $regionSlug, int $limit, int $offset): array
    {
        $where = "WHERE sc.is_active = 1 AND sc.public = 1";
        $bindings = [];

          if ($regionSlug) {
              $where .= " AND r.slug = :region_slug";
              $bindings[':region_slug'] = $regionSlug;
          }

        if (!empty($tokens)) {
            $matchParts = [];
            $likeParts = [];
            foreach ($tokens as $i => $token) {
                  $matchParts[] = "MATCH(sc.name, sc.premises, sc.city, sc.landmark, sc.slug) AGAINST (:mt{$i} IN BOOLEAN MODE)";
                $bindings[":mt{$i}"] = $token;
                $likeParts[] = "(sc.name LIKE :lkA{$i} OR sc.city LIKE :lkB{$i} OR sc.premises LIKE :lkC{$i} OR r.name LIKE :lkD{$i})";
                $bindings[":lkA{$i}"] = "%{$token}%"; $bindings[":lkB{$i}"] = "%{$token}%"; $bindings[":lkC{$i}"] = "%{$token}%"; $bindings[":lkD{$i}"] = "%{$token}%";
            }
              $where .= " AND (" . implode(' AND ', $matchParts) . " OR " . implode(' OR ', $likeParts) . ")";
        }

        $sql = "SELECT 'center' AS item_type, sc.id, sc.slug, sc.name AS title, sc.premises, sc.city,
                sc.landmark, sc.schedule, sc.region_id, r.slug AS region_slug, r.name AS region_name,
                r.short_name AS region_short, r.capital AS region_capital,
                CONCAT(sc.name, ' ', sc.premises, ' ', sc.city, ' ', r.name) AS searchable_text,
                sc.created_at
                FROM study_centers sc
                JOIN regions r ON r.id = sc.region_id
                {$where}
                ORDER BY sc.name ASC
                LIMIT :limit OFFSET :offset";

        $stmt = $this->db->getConnection()->prepare($sql);
        foreach ($bindings as $key => $value) {
            $stmt->bindValue($key, $value);
        }
        $stmt->bindValue(':limit', $limit, \PDO::PARAM_INT);
        $stmt->bindValue(':offset', $offset, \PDO::PARAM_INT);
        $stmt->execute();
        return ['items' => $stmt->fetchAll(\PDO::FETCH_ASSOC), 'count' => (int)$stmt->rowCount()];
    }

    private function searchAnnouncements(array $tokens, int $limit): array
    {
        $where = "WHERE a.is_active = 1 AND a.public = 1";
        $bindings = [];

        if (!empty($tokens)) {
            $conditions = [];
            foreach ($tokens as $i => $token) {
                $conditions[] = "(MATCH(a.title, a.excerpt, a.body, a.slug) AGAINST (:at{$i} IN BOOLEAN MODE)
                                 OR a.title LIKE :alA{$i} OR a.excerpt LIKE :alB{$i})";
                $bindings[":at{$i}"] = $token;
                $bindings[":alA{$i}"] = "%{$token}%";
                $bindings[":alB{$i}"] = "%{$token}%";
            }
            $where .= " AND (" . implode(' AND ', $conditions) . ")";
        }

        $sql = "SELECT 'announcement' AS item_type, a.id, a.slug, a.title, a.excerpt, a.body,
                a.type, a.thumbnail, a.published_at, 'Announcement Hub' AS category,
                CONCAT(a.title, ' ', a.excerpt) AS searchable_text
                FROM announcements a {$where}
                ORDER BY a.published_at DESC
                LIMIT {$limit}";

        $stmt = $this->db->getConnection()->prepare($sql);
        foreach ($bindings as $key => $value) {
            $stmt->bindValue($key, $value);
        }
        $stmt->execute();
        return $stmt->fetchAll(\PDO::FETCH_ASSOC);
    }

    private function searchEvents(array $tokens, int $limit): array
    {
        $where = "WHERE e.is_active = 1 AND e.public = 1";
        $bindings = [];

        if (!empty($tokens)) {
            $conditions = [];
            foreach ($tokens as $i => $token) {
                $conditions[] = "(MATCH(e.title, e.excerpt, e.body, e.venue, e.slug) AGAINST (:et{$i} IN BOOLEAN MODE)
                                 OR e.title LIKE :elA{$i} OR e.venue LIKE :elB{$i})";
                $bindings[":et{$i}"] = $token;
                $bindings[":elA{$i}"] = "%{$token}%";
                $bindings[":elB{$i}"] = "%{$token}%";
            }
            $where .= " AND (" . implode(' AND ', $conditions) . ")";
        }

        $sql = "SELECT 'event' AS item_type, e.id, e.slug, e.title, e.excerpt, e.body,
                e.type, e.start_date, e.venue, e.location, e.thumbnail, 'DESA Hub' AS category,
                CONCAT(e.title, ' ', e.venue) AS searchable_text
                FROM events e {$where}
                ORDER BY e.start_date DESC
                LIMIT {$limit}";

        $stmt = $this->db->getConnection()->prepare($sql);
        foreach ($bindings as $key => $value) {
            $stmt->bindValue($key, $value);
        }
        $stmt->execute();
        return $stmt->fetchAll(\PDO::FETCH_ASSOC);
    }

    private function searchAcademics(array $tokens, int $limit): array
    {
        $where = "WHERE ac.is_active = 1 AND ac.public = 1";
        $bindings = [];

        if (!empty($tokens)) {
            $conditions = [];
            foreach ($tokens as $i => $token) {
                $conditions[] = "(MATCH(ac.title, ac.description, ac.course_code, ac.course_title, ac.tags, ac.slug) AGAINST (:ac{$i} IN BOOLEAN MODE)
                                 OR ac.title LIKE :acl{$i})";
                $bindings[":ac{$i}"] = $token;
                $bindings[":acl{$i}"] = "%{$token}%";
            }
            $where .= " AND (" . implode(' AND ', $conditions) . ")";
        }

        $sql = "SELECT 'academic' AS item_type, ac.id, ac.slug, ac.title, ac.category,
                ac.course_code, ac.course_title, ac.level, ac.description,
                ac.file_type, ac.file_size, ac.author, ac.academic_year,
                ac.tags, 'Academic Peer PPT' AS category_label,
                CONCAT(ac.title, ' ', ac.course_code, ' ', ac.description) AS searchable_text
                FROM academics ac {$where}
                ORDER BY ac.created_at DESC
                LIMIT {$limit}";

        $stmt = $this->db->getConnection()->prepare($sql);
        foreach ($bindings as $key => $value) {
            $stmt->bindValue($key, $value);
        }
        $stmt->execute();
        return $stmt->fetchAll(\PDO::FETCH_ASSOC);
    }

    private function searchOpportunities(array $tokens, int $limit): array
    {
        $where = "WHERE o.is_active = 1 AND o.public = 1";
        $bindings = [];

        if (!empty($tokens)) {
            $conditions = [];
            foreach ($tokens as $i => $token) {
                $conditions[] = "(MATCH(o.title, o.description, o.organization, o.slug) AGAINST (:op{$i} IN BOOLEAN MODE)
                                 OR o.title LIKE :opl{$i})";
                $bindings[":op{$i}"] = $token;
                $bindings[":opl{$i}"] = "%{$token}%";
            }
            $where .= " AND (" . implode(' AND ', $conditions) . ")";
        }

        $sql = "SELECT 'opportunity' AS item_type, o.id, o.slug, o.title, o.category,
                o.organization, o.location, o.stipend, o.deadline, o.description,
                o.application_link, 'DESA Opportunity Radar' AS category_label,
                CONCAT(o.title, ' ', o.organization, ' ', o.description) AS searchable_text
                FROM opportunities o {$where}
                ORDER BY o.featured DESC, o.created_at DESC
                LIMIT {$limit}";

        $stmt = $this->db->getConnection()->prepare($sql);
        foreach ($bindings as $key => $value) {
            $stmt->bindValue($key, $value);
        }
        $stmt->execute();
        return $stmt->fetchAll(\PDO::FETCH_ASSOC);
    }

    // ─── HUB SEARCH METHODS ──────────────────────────────────────────────

    private function searchHubAbout(array $tokens): array
    {
        $where = "WHERE ha.is_active = 1";
        $bindings = [];

        if (!empty($tokens)) {
            $likeConditions = [];
            foreach ($tokens as $i => $token) {
                $likeConditions[] = "(ha.title LIKE :hla{$i} OR ha.content LIKE :hlb{$i} OR ha.mission LIKE :hlc{$i} OR ha.vision LIKE :hld{$i} OR ha.subtitle LIKE :hle{$i})";
                $bindings[":hla{$i}"] = "%{$token}%";
                $bindings[":hlb{$i}"] = "%{$token}%";
                $bindings[":hlc{$i}"] = "%{$token}%";
                $bindings[":hld{$i}"] = "%{$token}%";
                $bindings[":hle{$i}"] = "%{$token}%";
            }
            $where .= " AND (" . implode(' AND ', $likeConditions) . ")";
        }

        $sql = "SELECT 'hub_about' AS item_type, ha.id, ha.title, ha.subtitle, ha.content, ha.mission, ha.vision,
                'DESA Hub' AS category,
                CONCAT(ha.title, ' ', ha.content, ' ', ha.mission, ' ', ha.vision) AS searchable_text
                FROM hub_about ha {$where}
                LIMIT 5";

        $stmt = $this->db->getConnection()->prepare($sql);
        foreach ($bindings as $key => $value) {
            $stmt->bindValue($key, $value);
        }
        $stmt->execute();
        return $stmt->fetchAll(\PDO::FETCH_ASSOC);
    }

    private function searchHubLeaderships(array $tokens): array
    {
        $where = "WHERE hl.is_active = 1";
        $bindings = [];

        if (!empty($tokens)) {
            $conditions = [];
            foreach ($tokens as $i => $token) {
                $conditions[] = "(hl.role LIKE :hrl{$i} OR hl.name LIKE :hrn{$i})";
                $bindings[":hrl{$i}"] = "%{$token}%";
                $bindings[":hrn{$i}"] = "%{$token}%";
            }
            $where .= " AND (" . implode(' AND ', $conditions) . ")";
        }

        $sql = "SELECT 'hub_leader' AS item_type, hl.id, hl.name AS title, hl.role, hl.term_start, hl.term_end,
                'DESA Hub' AS category,
                CONCAT(hl.role, ' ', hl.name) AS searchable_text
                FROM hub_leaderships hl {$where}
                LIMIT 10";

        $stmt = $this->db->getConnection()->prepare($sql);
        foreach ($bindings as $key => $value) {
            $stmt->bindValue($key, $value);
        }
        $stmt->execute();
        return $stmt->fetchAll(\PDO::FETCH_ASSOC);
    }

    private function searchHubConstitution(array $tokens): array
    {
        $where = "WHERE hc.is_active = 1";
        $bindings = [];

        if (!empty($tokens)) {
            $likeConditions = [];
            foreach ($tokens as $i => $token) {
                $likeConditions[] = "(hca.title LIKE :hcta{$i} OR hca.content LIKE :hctb{$i} OR hc.preamble LIKE :hctc{$i})";
                $bindings[":hcta{$i}"] = "%{$token}%";
                $bindings[":hctb{$i}"] = "%{$token}%";
                $bindings[":hctc{$i}"] = "%{$token}%";
            }
            $where .= " AND (" . implode(' AND ', $likeConditions) . ")";
        }

        $sql = "SELECT 'hub_constitution' AS item_type, hca.id, hca.title, hca.article_number, hca.content,
                'DESA Hub' AS category,
                CONCAT(hca.article_number, ' ', hca.title, ' ', hca.content) AS searchable_text
                FROM hub_constitution_articles hca
                JOIN hub_constitution hc ON hc.id = hca.constitution_id
                {$where}
                LIMIT 10";

        $stmt = $this->db->getConnection()->prepare($sql);
        foreach ($bindings as $key => $value) {
            $stmt->bindValue($key, $value);
        }
        $stmt->execute();
        return $stmt->fetchAll(\PDO::FETCH_ASSOC);
    }

    private function searchHubCommittees(array $tokens): array
    {
        $where = "WHERE hcom.is_active = 1";
        $bindings = [];

        if (!empty($tokens)) {
            $likeConditions = [];
            foreach ($tokens as $i => $token) {
                $likeConditions[] = "(hcom.name LIKE :hcma{$i} OR hcom.description LIKE :hcmk{$i})";
                $bindings[":hcma{$i}"] = "%{$token}%";
                $bindings[":hcmk{$i}"] = "%{$token}%";
            }
            $where .= " AND (" . implode(' AND ', $likeConditions) . ")";
        }

        $sql = "SELECT 'hub_committee' AS item_type, hcom.id, hcom.name AS title, hcom.description,
                'DESA Hub' AS category,
                CONCAT(hcom.name, ' ', hcom.description) AS searchable_text
                FROM hub_committees hcom {$where}
                LIMIT 10";

        $stmt = $this->db->getConnection()->prepare($sql);
        foreach ($bindings as $key => $value) {
            $stmt->bindValue($key, $value);
        }
        $stmt->execute();
        return $stmt->fetchAll(\PDO::FETCH_ASSOC);
    }

    private function searchHubArchives(array $tokens): array
    {
        $where = "WHERE ha.is_active = 1";
        $bindings = [];

        if (!empty($tokens)) {
            $likeConditions = [];
            foreach ($tokens as $i => $token) {
                $likeConditions[] = "(ha.title LIKE :haal{$i} OR ha.description LIKE :haad{$i})";
                $bindings[":haal{$i}"] = "%{$token}%";
                $bindings[":haad{$i}"] = "%{$token}%";
            }
            $where .= " AND (" . implode(' AND ', $likeConditions) . ")";
        }

        $sql = "SELECT 'hub_archive' AS item_type, ha.id, ha.title, ha.description, ha.year,
                'DESA Hub' AS category,
                CONCAT(ha.title, ' ', ha.description) AS searchable_text
                FROM hub_archives ha {$where}
                LIMIT 10";

        $stmt = $this->db->getConnection()->prepare($sql);
        foreach ($bindings as $key => $value) {
            $stmt->bindValue($key, $value);
        }
        $stmt->execute();
        return $stmt->fetchAll(\PDO::FETCH_ASSOC);
    }

    private function searchHubAssets(array $tokens): array
    {
        $where = "WHERE ha.is_active = 1";
        $bindings = [];

        if (!empty($tokens)) {
            $likeConditions = [];
            foreach ($tokens as $i => $token) {
                $likeConditions[] = "(ha.item_name LIKE :hasl{$i} OR ha.description LIKE :hasm{$i})";
                $bindings[":hasl{$i}"] = "%{$token}%";
                $bindings[":hasm{$i}"] = "%{$token}%";
            }
            $where .= " AND (" . implode(' AND ', $likeConditions) . ")";
        }

        $sql = "SELECT 'hub_asset' AS item_type, ha.id, ha.item_name AS title, ha.description,
                'DESA Hub' AS category,
                CONCAT(ha.item_name, ' ', ha.description) AS searchable_text
                FROM hub_assets ha {$where}
                LIMIT 10";

        $stmt = $this->db->getConnection()->prepare($sql);
        foreach ($bindings as $key => $value) {
            $stmt->bindValue($key, $value);
        }
        $stmt->execute();
        return $stmt->fetchAll(\PDO::FETCH_ASSOC);
    }

    // ─── HUB DATA ─────────────────────────────────────────────────────────

    public function getHubAbout(): ?array
    {
        $sql = "SELECT * FROM hub_about WHERE is_active = 1 LIMIT 1";
        return $this->db->fetchSingle($sql);
    }

    public function getAllLeaderships(): array
    {
        $sql = "SELECT * FROM hub_leaderships WHERE is_active = 1 ORDER BY sort_order ASC, is_current DESC";
        return $this->db->fetch($sql);
    }

    public function getConstitution(): ?array
    {
        $sql = "SELECT * FROM hub_constitution WHERE is_active = 1 LIMIT 1";
        $hc = $this->db->fetchSingle($sql);
        if ($hc === null) {
            return null;
        }
        $articlesSql = "SELECT id, article_number, title, content, sort_order
                        FROM hub_constitution_articles
                        WHERE constitution_id = :cid AND is_active = 1
                        ORDER BY sort_order ASC";
        $stmt = $this->db->getConnection()->prepare($articlesSql);
        $stmt->execute([':cid' => $hc['id']]);
        $hc['articles'] = $stmt->fetchAll(\PDO::FETCH_ASSOC);
        return $hc;
    }

    public function getAllArchives(): array
    {
        $sql = "SELECT * FROM hub_archives WHERE is_active = 1 ORDER BY year DESC, created_at DESC";
        return $this->db->fetch($sql);
    }

    public function getAllAssets(): array
    {
        $sql = "SELECT * FROM hub_assets WHERE is_active = 1 ORDER BY id ASC";
        return $this->db->fetch($sql);
    }

    public function getAllCommittees(): array
    {
        $sql = "SELECT * FROM hub_committees WHERE is_active = 1 ORDER BY sort_order ASC";
        return $this->db->fetch($sql);
    }

    public function getGalleryImages(): array
    {
        $sql = "SELECT * FROM hub_gallery_images WHERE is_active = 1 ORDER BY sort_order ASC, is_featured DESC";
        return $this->db->fetch($sql);
    }

    // ─── PROGRAMS ─────────────────────────────────────────────────────────

    public function getAllPrograms(array $params = []): array
    {
        $where = "WHERE ap.is_active = 1 AND ap.public = 1";
        $bindings = [];

        if (!empty($params['department'])) {
            $where .= " AND ap.department LIKE :dept";
            $bindings[':dept'] = "%{$params['department']}%";
        }

        if (!empty($params['search'])) {
            $where .= " AND (MATCH(ap.title, ap.department, ap.code, ap.slug) AGAINST (:search IN BOOLEAN MODE)
                          OR ap.title LIKE :search_like)";
            $bindings[':search'] = $params['search'];
            $bindings[':search_like'] = "%{$params['search']}%";
        }

        $sql = "SELECT ap.* FROM academic_programs ap {$where}
                ORDER BY ap.department ASC, ap.title ASC";
        $stmt = $this->db->getConnection()->prepare($sql);
        foreach ($bindings as $key => $value) {
            $stmt->bindValue($key, $value);
        }
        $stmt->execute();
        $programs = $stmt->fetchAll(\PDO::FETCH_ASSOC);

        // Attach available centers per program (avoids MySQL 5.7 JSON_ARRAYAGG issues)
        $centersSql = "SELECT pc.program_id, sc.id AS center_id, sc.name AS center_name, sc.city AS center_city, r.name AS region_name
                       FROM program_center pc
                       JOIN study_centers sc ON sc.id = pc.center_id
                       JOIN regions r ON r.id = sc.region_id
                       WHERE sc.is_active = 1
                       ORDER BY pc.program_id ASC";
        $stmt2 = $this->db->getConnection()->prepare($centersSql);
        $stmt2->execute();
        $allCenters = $stmt2->fetchAll(\PDO::FETCH_ASSOC);

        $byProgram = [];
        foreach ($allCenters as $c) {
            $byProgram[$c['program_id']][] = [
                'id'     => $c['center_id'],
                'name'   => $c['center_name'],
                'city'   => $c['center_city'],
                'region' => $c['region_name'],
            ];
        }
        foreach ($programs as &$p) {
            $p['available_centers'] = $byProgram[$p['id']] ?? [];
        }
        unset($p);

        return $programs;
    }

    // ─── ANNOUNCEMENTS ────────────────────────────────────────────────────

    public function getAllAnnouncements(array $params = []): array
    {
        $limit = (int)($params['limit'] ?? 20);
        $offset = (int)($params['offset'] ?? 0);
        $type = $params['type'] ?? '';

        $where = "WHERE a.is_active = 1 AND a.public = 1";
        $bindings = [];

        if ($type) {
            $where .= " AND a.type = :type";
            $bindings[':type'] = $type;
        }

        $sql = "SELECT * FROM announcements a {$where}
                ORDER BY a.published_at DESC
                LIMIT :limit OFFSET :offset";

        $stmt = $this->db->getConnection()->prepare($sql);
        foreach ($bindings as $key => $value) {
            $stmt->bindValue($key, $value);
        }
        $stmt->bindValue(':limit', $limit, \PDO::PARAM_INT);
        $stmt->bindValue(':offset', $offset, \PDO::PARAM_INT);
        $stmt->execute();
        return $stmt->fetchAll(\PDO::FETCH_ASSOC);
    }

    // ─── EVENTS ───────────────────────────────────────────────────────────

    public function getAllEvents(array $params = []): array
    {
        $limit = (int)($params['limit'] ?? 20);
        $offset = (int)($params['offset'] ?? 0);
        $type = $params['type'] ?? '';

        $where = "WHERE e.is_active = 1 AND e.public = 1";
        $bindings = [];

        if ($type) {
            $where .= " AND e.type = :type";
            $bindings[':type'] = $type;
        }

        $sql = "SELECT * FROM events e {$where}
                ORDER BY e.start_date DESC
                LIMIT :limit OFFSET :offset";

        $stmt = $this->db->getConnection()->prepare($sql);
        foreach ($bindings as $key => $value) {
            $stmt->bindValue($key, $value);
        }
        $stmt->bindValue(':limit', $limit, \PDO::PARAM_INT);
        $stmt->bindValue(':offset', $offset, \PDO::PARAM_INT);
        $stmt->execute();
        return $stmt->fetchAll(\PDO::FETCH_ASSOC);
    }

    // ─── ACADEMICS ────────────────────────────────────────────────────────

    public function getAllAcademics(array $params = []): array
    {
        $category = $params['category'] ?? '';
        $limit = (int)($params['limit'] ?? 50);
        $offset = (int)($params['offset'] ?? 0);

        $where = "WHERE ac.is_active = 1 AND ac.public = 1";
        $bindings = [];

        if ($category) {
            $where .= " AND ac.category = :category";
            $bindings[':category'] = $category;
        }

        $sql = "SELECT ac.* FROM academics ac {$where}
                ORDER BY ac.created_at DESC
                LIMIT :limit OFFSET :offset";

        $stmt = $this->db->getConnection()->prepare($sql);
        foreach ($bindings as $key => $value) {
            $stmt->bindValue($key, $value);
        }
        $stmt->bindValue(':limit', $limit, \PDO::PARAM_INT);
        $stmt->bindValue(':offset', $offset, \PDO::PARAM_INT);
        $stmt->execute();
        return $stmt->fetchAll(\PDO::FETCH_ASSOC);
    }

    // ─── OPPORTUNITIES ────────────────────────────────────────────────────

    public function getAllOpportunities(array $params = []): array
    {
        $category = $params['category'] ?? '';
        $limit = (int)($params['limit'] ?? 50);
        $offset = (int)($params['offset'] ?? 0);

        $where = "WHERE o.is_active = 1 AND o.public = 1";
        $bindings = [];

        if ($category) {
            $where .= " AND o.category = :category";
            $bindings[':category'] = $category;
        }

        $sql = "SELECT o.* FROM opportunities o {$where}
                ORDER BY o.featured DESC, o.created_at DESC
                LIMIT :limit OFFSET :offset";

        $stmt = $this->db->getConnection()->prepare($sql);
        foreach ($bindings as $key => $value) {
            $stmt->bindValue($key, $value);
        }
        $stmt->bindValue(':limit', $limit, \PDO::PARAM_INT);
        $stmt->bindValue(':offset', $offset, \PDO::PARAM_INT);
        $stmt->execute();
        return $stmt->fetchAll(\PDO::FETCH_ASSOC);
    }

    // ─── STATS ────────────────────────────────────────────────────────────

    public function getDashboardStats(): array
    {
        $stats = [];

        $r = $this->db->fetchSingle("SELECT COUNT(*) AS cnt FROM regions WHERE is_active = 1");
        $stats['regions'] = (int)($r['cnt'] ?? 0);

        $r = $this->db->fetchSingle("SELECT COUNT(*) AS cnt FROM study_centers WHERE is_active = 1 AND public = 1");
        $stats['centers'] = (int)($r['cnt'] ?? 0);

        $r = $this->db->fetchSingle("SELECT COUNT(*) AS cnt FROM academic_programs WHERE is_active = 1 AND public = 1");
        $stats['programs'] = (int)($r['cnt'] ?? 0);

        $r = $this->db->fetchSingle("SELECT COUNT(*) AS cnt FROM desa_members WHERE status = 'active'");
        $stats['members'] = (int)($r['cnt'] ?? 0);

        $r = $this->db->fetchSingle("SELECT COUNT(*) AS cnt FROM announcements WHERE is_active = 1 AND public = 1");
        $stats['announcements'] = (int)($r['cnt'] ?? 0);

        $r = $this->db->fetchSingle("SELECT COUNT(*) AS cnt FROM events WHERE is_active = 1 AND public = 1");
        $stats['events'] = (int)($r['cnt'] ?? 0);

        $r = $this->db->fetchSingle("SELECT COUNT(*) AS cnt FROM academics WHERE is_active = 1 AND public = 1");
        $stats['academics'] = (int)($r['cnt'] ?? 0);

        $r = $this->db->fetchSingle("SELECT COUNT(*) AS cnt FROM opportunities WHERE is_active = 1 AND public = 1");
        $stats['opportunities'] = (int)($r['cnt'] ?? 0);

        return $stats;
    }

    // ─── CRUD HELPERS (Admin) ────────────────────────────────────────────

    public function insert(string $table, array $data): int
    {
        return $this->db->insert($table, $data);
    }

    public function update(string $table, array $data, string $where, array $params = []): int
    {
        return $this->db->update($table, $data, $where, $params);
    }

    public function delete(string $table, string $where, array $params = []): int
    {
        return $this->db->delete($table, $where, $params);
    }

    public function fetchAll(string $sql, array $params = []): array
    {
        return $this->db->fetch($sql, $params);
    }

    public function fetchSingle(string $sql, array $params = []): ?array
    {
        return $this->db->fetchSingle($sql, $params);
    }
}



