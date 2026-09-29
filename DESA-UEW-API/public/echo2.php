<?php
header('Content-Type: application/json');
echo json_encode([
    'method' => $_SERVER['REQUEST_METHOD'],
    'origin' => $_SERVER['HTTP_ORIGIN'] ?? 'none',
    'content_type' => $_SERVER['CONTENT_TYPE'] ?? 'none',
    'post_count' => count($_POST),
    'files_count' => count($_FILES),
    'files' => $_FILES,
], JSON_PRETTY_PRINT);
