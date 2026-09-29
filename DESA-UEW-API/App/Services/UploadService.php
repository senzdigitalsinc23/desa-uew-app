<?php
declare(strict_types=1);

namespace App\Services;

use App\Core\Storage;

/**
 * Upload service — validates, stores, and records uploaded files.
 *
 * Storage hierarchy:  storage/uploads/{category}/{subcategory}/{YYYY}/{MM}/{DD}/{unique}_{filename}
 *
 * Categories & subfolders are defined in config/storage_buckets.php.
 *
 * Usage:
 *   $service = new UploadService();
 *   $result = $service->upload($fileData, 'gallery', 'events', $userId);
 *   // returns ['id' => 1, 'url' => '/storage/gallery/events/2026/09/27/abc123_photo.png', ...]
 */
class UploadService
{
    /**
     * Load the storage bucket config (with fallback).
     */
    protected function getBuckets(): array
    {
        $configPath = __DIR__ . '/../../config/storage_buckets.php';
        if (file_exists($configPath)) {
            return require $configPath;
        }
        // Minimal fallback if config file is missing
        return [
            'gallery'        => ['' => 'Root gallery', 'events' => 'Events'],
            'course-files'   => ['' => 'All courses', 'level100' => 'Level 100', 'level200' => 'Level 200'],
            'announcements'  => ['' => 'Announcements'],
            'profiles'       => ['' => 'Profiles'],
            'documents'      => ['' => 'Documents'],
            'media'          => ['' => 'Media'],
            'general'        => ['' => 'General'],
        ];
    }

    /** @var array<string, int> Max file size per top-level category in bytes */
    protected array $maxSizes = [
        'gallery'        => 10 * 1024 * 1024,   // 10 MB
        'course-files'   => 50 * 1024 * 1024,   // 50 MB
        'announcements'  => 10 * 1024 * 1024,   // 10 MB
        'profiles'       => 5 * 1024 * 1024,    // 5 MB
        'documents'      => 50 * 1024 * 1024,   // 50 MB
        'media'          => 200 * 1024 * 1024,  // 200 MB (videos)
        'general'        => 10 * 1024 * 1024,   // 10 MB
    ];

    /** @var array<string, string[]> Allowed extensions per top-level category */
    protected array $allowedExtensions = [
        'gallery'        => ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'],
        'course-files'   => ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'txt', 'zip', 'mp4', 'mp3'],
        'announcements'  => ['jpg', 'jpeg', 'png', 'gif', 'webp', 'pdf', 'doc', 'docx'],
        'profiles'       => ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'],
        'documents'      => ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'txt', 'zip', 'csv'],
        'media'          => ['mp4', 'mp3', 'wav', 'avi', 'mov', 'jpg', 'jpeg', 'png', 'gif', 'webp'],
        'general'        => ['jpg', 'jpeg', 'png', 'gif', 'webp', 'pdf', 'doc', 'docx', 'xls', 'xlsx', 'zip', 'mp4', 'mp3'],
    ];

    /**
     * Get all available buckets for a category (for UI dropdowns).
     *
     * @return array<string, string>  ['subfolder' => 'display label']
     */
    public function getBucketsForCategory(string $category): array
    {
        $buckets = $this->getBuckets();
        $catBuckets = $buckets[$category] ?? ['' => 'Root (no subfolder)'];
        // Remove empty key label for consistency
        if (isset($catBuckets[''])) {
            $catBuckets[''] = 'General';
        }
        return $catBuckets;
    }

    /**
     * Get a flat list of all buckets across all categories.
     *
     * @return array<string, array<string,string>>  ['category' => ['subfolder' => 'label', ...]]
     */
    public function getAllBuckets(): array
    {
        $all = [];
        foreach ($this->getBuckets() as $cat => $subs) {
            $all[$cat] = [];
            foreach ($subs as $sub => $label) {
                $all[$cat][] = [
                    'category'  => $cat,
                    'subcategory' => $sub,
                    'label'     => $sub === '' ? $label : "{$cat}/{$sub}  —  {$label}",
                ];
            }
        }
        return $all;
    }

    /**
     * Upload a file into the appropriate category/subfolder.
     *
     * @param array  $fileData    PHP $_FILES-style array (name, tmp_name, error, size, type)
     * @param string $category    Top-level folder (e.g. 'gallery', 'course-files')
     * @param string $subcategory Sub-folder (e.g. 'events', 'level100'). Empty string = root of category.
     * @param int|null $userId    Optional user ID for tracking
     * @param string|null $description Optional description
     */
    public function upload(
        array $fileData,
        string $category = 'general',
        string $subcategory = '',
        ?int $userId = null,
        ?string $description = null
    ): array {
        $originalName = $fileData['name'] ?? '';
        $tmpPath      = $fileData['tmp_name'] ?? '';
        $size         = (int) ($fileData['size'] ?? 0);
        $error        = (int) ($fileData['error'] ?? UPLOAD_ERR_OK);
        $mime         = $fileData['type'] ?? '';

        // ── Validate upload error ──────────────────────────────────────────
        if ($error !== UPLOAD_ERR_OK) {
            throw new \InvalidArgumentException(match($error) {
                UPLOAD_ERR_INI_SIZE  => 'File exceeds server upload limit.',
                UPLOAD_ERR_FORM_SIZE => 'File exceeds form upload limit.',
                UPLOAD_ERR_PARTIAL   => 'File was only partially uploaded.',
                UPLOAD_ERR_NO_FILE   => 'No file was uploaded.',
                default              => 'Upload error occurred.',
            });
        }

        // ── Validate category ──────────────────────────────────────────────
        $buckets     = $this->getBuckets();
        $allowedExt  = $this->allowedExtensions[$category] ?? $this->allowedExtensions['general'];
        $maxSize     = $this->maxSizes[$category] ?? $this->maxSizes['general'];

        if (!array_key_exists($category, $buckets)) {
            throw new \InvalidArgumentException("Invalid category: {$category}. Available: " . implode(', ', array_keys($buckets)));
        }

        // ── Validate subcategory ───────────────────────────────────────────
        $subfolders = $buckets[$category];
        if ($subcategory !== '' && !array_key_exists($subcategory, $subfolders)) {
            throw new \InvalidArgumentException(
                "Invalid subcategory '{$subcategory}' for '{$category}'. "
                . "Available: " . implode(', ', array_keys($subfolders))
            );
        }

        // ── Validate size ──────────────────────────────────────────────────
        if ($size > $maxSize) {
            $mb = $maxSize / 1024 / 1024;
            throw new \InvalidArgumentException("File exceeds maximum size of {$mb} MB for {$category}");
        }

        // ── Validate extension / MIME ──────────────────────────────────────
        $ext  = strtolower(pathinfo($originalName, PATHINFO_EXTENSION));
        if (!in_array($ext, $allowedExt, true)) {
            throw new \InvalidArgumentException(
                "Extension .{$ext} not allowed for {$category}. Allowed: "
                . implode(', ', array_map(fn($e) => ".$e", $allowedExt))
            );
        }

        // ── Build path: {category}/{subcategory}/{YYYY}/{MM}/{DD}/{unique}_{name} ─
        $dateDir  = date('Y/m/d');
        $safeName = $this->sanitizeFilename($originalName);
        $uniqueName = uniqid() . '_' . $safeName;

        if ($subcategory !== '') {
            $path = "{$category}/{$subcategory}/{$dateDir}/{$uniqueName}";
        } else {
            $path = "{$category}/{$dateDir}/{$uniqueName}";
        }

        // ── Read file contents ─────────────────────────────────────────────
        $contents = file_get_contents($tmpPath);
        if ($contents === false) {
            throw new \RuntimeException('Failed to read uploaded file');
        }

        // ── Store via the Storage facade (resolves correct driver) ─────────
        $stored = Storage::put($path, $contents, ['mime' => $mime]);

        // ── Record in database ─────────────────────────────────────────────
        $db     = \App\Core\Database::getInstance()->getConnection();
        $stmt   = $db->prepare(
            "INSERT INTO media_files
               (filename, original_name, path, url, mime_type, extension, size, disk, category, subcategory, description, uploaded_by, created_at, updated_at)
             VALUES
               (:filename, :original_name, :path, :url, :mime_type, :extension, :size, :disk, :category, :subcategory, :description, :uploaded_by, NOW(), NOW())"
        );
        $stmt->execute([
            ':filename'      => $uniqueName,
            ':original_name' => $originalName,
            ':path'          => $path,
            ':url'           => $stored['url'],
            ':mime_type'     => $mime ?: $this->guessMime($ext),
            ':extension'     => $ext,
            ':size'          => $size,
            ':disk'          => $_ENV['FILESYSTEM_DISK'] ?? 'local',
            ':category'      => $category,
            ':subcategory'   => $subcategory,
            ':description'   => $description,
            ':uploaded_by'   => $userId,
        ]);
        $id = (int) $db->lastInsertId();

        return [
            'id'           => $id,
            'filename'     => $uniqueName,
            'original_name'=> $originalName,
            'path'         => $path,
            'url'          => $stored['url'],
            'mime_type'    => $mime ?: $this->guessMime($ext),
            'extension'    => $ext,
            'size'         => $size,
            'disk'         => $_ENV['FILESYSTEM_DISK'] ?? 'local',
            'category'     => $category,
            'subcategory'  => $subcategory,
            'description'  => $description,
        ];
    }

    /**
     * Delete a media file from storage and database.
     */
    public function delete(int $id, ?int $userId = null): bool
    {
        $db = \App\Core\Database::getInstance();
        $row = $db->fetchSingle("SELECT * FROM media_files WHERE id = ? AND is_active = 1", [$id]);

        if (!$row) {
            return false;
        }

        // Delete physical file
        $storagePath = trim($row['path'], '/');
        Storage::delete($storagePath);

        // Soft-delete from DB
        $db->query(
            "UPDATE media_files SET is_active = 0, updated_at = NOW() WHERE id = ?",
            [$id]
        );

        return true;
    }

    /**
     * List media files with optional filters.
     */
    public function listFiles(array $params = []): array
    {
        $where = "WHERE is_active = 1";
        $bindings = [];

        if (!empty($params['category'])) {
            $where .= " AND category = :category";
            $bindings[':category'] = $params['category'];
        }
        if (!empty($params['subcategory'])) {
            $where .= " AND subcategory = :subcategory";
            $bindings[':subcategory'] = $params['subcategory'];
        }
        if (!empty($params['disk'])) {
            $where .= " AND disk = :disk";
            $bindings[':disk'] = $params['disk'];
        }
        if (!empty($params['search'])) {
            $where .= " AND (original_name LIKE :search OR description LIKE :search)";
            $bindings[':search'] = '%' . $params['search'] . '%';
        }

        $limit  = (int) ($params['limit'] ?? 50);
        $offset = (int) ($params['offset'] ?? 0);

        $sql = "SELECT id, filename, original_name, path, url, mime_type, extension, size, disk,
                       category, subcategory, description, uploaded_by, created_at
                FROM media_files {$where}
                ORDER BY created_at DESC
                LIMIT :limit OFFSET :offset";

        $stmt = \App\Core\Database::getInstance()->getConnection()->prepare($sql);
        foreach ($bindings as $key => $val) {
            $stmt->bindValue($key, $val);
        }
        $stmt->bindValue(':limit', $limit, \PDO::PARAM_INT);
        $stmt->bindValue(':offset', $offset, \PDO::PARAM_INT);
        $stmt->execute();
        $files = $stmt->fetchAll(\PDO::FETCH_ASSOC);

        $countSql = "SELECT COUNT(*) AS total FROM media_files {$where}";
        $countStmt = \App\Core\Database::getInstance()->getConnection()->prepare($countSql);
        foreach ($bindings as $key => $val) {
            $countStmt->bindValue($key, $val);
        }
        $countStmt->execute();
        $total = (int) $countStmt->fetch(\PDO::FETCH_ASSOC)['total'];

        return [
            'data' => $files,
            'meta' => ['total' => $total, 'limit' => $limit, 'offset' => $offset],
        ];
    }

    /**
     * Convert a human-friendly filename into a web-safe name.
     */
    protected function sanitizeFilename(string $name): string
    {
        $name = preg_replace('/[^a-zA-Z0-9_\-. ]/', '', $name);
        $name = preg_replace('/\s+/', '_', $name);
        return strtolower(trim($name));
    }

    /**
     * Guess MIME type from extension when not provided by the client.
     */
    protected function guessMime(string $ext): string
    {
        $mimes = require __DIR__ . '/../../config/storage_mimes.php';
        return $mimes[$ext] ?? 'application/octet-stream';
    }
}
