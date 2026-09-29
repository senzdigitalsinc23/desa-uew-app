<?php
/**
 * Storage Bucket Configuration
 *
 * Defines the folder hierarchy for file uploads.
 * Each category can have one or more subfolders.
 * The path used is: {category}/{subcategory}/{date}/{filename}
 *
 * Set FILESYSTEM_DISK=local in .env for filesystem storage.
 */
return [
    // ── Gallery Images ────────────────────────────────────────────────
    'gallery' => [
        ''          => 'Root gallery (uncategorised images)',
        'events'    => 'Event photos (congress, galas, inductions)',
        'camps'     => 'Study centre / campus photos',
        'leadership'=> 'Leadership & committee photos',
    ],

    // ── Course Resources ──────────────────────────────────────────────
    'course-files' => [
        'level100'  => 'Level 100 course materials',
        'level200'  => 'Level 200 course materials',
        'level300'  => 'Level 300 course materials',
        'level400'  => 'Level 400 course materials',
        'pgde'      => 'PGDE programme resources',
        'dip-edu'   => 'Diploma in Education resources',
        'syllabus'  => 'Course syllabi (all levels)',
        'past-questions' => 'Past examination questions',
    ],

    // ── Announcements & Notices ───────────────────────────────────────
    'announcements' => [
        'thumbnails' => 'Announcement / notice thumbnail images',
        'attachments'=> 'PDFs, documents attached to announcements',
    ],

    // ── Profile & Avatars ─────────────────────────────────────────────
    'profiles' => [
        ''     => 'User profile photos',
        'banners'=> 'Page/header banner images',
    ],

    // ── General Documents ─────────────────────────────────────────────
    'documents' => [
        ''     => 'General documents (no subfolder)',
        'contracts'=> 'Contract and agreement PDFs',
        'reports'  => 'Annual reports and proceedings',
    ],

    // ── General / Misc ────────────────────────────────────────────────
    'general' => [
        '' => 'General uploads',
    ],

    // ── Media / Multimedia ────────────────────────────────────────────
    'media' => [
        'videos'  => 'Recorded lectures and event videos',
        'audio'   => 'Audio recordings and podcasts',
        'presentations' => 'PPT / slide decks',
    ],
];
