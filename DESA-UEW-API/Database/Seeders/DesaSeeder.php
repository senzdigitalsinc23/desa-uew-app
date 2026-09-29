<?php
declare(strict_types=1);

namespace Database\Seeders;

use Database\Seeder;

class DesaSeeder extends Seeder
{
    public function run(): void
    {
        echo "Seeding DESA database...\n";

        $this->seedRegions();
        $this->seedPrograms();
        $this->seedStudyCenters();
        $this->seedProgramCenters();
        $this->seedCoordinators();
        $this->seedNearbyHotels();
        $this->seedNearbyHealth();
        $this->seedNearbyRestaurants();
        $this->seedHubData();
        $this->seedAnnouncements();
        $this->seedEvents();
        $this->seedAcademics();
        $this->seedOpportunities();

        echo "DESA database seeding completed.\n";
    }

    private function seedRegions(): void
    {
        $regions = [
            ['slug' => 'greater-accra', 'name' => 'Greater Accra Region', 'short_name' => 'Greater Accra', 'code' => 'GAR', 'capital' => 'Accra', 'description' => 'Greater Accra regional study centers serving distance learners across the capital and metropolitan districts.', 'sort_order' => 1],
            ['slug' => 'ashanti', 'name' => 'Ashanti Region', 'short_name' => 'Ashanti', 'code' => 'ASH', 'capital' => 'Kumasi', 'description' => 'Ashanti regional study centers offering comprehensive weekend tutorials across Kumasi and surrounding municipalities.', 'sort_order' => 2],
            ['slug' => 'central', 'name' => 'Central Region', 'short_name' => 'Central', 'code' => 'CR', 'capital' => 'Cape Coast / Winneba', 'description' => 'Central regional study centers including Winneba Main Campus Hub and Cape Coast historical colleges.', 'sort_order' => 3],
            ['slug' => 'eastern', 'name' => 'Eastern Region', 'short_name' => 'Eastern', 'code' => 'ER', 'capital' => 'Koforidua', 'description' => 'Eastern regional study centers located in Koforidua, Oda, and surrounding municipal educational institutions.', 'sort_order' => 4],
            ['slug' => 'western', 'name' => 'Western Region', 'short_name' => 'Western', 'code' => 'WR', 'capital' => 'Sekondi-Takoradi', 'description' => 'Oil City study centers in Takoradi and Sekondi servicing coastal and industrial educational professionals.', 'sort_order' => 5],
            ['slug' => 'western-north', 'name' => 'Western North Region', 'short_name' => 'Western North', 'code' => 'WNR', 'capital' => 'Sefwi Wiawso', 'description' => 'Servicing educators across the cocoa-rich timber municipal zones in Sefwi Wiawso and Bibiani.', 'sort_order' => 6],
            ['slug' => 'volta', 'name' => 'Volta Region', 'short_name' => 'Volta', 'code' => 'VR', 'capital' => 'Ho', 'description' => 'Volta regional hub based at Mawuli School in Ho, offering academic programs to students across southern Volta.', 'sort_order' => 7],
            ['slug' => 'oti', 'name' => 'Oti Region', 'short_name' => 'Oti', 'code' => 'OR', 'capital' => 'Dambai', 'description' => 'Centrally positioned at Dambai College of Education, reaching teachers across northern and island districts.', 'sort_order' => 8],
            ['slug' => 'bono', 'name' => 'Bono Region', 'short_name' => 'Bono', 'code' => 'BR', 'capital' => 'Sunyani', 'description' => 'Sunyani educational centers serving Sunyani Municipal, Berekum, and Dormaa districts.', 'sort_order' => 9],
            ['slug' => 'bono-east', 'name' => 'Bono East Region', 'short_name' => 'Bono East', 'code' => 'BE', 'capital' => 'Techiman', 'description' => 'Techiman and Kintampo regional study centers for distance learning educators.', 'sort_order' => 10],
            ['slug' => 'ashanti-east', 'name' => 'Ahafo Region', 'short_name' => 'Ahafo', 'code' => 'AF', 'capital' => 'Goaso', 'description' => 'Goaso regional study centers for the Ahafo administrative area.', 'sort_order' => 11],
            ['slug' => 'upper-east', 'name' => 'Upper East Region', 'short_name' => 'Upper East', 'code' => 'UE', 'capital' => 'Bolgatanga', 'description' => 'Bolgatanga and Paga regional study centers serving the northern district.', 'sort_order' => 12],
            ['slug' => 'upper-west', 'name' => 'Upper West Region', 'short_name' => 'Upper West', 'code' => 'UW', 'capital' => 'Wa', 'description' => 'Wa regional study centers for the far northern educational districts.', 'sort_order' => 13],
            ['slug' => 'northern', 'name' => 'Northern Region', 'short_name' => 'Northern', 'code' => 'NR', 'capital' => 'Tamale', 'description' => 'Tamale regional study centers serving the largest northern district.', 'sort_order' => 14],
            ['slug' => 'savelugu-nanton', 'name' => 'Savannah Region', 'short_name' => 'Savannah', 'code' => 'SR', 'capital' => 'Damongo', 'description' => 'Damongo and Bolgatanga satellite centers for the Savannah administrative region.', 'sort_order' => 15],
        ];

        foreach ($regions as $region) {
            $existing = $this->db->fetchSingle("SELECT id FROM regions WHERE slug = :slug", ['slug' => $region['slug']]);
            if ($existing) {
                $this->db->update('regions', array_merge($region, ['updated_at' => date('Y-m-d H:i:s')]), 'slug = ?', [$region['slug']]);
            } else {
                $region['created_at'] = date('Y-m-d H:i:s');
                $region['updated_at'] = date('Y-m-d H:i:s');
                $region['is_active'] = 1;
                $this->db->insert('regions', $region);
            }
        }
        echo "  Regions seeded.\n";
    }

    private function seedPrograms(): void
    {
        $programs = [
            ['slug' => 'bed-basic', 'code' => 'BEd-Basic', 'title' => 'B.Ed Basic Education (Upper Primary & JHS)', 'department' => 'Department of Basic Education', 'faculty' => 'Faculty of Education', 'level_start' => 100, 'level_end' => 400, 'duration_years' => 4, 'mode' => 'weekend', 'is_active' => 1, 'public' => 1],
            ['slug' => 'bed-early', 'code' => 'BEd-ECE', 'title' => 'B.Ed Early Childhood Education', 'department' => 'Department of Early Childhood Education', 'faculty' => 'Faculty of Education', 'level_start' => 100, 'level_end' => 400, 'duration_years' => 4, 'mode' => 'weekend', 'is_active' => 1, 'public' => 1],
            ['slug' => 'bsc-math-ed', 'code' => 'BSc-MathEd', 'title' => 'B.Sc Mathematics Education', 'department' => 'Department of Mathematics Education', 'faculty' => 'Faculty of Science Education', 'level_start' => 100, 'level_end' => 400, 'duration_years' => 4, 'mode' => 'weekend', 'is_active' => 1, 'public' => 1],
            ['slug' => 'post-dip-ed-admin', 'code' => 'PDip-Admin', 'title' => 'Post-Diploma B.Ed Educational Administration', 'department' => 'Department of Educational Leadership', 'faculty' => 'Faculty of Educational Studies', 'level_start' => 300, 'level_end' => 400, 'duration_years' => 2, 'mode' => 'weekend', 'is_active' => 1, 'public' => 1],
            ['slug' => 'dip-edu', 'code' => 'DipEdu', 'title' => 'Diploma in Education', 'department' => 'Faculty of Educational Studies', 'faculty' => 'Faculty of Educational Studies', 'level_start' => 100, 'level_end' => 200, 'duration_years' => 2, 'mode' => 'weekend', 'is_active' => 1, 'public' => 1],
            ['slug' => 'bsc-info-tech-ed', 'code' => 'BSc-InfoTechEd', 'title' => 'B.Sc Information Technology Education', 'department' => 'Department of ICT Education', 'faculty' => 'Faculty of Science Education', 'level_start' => 100, 'level_end' => 400, 'duration_years' => 4, 'mode' => 'weekend', 'is_active' => 1, 'public' => 1],
            ['slug' => 'bsc-agric-ed', 'code' => 'BSc-AgriEd', 'title' => 'B.Sc Agricultural Science Education', 'department' => 'Department of Agricultural Education', 'faculty' => 'Faculty of Science Education', 'level_start' => 100, 'level_end' => 400, 'duration_years' => 4, 'mode' => 'weekend', 'is_active' => 1, 'public' => 1],
            ['slug' => 'pgde', 'code' => 'PGDE', 'title' => 'Postgraduate Diploma in Education (PGDE)', 'department' => 'Graduate School', 'faculty' => 'Graduate School', 'level_start' => 500, 'level_end' => 500, 'duration_years' => 1, 'mode' => 'evening', 'is_active' => 1, 'public' => 1],
        ];

        foreach ($programs as $prog) {
            $existing = $this->db->fetchSingle("SELECT id FROM academic_programs WHERE slug = :slug", ['slug' => $prog['slug']]);
            if ($existing) {
                $this->db->update('academic_programs', array_merge($prog, ['updated_at' => date('Y-m-d H:i:s')]), 'slug = ?', [$prog['slug']]);
            } else {
                $prog['created_at'] = date('Y-m-d H:i:s');
                $prog['updated_at'] = date('Y-m-d H:i:s');
                $this->db->insert('academic_programs', $prog);
            }
        }
        echo "  Programs seeded.\n";
    }

    private function seedStudyCenters(): void
    {
        $centersData = [
            [
                'region_slug' => 'greater-accra',
                'centers' => [
                    ['id' => 'gar-accra-coe', 'name' => 'Accra College of Education Study Center', 'premises' => 'Accra College of Education Campus, East Legon', 'city' => 'East Legon, Accra', 'landmark' => 'Near UPSA and Trinity Theological Seminary', 'schedule' => 'Saturdays & Sundays (7:30 AM - 4:30 PM)'],
                    ['id' => 'gar-st-thomas', 'name' => 'St. Thomas Aquinas SHS Study Center', 'premises' => 'St. Thomas Aquinas Senior High School, Cantonments', 'city' => 'Cantonments, Accra', 'landmark' => 'Opposite Civil Service Training School', 'schedule' => 'Saturdays & Sundays (8:00 AM - 5:00 PM)'],
                    ['id' => 'gar-odorgonno', 'name' => 'Odorgonno SHS Study Center', 'premises' => 'Odorgonno Senior High School Campus, Awoshie', 'city' => 'Awoshie, Accra', 'landmark' => 'Near Awoshie Baah Yard Junction', 'schedule' => 'Saturdays & Sundays (8:00 AM - 4:30 PM)'],
                ]
            ],
            [
                'region_slug' => 'ashanti',
                'centers' => [
                    ['id' => 'ash-kugiss', 'name' => 'Kumasi Girls SHS Study Center', 'premises' => 'Kumasi Girls Senior High School, Abrepo', 'city' => 'Abrepo, Kumasi', 'landmark' => 'Near Abrepo Junction and County Hospital', 'schedule' => 'Saturdays & Sundays (8:00 AM - 4:30 PM)'],
                    ['id' => 'ash-wesley', 'name' => 'Wesley College of Education Study Center', 'premises' => 'Wesley College Campus, Tafo-Kumasi', 'city' => 'Tafo, Kumasi', 'landmark' => 'Directly Opposite Tafo Pankrono Government Hospital', 'schedule' => 'Saturdays & Sundays (8:00 AM - 5:00 PM)'],
                    ['id' => 'ash-offinso', 'name' => 'Offinso College of Education Study Center', 'premises' => 'Offinso College of Education Campus, Offinso', 'city' => 'Offinso', 'landmark' => 'Along Kumasi-Techiman Highway', 'schedule' => 'Saturdays & Sundays (8:00 AM - 4:00 PM)'],
                ]
            ],
            [
                'region_slug' => 'central',
                'centers' => [
                    ['id' => 'cr-ola', 'name' => 'OLA College of Education Study Center', 'premises' => 'OLA College Campus, Cape Coast', 'city' => 'Cape Coast', 'landmark' => 'Near UCC Old Site & Ola Seaside', 'schedule' => 'Saturdays & Sundays (8:00 AM - 4:30 PM)'],
                    ['id' => 'cr-winneba-north', 'name' => 'Winneba North Campus Distance Hub', 'premises' => 'UEW North Campus, Winneba', 'city' => 'Winneba', 'landmark' => 'Opposite Faculty of Educational Studies Complex', 'schedule' => 'Saturdays & Sundays (8:00 AM - 5:00 PM)'],
                ]
            ],
            [
                'region_slug' => 'eastern',
                'centers' => [
                    ['id' => 'er-koforidua-sec', 'name' => 'Koforidua Senior High Technical Study Center', 'premises' => 'Koforidua SECTECH Campus, Koforidua', 'city' => 'Koforidua', 'landmark' => 'Near Koforidua Sports Stadium', 'schedule' => 'Saturdays & Sundays (8:00 AM - 4:30 PM)'],
                    ['id' => 'er-sda-asokore', 'name' => 'S.D.A. College of Education Study Center', 'premises' => 'SDA College of Education Campus, Asokore-Koforidua', 'city' => 'Asokore, Koforidua', 'landmark' => 'Asokore Roundabout', 'schedule' => 'Sundays Only (7:30 AM - 5:30 PM)'],
                ]
            ],
            [
                'region_slug' => 'western',
                'centers' => [
                    ['id' => 'wr-takoradi-poly', 'name' => 'Takoradi Study Center (TTU Campus)', 'premises' => 'Takoradi Technical University Campus, Takoradi', 'city' => 'Takoradi', 'landmark' => 'Near Effia-Nkwanta Roundabout', 'schedule' => 'Saturdays & Sundays (8:00 AM - 4:30 PM)'],
                ]
            ],
            [
                'region_slug' => 'western-north',
                'centers' => [
                    ['id' => 'wnr-wiawso-coe', 'name' => 'Wiawso College of Education Study Center', 'premises' => 'Wiawso College of Education Campus, Sefwi Wiawso', 'city' => 'Sefwi Wiawso', 'landmark' => 'Near Forestry Commission District Office', 'schedule' => 'Saturdays & Sundays (8:00 AM - 4:00 PM)'],
                ]
            ],
            [
                'region_slug' => 'volta',
                'centers' => [
                    ['id' => 'vr-mawuli-ho', 'name' => 'Mawuli Senior High School Study Center', 'premises' => 'Mawuli School Campus, Ho', 'city' => 'Ho', 'landmark' => 'Near Ho Teaching Hospital Road', 'schedule' => 'Saturdays & Sundays (8:00 AM - 4:30 PM)'],
                ]
            ],
            [
                'region_slug' => 'oti',
                'centers' => [
                    ['id' => 'or-dambai-coe', 'name' => 'Dambai College of Education Study Center', 'premises' => 'Dambai College Campus, Dambai', 'city' => 'Dambai', 'landmark' => 'Near Lake Volta Lakeside Crossing', 'schedule' => 'Saturdays & Sundays (8:00 AM - 4:00 PM)'],
                ]
            ],
            [
                'region_slug' => 'bono',
                'centers' => [
                    ['id' => 'br-sunyani-shs', 'name' => 'Sunyani Senior High School Study Center', 'premises' => 'Sunyani SHS (SUSEC) Campus, Sunyani', 'city' => 'Sunyani', 'landmark' => 'Near Sunyani Coronation Park', 'schedule' => 'Saturdays & Sundays (8:00 AM - 4:30 PM)'],
                ]
            ],
        ];

        $now = date('Y-m-d H:i:s');
        foreach ($centersData as $regionData) {
            $region = $this->db->fetchSingle("SELECT id FROM regions WHERE slug = :slug", ['slug' => $regionData['region_slug']]);
            if (!$region) continue;

            foreach ($regionData['centers'] as $center) {
                $existing = $this->db->fetchSingle("SELECT id FROM study_centers WHERE slug = :slug", ['slug' => $center['id']]);
                if ($existing) continue;

                $this->db->insert('study_centers', [
                    'region_id' => $region['id'],
                    'slug' => $center['id'],
                    'name' => $center['name'],
                    'premises' => $center['premises'],
                    'city' => $center['city'],
                    'landmark' => $center['landmark'],
                    'schedule' => $center['schedule'],
                    'is_active' => 1,
                    'public' => 1,
                    'created_at' => $now,
                    'updated_at' => $now,
                ]);
            }
        }
        echo "  Study centers seeded.\n";
    }

    private function seedProgramCenters(): void
    {
        $now = date('Y-m-d H:i:s');
        // Mapping: center_slug => [program_slugs]
        $mapping = [
            'gar-accra-coe'   => ['bed-basic', 'bed-early', 'bsc-math-ed'],
            'gar-st-thomas'   => ['bed-basic', 'bsc-math-ed'],
            'gar-odorgonno'   => ['bed-basic', 'bed-early'],
            'ash-kugiss'      => ['bed-basic', 'bed-early'],
            'ash-wesley'      => ['bed-basic', 'bsc-math-ed'],
            'ash-offinso'     => ['bed-basic', 'dip-edu'],
            'cr-ola'          => ['bed-basic', 'bed-early'],
            'cr-winneba-north' => ['bed-basic', 'bed-early', 'bsc-math-ed', 'pgde'],
            'er-koforidua-sec' => ['bed-basic', 'dip-edu'],
            'er-sda-asokore'  => ['bed-early'],
            'wr-takoradi-poly' => ['bed-basic'],
            'wnr-wiawso-coe'  => ['bed-basic', 'dip-edu'],
            'vr-mawuli-ho'    => ['bed-basic'],
            'or-dambai-coe'   => ['bed-basic', 'bed-early'],
            'br-sunyani-shs'  => ['bed-basic'],
        ];

        foreach ($mapping as $centerSlug => $progSlugs) {
            $center = $this->db->fetchSingle("SELECT id FROM study_centers WHERE slug = :slug", ['slug' => $centerSlug]);
            if (!$center) continue;
            foreach ($progSlugs as $progSlug) {
                $prog = $this->db->fetchSingle("SELECT id FROM academic_programs WHERE slug = :slug", ['slug' => $progSlug]);
                if (!$prog) continue;
                $exists = $this->db->fetchSingle("SELECT id FROM program_center WHERE program_id = :pid AND center_id = :cid", [
                    'pid' => $prog['id'], 'cid' => $center['id'],
                ]);
                if (!$exists) {
                    $this->db->insert('program_center', [
                        'program_id' => $prog['id'],
                        'center_id'  => $center['id'],
                        'is_active'  => 1,
                        'created_at' => $now,
                        'updated_at' => $now,
                    ]);
                }
            }
        }
        echo "  Program-center links seeded.\n";
    }

    private function seedCoordinators(): void
    {
        $coordinators = [
            ['first_name' => 'Emmanuel', 'last_name' => 'Kusi Ofori', 'full_name' => 'Emmanuel Kusi Ofori', 'title' => 'Study Center Coordinator', 'phone' => '+233 24 412 3456', 'email' => 'accra.center@uew.edu.gh', 'office' => 'Administration Complex, Room 14 (Ground Floor)', 'office_hours' => 'Fridays 2:00 PM - 6:00 PM | Saturdays 8:00 AM - 4:00 PM'],
            ['first_name' => 'Beatrice', 'last_name' => 'Mensah-Armah', 'full_name' => 'Beatrice Mensah-Armah', 'title' => 'Study Center Coordinator', 'phone' => '+233 24 987 6543', 'email' => 'cantonments.center@uew.edu.gh', 'office' => 'Science Block, 1st Floor Staff Lounge', 'office_hours' => 'Saturdays 7:30 AM - 4:30 PM | Sundays 12:00 PM - 4:00 PM'],
            ['first_name' => 'Daniel', 'last_name' => 'Addo-Kufuor', 'full_name' => 'Daniel Addo-Kufuor', 'title' => 'Study Center Coordinator', 'phone' => '+233 20 444 8899', 'email' => 'awoshie.center@uew.edu.gh', 'office' => 'Assembly Hall Complex, Office 3', 'office_hours' => 'Saturdays 8:00 AM - 5:00 PM'],
            ['first_name' => 'Kwadwo', 'last_name' => 'Poku-Bonsu', 'full_name' => 'Kwadwo Poku-Bonsu', 'title' => 'Study Center Coordinator', 'phone' => '+233 24 332 1100', 'email' => 'kumasi.kugiss@uew.edu.gh', 'office' => 'Academic Block A, Ground Floor', 'office_hours' => 'Saturdays 8:00 AM - 4:30 PM | Sundays 12:30 PM - 4:30 PM'],
            ['first_name' => 'Francisca', 'last_name' => 'Frimpong', 'full_name' => 'Francisca Frimpong', 'title' => 'Study Center Coordinator', 'phone' => '+233 24 551 8822', 'email' => 'tafo.wesley@uew.edu.gh', 'office' => 'Methodist Chapel Annex Office 2', 'office_hours' => 'Saturdays 8:00 AM - 5:00 PM'],
            ['first_name' => 'Isaac', 'last_name' => 'Boakye-Yiadom', 'full_name' => 'Isaac Boakye-Yiadom', 'title' => 'Study Center Coordinator', 'phone' => '+233 24 778 9911', 'email' => 'offinso.center@uew.edu.gh', 'office' => 'Tutor Staff Room, Block C', 'office_hours' => 'Saturdays 8:00 AM - 4:00 PM'],
            ['first_name' => 'Theresa', 'last_name' => 'Mensah-Amoah', 'full_name' => 'Theresa Mensah-Amoah', 'title' => 'Study Center Coordinator', 'phone' => '+233 24 220 3344', 'email' => 'capecoast.ola@uew.edu.gh', 'office' => 'Catholic Secretariat Wing, Room 4', 'office_hours' => 'Saturdays 8:00 AM - 4:30 PM'],
            ['first_name' => 'Joshua', 'last_name' => 'Nana Arthur', 'full_name' => 'Joshua Nana Arthur', 'title' => 'Lead Coordinator - Distance Directorate', 'phone' => '+233 33 232 2012', 'email' => 'winneba.hub@uew.edu.gh', 'office' => 'CODeL Building, 2nd Floor, Room 208', 'office_hours' => 'Monday - Friday 8:00 AM - 5:00 PM | Saturdays 8:00 AM - 2:00 PM'],
            ['first_name' => 'Collins', 'last_name' => 'Agyei-Twum', 'full_name' => 'Collins Agyei-Twum', 'title' => 'Study Center Coordinator', 'phone' => '+233 24 667 8890', 'email' => 'koforidua.center@uew.edu.gh', 'office' => 'Technical Block 2, Office 1', 'office_hours' => 'Saturdays 8:00 AM - 4:30 PM'],
            ['first_name' => 'Seth', 'last_name' => 'Anim-Boateng', 'full_name' => 'Seth Anim-Boateng', 'title' => 'Study Center Coordinator', 'phone' => '+233 20 889 9900', 'email' => 'asokore.center@uew.edu.gh', 'office' => 'Chapel Annex Room 3', 'office_hours' => 'Sundays 7:30 AM - 5:30 PM'],
            ['first_name' => 'Anthony', 'last_name' => 'Kobina Mensah', 'full_name' => 'Anthony Kobina Mensah', 'title' => 'Study Center Coordinator', 'phone' => '+233 24 311 0099', 'email' => 'takoradi.center@uew.edu.gh', 'office' => 'Distance Learning Secretariat, Room 102', 'office_hours' => 'Saturdays 8:00 AM - 4:30 PM'],
            ['first_name' => 'Francis', 'last_name' => 'Kwame Bioh', 'full_name' => 'Francis Kwame Bioh', 'title' => 'Study Center Coordinator', 'phone' => '+233 24 887 6655', 'email' => 'wiawso.center@uew.edu.gh', 'office' => 'Administration Block, Office 4', 'office_hours' => 'Saturdays 8:00 AM - 4:00 PM'],
            ['first_name' => 'Senyo', 'last_name' => 'Gbordzoe', 'full_name' => 'Senyo Gbordzoe', 'title' => 'Study Center Coordinator', 'phone' => '+233 24 776 5400', 'email' => 'ho.center@uew.edu.gh', 'office' => 'Library Block, 1st Floor Room 7', 'office_hours' => 'Saturdays 8:00 AM - 4:30 PM'],
            ['first_name' => 'Gershon', 'last_name' => 'Agbemafle', 'full_name' => 'Gershon Agbemafle', 'title' => 'Study Center Coordinator', 'phone' => '+233 24 112 9988', 'email' => 'dambai.center@uew.edu.gh', 'office' => 'Main Admin Building, Room 2', 'office_hours' => 'Saturdays 8:00 AM - 4:00 PM'],
            ['first_name' => 'Joseph', 'last_name' => 'Kweku Badu', 'full_name' => 'Joseph Kweku Badu', 'title' => 'Study Center Coordinator', 'phone' => '+233 24 331 4455', 'email' => 'sunyani.center@uew.edu.gh', 'office' => 'Staff Room Annex B, 1st Floor', 'office_hours' => 'Saturdays 8:00 AM - 4:30 PM'],
        ];

        $now = date('Y-m-d H:i:s');
        foreach ($coordinators as $coord) {
            $existing = $this->db->fetchSingle("SELECT id FROM coordinators WHERE email = :email", ['email' => $coord['email']]);
            if ($existing) continue;
            $coord['is_active'] = 1;
            $coord['created_at'] = $now;
            $coord['updated_at'] = $now;
            $this->db->insert('coordinators', $coord);
        }
        echo "  Coordinators seeded.\n";
    }

    private function seedNearbyHotels(): void
    {
        $hotels = [
            ['name' => 'Academic Heights Guest Lodge', 'distance' => '600m from campus', 'rate_range' => 'GH₵ 180 - 260 / night', 'phone' => '+233 20 555 1234', 'rating' => 4.6],
            ['name' => 'East Legon Executive Suites', 'distance' => '1.2km from campus', 'rate_range' => 'GH₵ 350 - 500 / night', 'phone' => '+233 24 888 7766', 'rating' => 4.8],
            ['name' => 'Trinity Hostels & Guest House', 'distance' => '400m from campus', 'rate_range' => 'GH₵ 120 - 180 / night', 'phone' => '+233 50 123 4567', 'rating' => 4.2],
            ['name' => 'Cantonments City View Lodge', 'distance' => '900m', 'rate_range' => 'GH₵ 220 - 320 / night', 'phone' => '+233 27 776 5432', 'rating' => 4.5],
            ['name' => 'Osu Oxford Inn', 'distance' => '1.8km', 'rate_range' => 'GH₵ 280 - 400 / night', 'phone' => '+233 24 333 2211', 'rating' => 4.4],
            ['name' => 'Awoshie Royal Guest House', 'distance' => '700m', 'rate_range' => 'GH₵ 140 - 200 / night', 'phone' => '+233 24 555 4433', 'rating' => 4.1],
            ['name' => 'Abrepo Royal Palace Hotel', 'distance' => '800m', 'rate_range' => 'GH₵ 160 - 240 / night', 'phone' => '+233 24 771 2233', 'rating' => 4.5],
            ['name' => 'Bantama View Lodge', 'distance' => '1.7km', 'rate_range' => 'GH₵ 190 - 280 / night', 'phone' => '+233 20 882 3344', 'rating' => 4.4],
            ['name' => 'Pankrono Forest Lodge', 'distance' => '1.1km', 'rate_range' => 'GH₵ 150 - 210 / night', 'phone' => '+233 24 119 9887', 'rating' => 4.3],
            ['name' => 'Wesleyan Guest Haven', 'distance' => '300m', 'rate_range' => 'GH₵ 130 - 180 / night', 'phone' => '+233 20 443 3221', 'rating' => 4.2],
            ['name' => 'Cape Coast Coastal Haven', 'distance' => '750m', 'rate_range' => 'GH₵ 160 - 230 / night', 'phone' => '+233 24 456 7890', 'rating' => 4.6],
            ['name' => 'Windy Bay Executive Lodge', 'distance' => '1.0km', 'rate_range' => 'GH₵ 200 - 300 / night', 'phone' => '+233 24 556 6778', 'rating' => 4.7],
            ['name' => 'Sir Charles Beach Resort', 'distance' => '2.5km', 'rate_range' => 'GH₵ 350 - 550 / night', 'phone' => '+233 20 112 2334', 'rating' => 4.8],
            ['name' => 'Eastern Premier Hotel', 'distance' => '1.4km', 'rate_range' => 'GH₵ 250 - 380 / night', 'phone' => '+233 34 202 1100', 'rating' => 4.6],
            ['name' => 'Planters Coconut Grove Lodge', 'distance' => '1.5km', 'rate_range' => 'GH₵ 220 - 340 / night', 'phone' => '+233 31 202 2011', 'rating' => 4.6],
            ['name' => 'Volta Serene Hotel', 'distance' => '2.4km', 'rate_range' => 'GH₵ 400 - 650 / night', 'phone' => '+233 36 202 8900', 'rating' => 4.8],
            ['name' => 'Eusbett Hotel Sunyani', 'distance' => '2.2km', 'rate_range' => 'GH₵ 320 - 480 / night', 'phone' => '+233 35 202 7300', 'rating' => 4.7],
        ];

        $now = date('Y-m-d H:i:s');
        foreach ($hotels as $hotel) {
            $existing = $this->db->fetchSingle("SELECT id FROM nearby_hotels WHERE slug = :slug", ['slug' => preg_replace('/[^a-zA-Z0-9]/', '-', strtolower($hotel['name']))]);
            if ($existing) continue;
            $hotel['slug'] = preg_replace('/[^a-zA-Z0-9]/', '-', strtolower($hotel['name']));
            $hotel['is_active'] = 1;
            $hotel['created_at'] = $now;
            $hotel['updated_at'] = $now;
            $this->db->insert('nearby_hotels', $hotel);
        }
        echo "  Hotels seeded.\n";
    }

    private function seedNearbyHealth(): void
    {
        $facilities = [
            ['name' => 'University of Ghana Hospital (Legon)', 'type' => '24/7 Emergency & General Hospital', 'distance' => '2.2km', 'phone' => '+233 30 250 1111', 'is_24_7' => 1],
            ['name' => 'East Legon Medical Centre', 'type' => 'Specialist Clinic & Pharmacy', 'distance' => '900m', 'phone' => '+233 30 254 9900'],
            ['name' => 'Police Hospital (Cantonments)', 'type' => 'Full Service Hospital / Emergency', 'distance' => '1.4km', 'phone' => '+233 30 277 3900', 'is_24_7' => 1],
            ['name' => 'County Hospital (Abrepo)', 'type' => 'General Hospital & Emergency', 'distance' => '600m', 'phone' => '+233 32 204 1122', 'is_24_7' => 1],
            ['name' => 'Komfo Anokye Teaching Hospital (KATH)', 'type' => 'National Tertiary Referral Hospital', 'distance' => '3.5km', 'phone' => '+233 32 202 2301', 'is_24_7' => 1],
            ['name' => 'Tafo Pankrono Government Hospital', 'type' => 'District Public Hospital', 'distance' => '350m', 'phone' => '+233 32 207 0011'],
            ['name' => 'Cape Coast Teaching Hospital (CCTH)', 'type' => 'Regional Teaching Hospital', 'distance' => '3.1km', 'phone' => '+233 33 213 4010', 'is_24_7' => 1],
            ['name' => 'UEW University Hospital', 'type' => 'Full University Health Facility', 'distance' => 'On Campus', 'phone' => '+233 33 232 2030'],
            ['name' => 'Winneba Municipal Hospital', 'type' => 'Government Referral Hospital', 'distance' => '1.8km', 'phone' => '+233 33 232 2211'],
            ['name' => 'Eastern Regional Hospital (Koforidua)', 'type' => 'Regional Referral Hospital', 'distance' => '2.0km', 'phone' => '+233 34 202 2341', 'is_24_7' => 1],
            ['name' => 'S.D.A. Hospital Asokore', 'type' => 'Full Hospital & Maternity', 'distance' => '500m', 'phone' => '+233 34 202 3344'],
            ['name' => 'Effia Nkwanta Regional Hospital', 'type' => 'Regional Government Hospital', 'distance' => '1.2km', 'phone' => '+233 31 202 2451', 'is_24_7' => 1],
            ['name' => 'Ho Teaching Hospital', 'type' => 'Regional Teaching Hospital', 'distance' => '1.5km', 'phone' => '+233 36 202 6620', 'is_24_7' => 1],
            ['name' => 'Sunyani Municipal Hospital', 'type' => 'Municipal Government Hospital', 'distance' => '1.1km', 'phone' => '+233 35 202 7111'],
        ];

        $now = date('Y-m-d H:i:s');
        foreach ($facilities as $f) {
            $existing = $this->db->fetchSingle("SELECT id FROM nearby_health_facilities WHERE slug = :slug", ['slug' => preg_replace('/[^a-zA-Z0-9]/', '-', strtolower($f['name']))]);
            if ($existing) continue;
            $f['slug'] = preg_replace('/[^a-zA-Z0-9]/', '-', strtolower($f['name']));
            $f['is_active'] = 1;
            $f['created_at'] = $now;
            $f['updated_at'] = $now;
            $this->db->insert('nearby_health_facilities', $f);
        }
        echo "  Health facilities seeded.\n";
    }

    private function seedNearbyRestaurants(): void
    {
        $restaurants = [
            ['name' => 'AcCE Campus Canteen', 'distance' => 'On Campus', 'specialty' => 'Waakye, Jollof, Banku with Tilapia', 'open_hours' => '7:00 AM - 5:30 PM'],
            ['name' => 'Starbites Restaurant Legon', 'distance' => '1.1km', 'specialty' => 'Continental & Local Meals, Fresh Juices', 'open_hours' => '8:00 AM - 10:00 PM'],
            ['name' => 'Aquinas Teachers\' Cafeteria', 'distance' => 'On Campus', 'specialty' => 'Hot Hausa Koko, Red Red (Gob3), Fufu', 'open_hours' => '7:30 AM - 4:00 PM'],
            ['name' => 'Papaye Fast Foods (Osu)', 'distance' => '1.6km', 'specialty' => 'Fried Rice, Broasted Chicken, Chips', 'open_hours' => '9:00 AM - 11:00 PM'],
            ['name' => 'Baah Yard Food Haven', 'distance' => '500m', 'specialty' => 'Jollof Rice, Kenkey with Fried Fish & Pepper', 'open_hours' => '8:00 AM - 8:00 PM'],
            ['name' => 'OLA Sisters Canteen', 'distance' => 'On Campus', 'specialty' => 'Cape Coast Fante Kenkey with Fresh Fish & Shito', 'open_hours' => '7:00 AM - 5:00 PM'],
            ['name' => 'CODeL Pavilion Restaurant', 'distance' => 'On Campus', 'specialty' => 'Buffet, Jollof, Fante Kenkey, Roasted Chicken', 'open_hours' => '7:00 AM - 7:00 PM'],
            ['name' => 'Mawuli Dining Pavilion', 'distance' => 'On Campus', 'specialty' => 'Ewe Akple with Fetridetsi (Okro soup) & Fresh Fish', 'open_hours' => '8:00 AM - 5:30 PM'],
            ['name' => 'SUSEC Campus Eatery', 'distance' => 'On Campus', 'specialty' => 'Waakye, Fufu with Light Soup, Jollof', 'open_hours' => '7:30 AM - 5:00 PM'],
            ['name' => 'Eastern View Chop Bar', 'distance' => '1.2km', 'specialty' => 'Pastries, Jollof, Fufu, Spring Rolls', 'open_hours' => '7:00 AM - 9:30 PM'],
        ];

        $now = date('Y-m-d H:i:s');
        foreach ($restaurants as $r) {
            $existing = $this->db->fetchSingle("SELECT id FROM nearby_restaurants WHERE slug = :slug", ['slug' => preg_replace('/[^a-zA-Z0-9]/', '-', strtolower($r['name']))]);
            if ($existing) continue;
            $r['slug'] = preg_replace('/[^a-zA-Z0-9]/', '-', strtolower($r['name']));
            $r['is_active'] = 1;
            $r['created_at'] = $now;
            $r['updated_at'] = $now;
            $this->db->insert('nearby_restaurants', $r);
        }
        echo "  Restaurants seeded.\n";
    }

    private function seedHubData(): void
    {
        $now = date('Y-m-d H:i:s');

        // Hub About
        $aboutExisting = $this->db->fetchSingle("SELECT id FROM hub_about");
        if (!$aboutExisting) {
            $this->db->insert('hub_about', [
                'id' => 1,
                'title' => 'About DESA',
                'subtitle' => 'Distance Learning Students Association — UEW',
                'content' => 'The Distance Learning Students Association (DESA) is the official representative body for all students enrolled in the University of Education, Winneba\'s Centre for Distance e-Learning (CoDeL) programme.\n\nEstablished to champion the academic, welfare, and social interests of distance learners across all regions of Ghana, DESA serves as the vital bridge between the university\'s distance education directorate and its student population.\n\nOur mission is to ensure that every distance learning student receives the support, resources, and representation they deserve — regardless of their geographic location or study schedule.',
                'mission' => 'To advocate for the academic, welfare, and social interests of all distance learning students at UEW.',
                'vision' => 'A fully inclusive distance education community where every student thrives academically and socially.',
                'is_active' => 1,
                'created_at' => $now,
                'updated_at' => $now,
            ]);
        }

        // Hub Leadership
        $leadershipExists = $this->db->fetchSingle("SELECT id FROM hub_leaderships WHERE role = 'National President'");
        if (!$leadershipExists) {
            $leaders = [
                ['role' => 'National President', 'name' => 'H.E. Francis Antwi Bosiako', 'term_start' => 2023, 'term_end' => 2025, 'is_current' => 1, 'sort_order' => 1],
                ['role' => 'Vice President', 'name' => '', 'term_start' => 2023, 'term_end' => 2025, 'is_current' => 0, 'sort_order' => 2],
                ['role' => 'Secretary General', 'name' => '', 'term_start' => 2023, 'term_end' => 2025, 'is_current' => 0, 'sort_order' => 3],
                ['role' => 'Welfare Officer', 'name' => '', 'term_start' => 2023, 'term_end' => 2025, 'is_current' => 0, 'sort_order' => 4],
                ['role' => 'Publicity Secretary', 'name' => '', 'term_start' => 2023, 'term_end' => 2025, 'is_current' => 0, 'sort_order' => 5],
                ['role' => 'Treasurer', 'name' => '', 'term_start' => 2023, 'term_end' => 2025, 'is_current' => 0, 'sort_order' => 6],
            ];
            foreach ($leaders as $l) {
                $l['is_active'] = 1;
                $l['created_at'] = $now;
                $l['updated_at'] = $now;
                $this->db->insert('hub_leaderships', $l);
            }
        }

        // Hub Constitution
        $constExisting = $this->db->fetchSingle("SELECT id FROM hub_constitution");
        if (!$constExisting) {
            $this->db->insert('hub_constitution', [
                'id' => 1,
                'title' => 'DESA Constitution',
                'preamble' => 'We, the members of the Distance Learning Students Association (DESA) of the University of Education, Winneba, in order to promote unity, advocate for student welfare, and ensure effective representation of distance learners, do hereby ordain and establish this Constitution.',
                'version' => '1.0',
                'is_active' => 1,
                'created_at' => $now,
                'updated_at' => $now,
            ]);

            $articles = [
                ['constitution_id' => 1, 'article_number' => 'Article 1', 'title' => 'Name & Status', 'content' => 'Association name, legal status, and recognition.', 'sort_order' => 1],
                ['constitution_id' => 1, 'article_number' => 'Article 2', 'title' => 'Membership', 'content' => 'Eligibility, rights, and obligations of members.', 'sort_order' => 2],
                ['constitution_id' => 1, 'article_number' => 'Article 3', 'title' => 'Officers & Duties', 'content' => 'Executive positions, terms, and responsibilities.', 'sort_order' => 3],
                ['constitution_id' => 1, 'article_number' => 'Article 4', 'title' => 'Meetings & Elections', 'content' => 'AGM procedures, election timelines, and quorum.', 'sort_order' => 4],
                ['constitution_id' => 1, 'article_number' => 'Article 5', 'title' => 'Finance', 'content' => 'Funding sources, financial oversight, and audits.', 'sort_order' => 5],
                ['constitution_id' => 1, 'article_number' => 'Article 6', 'title' => 'Amendments', 'content' => 'Process for constitutional changes and revisions.', 'sort_order' => 6],
            ];
            foreach ($articles as $a) {
                $a['is_active'] = 1;
                $a['created_at'] = $now;
                $a['updated_at'] = $now;
                $this->db->insert('hub_constitution_articles', $a);
            }
        }

        // Hub Committees
        $committees = [
            ['name' => 'Welfare Committee', 'slug' => 'welfare-committee', 'description' => 'Student welfare, disputes, and support services.', 'member_count' => 5, 'sort_order' => 1],
            ['name' => 'Academic Affairs', 'slug' => 'academic-affairs', 'description' => 'Tutorial coordination, exam support, and academic advocacy.', 'member_count' => 4, 'sort_order' => 2],
            ['name' => 'Publicity & Media', 'slug' => 'publicity-media', 'description' => 'Communications, social media, and public relations.', 'member_count' => 4, 'sort_order' => 3],
            ['name' => 'Finance & Grants', 'slug' => 'finance-grants', 'description' => 'Budget oversight, fund allocation, and financial reporting.', 'member_count' => 3, 'sort_order' => 4],
            ['name' => 'Events & Logistics', 'slug' => 'events-logistics', 'description' => 'Event planning, venue coordination, and logistics.', 'member_count' => 5, 'sort_order' => 5],
            ['name' => 'Legal & Constitutional', 'slug' => 'legal-constitutional', 'description' => 'Constitutional compliance, policy review, and legal matters.', 'member_count' => 3, 'sort_order' => 6],
        ];
        foreach ($committees as $c) {
            $existing = $this->db->fetchSingle("SELECT id FROM hub_committees WHERE slug = :slug", ['slug' => $c['slug']]);
            if ($existing) continue;
            $c['is_active'] = 1;
            $c['created_at'] = $now;
            $c['updated_at'] = $now;
            $this->db->insert('hub_committees', $c);
        }

        // Hub Assets
        $assets = [
            ['item_name' => 'Laptops', 'description' => 'Dell Latitude x 4', 'quantity' => 4, 'unit' => 'units', 'date_acquired' => '2024-01-01', 'condition' => 'good'],
            ['item_name' => 'Projector', 'description' => 'Epson EB-S04', 'quantity' => 1, 'unit' => 'unit', 'date_acquired' => '2023-06-01', 'condition' => 'good'],
            ['item_name' => 'Sound System', 'description' => 'Portable PA set', 'quantity' => 1, 'unit' => 'set', 'date_acquired' => '2023-03-01', 'condition' => 'fair'],
            ['item_name' => 'Furniture', 'description' => 'Tables & chairs', 'quantity' => 20, 'unit' => 'sets', 'date_acquired' => '2022-09-01', 'condition' => 'good'],
        ];
        foreach ($assets as $a) {
            $existing = $this->db->fetchSingle("SELECT id FROM hub_assets WHERE item_name = :name", ['name' => $a['item_name']]);
            if ($existing) continue;
            $a['is_active'] = 1;
            $a['created_at'] = $now;
            $a['updated_at'] = $now;
            $this->db->insert('hub_assets', $a);
        }

        echo "  Hub data seeded.\n";
    }

    private function seedAnnouncements(): void
    {
        $announcements = [
            ['slug' => 'desa-annual-general-meeting-2025', 'title' => 'DESA Annual General Meeting 2025', 'excerpt' => 'The annual general meeting for all registered distance learning students.', 'body' => 'The annual general meeting for all registered distance learning students will hold at the UEW Main Campus. All regional representatives are expected to attend.', 'type' => 'announcement', 'published_at' => '2025-09-15 00:00:00'],
            ['slug' => '2025-2026-academic-registration-opens', 'title' => '2025/2026 Academic Registration Opens', 'excerpt' => 'Registration for the new academic year is now open.', 'body' => 'Registration for the new academic year is now open. Visit your regional study center coordinator for enrollment assistance.', 'type' => 'notice', 'published_at' => '2025-09-01 00:00:00'],
            ['slug' => 'desa-leadership-elections-scheduled', 'title' => 'DESA Leadership Elections Scheduled', 'excerpt' => 'Nominations for the 2025/2026 DESA executive committee are now open.', 'body' => 'Nominations for the 2025/2026 DESA executive committee are now open. Submit your nomination forms to the Returning Officer.', 'type' => 'announcement', 'published_at' => '2025-08-20 00:00:00'],
        ];

        $now = date('Y-m-d H:i:s');
        foreach ($announcements as $a) {
            $existing = $this->db->fetchSingle("SELECT id FROM announcements WHERE slug = :slug", ['slug' => $a['slug']]);
            if ($existing) continue;
            $a['is_active'] = 1;
            $a['public'] = 1;
            $a['created_at'] = $now;
            $a['updated_at'] = $now;
            $this->db->insert('announcements', $a);
        }
        echo "  Announcements seeded.\n";
    }

    private function seedEvents(): void
    {
        $events = [
            ['slug' => 'desa-gala-night-2025', 'title' => 'DESA National Gala Night 2025', 'excerpt' => 'Annual celebration of DESA achievements.', 'body' => 'Join us for the annual DESA National Gala Night celebrating academic excellence and community spirit.', 'type' => 'event', 'start_date' => '2025-11-15', 'venue' => 'UEW Main Campus Auditorium', 'location' => 'Winneba, Central Region'],
            ['slug' => 'desa-quiz-competition-2025', 'title' => 'DESA National Quiz Competition 2025', 'excerpt' => 'Inter-regional academic quiz competition.', 'body' => 'The annual inter-regional quiz competition for all DESA members. Representatives from each region compete for the national title.', 'type' => 'event', 'start_date' => '2025-10-20', 'venue' => 'UEW Conference Hall', 'location' => 'Winneba, Central Region'],
        ];

        $now = date('Y-m-d H:i:s');
        foreach ($events as $e) {
            $existing = $this->db->fetchSingle("SELECT id FROM events WHERE slug = :slug", ['slug' => $e['slug']]);
            if ($existing) continue;
            $e['is_active'] = 1;
            $e['public'] = 1;
            $e['created_at'] = $now;
            $e['updated_at'] = $now;
            $this->db->insert('events', $e);
        }
        echo "  Events seeded.\n";
    }

    private function seedAcademics(): void
    {
        $academics = [
            ['slug' => 'bed-basic-intro-ppt', 'title' => 'Introduction to Basic Education', 'category' => 'peer_ppt', 'course_code' => 'EDUC 101', 'course_title' => 'Intro to Basic Education', 'level' => 100, 'file_type' => 'PDF', 'file_size' => '2.4 MB', 'author' => 'DESA Academic Team', 'academic_year' => '2025/2026', 'semester' => '1'],
            ['slug' => 'math-ed-algebra-notes', 'title' => 'Algebra & Linear Equations Notes', 'category' => 'academic_vault', 'course_code' => 'MATH 101', 'course_title' => 'Mathematics Education I', 'level' => 100, 'file_type' => 'PDF', 'file_size' => '1.8 MB', 'author' => 'Prof. Mensah', 'academic_year' => '2025/2026', 'semester' => '1'],
            ['slug' => 'past-questions-bed-basic-2024', 'title' => 'B.Ed Basic Education Past Questions 2024', 'category' => 'past_questions', 'course_code' => 'BEd-Basic', 'course_title' => 'Comprehensive Past Questions', 'level' => 300, 'file_type' => 'PDF', 'file_size' => '5.2 MB', 'author' => 'DESA Archive', 'academic_year' => '2024/2025', 'semester' => 'both'],
            ['slug' => 'ed-research-methods-guide', 'title' => 'Research Methods Guide for Distance Learners', 'category' => 'study_material', 'course_code' => 'EDUC 301', 'course_title' => 'Educational Research Methods', 'level' => 300, 'file_type' => 'PDF', 'file_size' => '3.1 MB', 'author' => 'CoDeL Directorate', 'academic_year' => '2025/2026', 'semester' => '2'],
        ];

        $now = date('Y-m-d H:i:s');
        foreach ($academics as $a) {
            $existing = $this->db->fetchSingle("SELECT id FROM academics WHERE slug = :slug", ['slug' => $a['slug']]);
            if ($existing) continue;
            $a['is_active'] = 1;
            $a['public'] = 1;
            $a['file_url'] = '#';
            $a['created_at'] = $now;
            $a['updated_at'] = $now;
            $this->db->insert('academics', $a);
        }
        echo "  Academics seeded.\n";
    }

    private function seedOpportunities(): void
    {
        $opportunities = [
            ['slug' => 'uew-scholarship-2025', 'title' => 'UEW Distance Learning Scholarship 2025', 'category' => 'opportunity_radar', 'organization' => 'UEW Financial Aid Office', 'location' => 'Winneba', 'description' => 'Merit-based scholarships available for outstanding distance learning students across all regions.', 'application_link' => '#', 'deadline' => '2025-12-31', 'featured' => 1],
            ['slug' => 'teach-for-ghana-2025', 'title' => 'Teach For Ghana - Distance Education Fellows', 'category' => 'internship', 'organization' => 'Teach For Ghana', 'location' => 'Various Regions', 'description' => 'Fellowship program for aspiring educators in Ghanaian schools.', 'application_link' => '#', 'deadline' => '2025-10-15'],
            ['slug' => 'digital-skills-workshop', 'title' => 'Free Digital Skills Workshop for DESA Members', 'category' => 'welfare', 'organization' => 'DESA ICT Committee', 'location' => 'Online', 'description' => 'Complimentary digital literacy and productivity skills workshop for all registered DESA members.', 'application_link' => '#'],
            ['slug' => 'alumni-mentorship-program', 'title' => 'DESA Alumni Mentorship Programme', 'category' => 'alumni', 'organization' => 'DESA Alumni Association', 'location' => 'Virtual', 'description' => 'Connect with DESA alumni for career guidance and mentorship.', 'contact_email' => 'alumni@desauew.org'],
        ];

        $now = date('Y-m-d H:i:s');
        foreach ($opportunities as $o) {
            $existing = $this->db->fetchSingle("SELECT id FROM opportunities WHERE slug = :slug", ['slug' => $o['slug']]);
            if ($existing) continue;
            $o['is_active'] = 1;
            $o['public'] = 1;
            $o['created_at'] = $now;
            $o['updated_at'] = $now;
            $this->db->insert('opportunities', $o);
        }
        echo "  Opportunities seeded.\n";
    }
}
