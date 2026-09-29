<?php
$c = new PDO('mysql:host=127.0.0.1;dbname=desa_db', 'root', 'tem22ple12345?');

// Drop single-column FULLTEXT indexes and create multi-column ones
$tables = [
    'study_centers' => ['name', 'premises', 'city', 'landmark', 'slug'],
    'announcements' => ['title', 'excerpt', 'body', 'slug'],
    'events' => ['title', 'excerpt', 'body', 'venue', 'slug'],
    'academics' => ['title', 'description', 'course_code', 'course_title', 'tags', 'slug'],
    'opportunities' => ['title', 'description', 'organization', 'slug'],
];

foreach ($tables as $table => $cols) {
    // Drop existing single-column FT indexes
    $c->exec("DROP INDEX ft_{$table}_search ON {$table}");
    // Create multi-column FT index
    $colList = implode(', ', $cols);
    $c->exec("CREATE FULLTEXT INDEX ft_{$table}_search ON {$table}({$colList})");
    echo "Created FT index on {$table}: {$colList}\n";
}

echo "\nDone!\n";
