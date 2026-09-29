<?php
declare(strict_types=1);

namespace App\Controllers\Api\v1;

use App\Core\Request;
use App\Core\Response;
use App\Core\Traits\JsonResponseTrait;
use App\Services\UploadService;

/**
 * File Upload API Controller — v1
 *
 * Endpoints:
 *   POST   /api/v1/upload               — upload a file (multipart/form-data)
 *   GET    /api/v1/media                — list media files
 *   GET    /api/v1/media/{id}           — get a single file record
 *   DELETE /api/v1/media/{id}           — delete a file
 *   GET    /api/v1/storage/{path}       — serve a stored file (public)
 */
class UploadController
{
    use JsonResponseTrait;

    private UploadService $uploadService;

    public function __construct(?UploadService $uploadService = null)
    {
        $this->uploadService = $uploadService ?? new UploadService();
    }

    // ── POST /api/v1/upload ──────────────────────────────────────────────

    /**
     * Upload a file. Accepts multipart/form-data.
     *
     * Body params:
     *   file          — the uploaded file (required)
     *   category      — top-level folder (gallery, course-files, announcements, profiles, documents, media, general)
     *   subcategory   — subfolder within the category (optional, empty string = root of category)
     *   description   — optional description
     *
     * Category/subcategory mapping is defined in config/storage_buckets.php.
     */
    public function upload(Request $request, Response $response): Response
    {
        try {
            $uploadedFile = $request->getFiles('file');
            if (empty($uploadedFile) || !($uploadedFile instanceof \Psr\Http\Message\UploadedFileInterface)) {
                return $this->json($response, 400, [
                    'success' => false,
                    'error'   => 'NO_FILE',
                    'message' => 'No file uploaded or upload error occurred.',
                ]);
            }

            if ($uploadedFile->getError() !== UPLOAD_ERR_OK) {
                $errorMsg = match ($uploadedFile->getError()) {
                    UPLOAD_ERR_INI_SIZE  => 'File exceeds server upload limit.',
                    UPLOAD_ERR_FORM_SIZE => 'File exceeds form upload limit.',
                    UPLOAD_ERR_PARTIAL   => 'File was only partially uploaded.',
                    UPLOAD_ERR_NO_FILE   => 'No file was uploaded.',
                    default              => 'Upload error occurred.',
                };
                return $this->json($response, 400, [
                    'success' => false,
                    'error'   => 'UPLOAD_ERROR',
                    'message' => $errorMsg,
                ]);
            }

            // Convert PSR-7 UploadedFileInterface to $_FILES-style array for UploadService
            $file = [
                'name'     => $uploadedFile->getClientFilename(),
                'type'     => $uploadedFile->getClientMediaType(),
                'tmp_name' => $uploadedFile->getStream()->getMetadata('uri'),
                'error'    => UPLOAD_ERR_OK,
                'size'     => (int) $uploadedFile->getSize(),
            ];

            $category    = $request->getPost('category', 'general');
            $subcategory = $request->getPost('subcategory', '');
            $description = $request->getPost('description', null);

            // Get user ID from session if authenticated
            $userId = null;
            $user = \App\Core\Session::get('user');
            if ($user && isset($user['id'])) {
                $userId = (int) $user['id'];
            }

            $result = $this->uploadService->upload($file, $category, $subcategory, $userId, $description);

            return $this->json($response, 201, [
                'success' => true,
                'data'    => $result,
                'message' => 'File uploaded successfully',
            ]);
        } catch (\InvalidArgumentException $e) {
            return $this->json($response, 400, [
                'success' => false,
                'error'   => 'VALIDATION_ERROR',
                'message' => $e->getMessage(),
            ]);
        } catch (\Throwable $e) {
            return $this->json($response, 500, [
                'success' => false,
                'error'   => 'UPLOAD_ERROR',
                'message' => 'Failed to upload file: ' . $e->getMessage(),
            ]);
        }
    }

    // ── GET /api/v1/media ────────────────────────────────────────────────

    /**
     * List uploaded media files.
     *
     * Query params: category, subcategory, disk, search, limit, offset
     */
    public function listFiles(Request $request, Response $response): Response
    {
        try {
            $params = [
                'category'    => $request->getQuery('category'),
                'subcategory' => $request->getQuery('subcategory'),
                'disk'        => $request->getQuery('disk'),
                'search'      => $request->getQuery('search'),
                'limit'       => (int) $request->getQuery('limit', 50),
                'offset'      => (int) $request->getQuery('offset', 0),
            ];
            $result = $this->uploadService->listFiles($params);

            return $this->json($response, 200, [
                'success' => true,
                'data'    => $result['data'],
                'meta'    => $result['meta'],
            ]);
        } catch (\Throwable $e) {
            return $this->json($response, 500, [
                'success' => false,
                'error'   => 'LIST_ERROR',
                'message' => 'Failed to list files.',
            ]);
        }
    }

    // ── GET /api/v1/buckets ──────────────────────────────────────────────

    /**
     * Return all available storage buckets (categories + subfolders).
     * Used by the frontend to populate the category/subcategory dropdowns.
     */
    public function getBuckets(Request $request, Response $response): Response
    {
        try {
            $buckets = $this->uploadService->getAllBuckets();
            return $this->json($response, 200, [
                'success' => true,
                'data'    => $buckets,
            ]);
        } catch (\Throwable $e) {
            return $this->json($response, 500, [
                'success' => false,
                'error'   => 'BUCKETS_ERROR',
                'message' => 'Failed to load buckets.',
            ]);
        }
    }

    // ── GET /api/v1/media/{id} ───────────────────────────────────────────

    public function getFile(Request $request, Response $response, array $params): Response
    {
        try {
            $db = \App\Core\Database::getInstance();
            $file = $db->fetchSingle(
                "SELECT * FROM media_files WHERE id = ? AND is_active = 1",
                [(int) $params['id']]
            );

            if (!$file) {
                return $this->json($response, 404, [
                    'success' => false,
                    'error'   => 'NOT_FOUND',
                    'message' => 'File not found.',
                ]);
            }

            return $this->json($response, 200, [
                'success' => true,
                'data'    => $file,
            ]);
        } catch (\Throwable $e) {
            return $this->json($response, 500, [
                'success' => false,
                'error'   => 'FETCH_ERROR',
                'message' => 'Failed to fetch file.',
            ]);
        }
    }

    // ── DELETE /api/v1/media/{id} ────────────────────────────────────────

    public function deleteFile(Request $request, Response $response, array $params): Response
    {
        try {
            $userId = null;
            $user = \App\Core\Session::get('user');
            if ($user && isset($user['id'])) {
                $userId = (int) $user['id'];
            }

            $deleted = $this->uploadService->delete((int) $params['id'], $userId);

            if (!$deleted) {
                return $this->json($response, 404, [
                    'success' => false,
                    'error'   => 'NOT_FOUND',
                    'message' => 'File not found.',
                ]);
            }

            return $this->json($response, 200, [
                'success' => true,
                'message' => 'File deleted successfully',
            ]);
        } catch (\Throwable $e) {
            return $this->json($response, 500, [
                'success' => false,
                'error'   => 'DELETE_ERROR',
                'message' => 'Failed to delete file.',
            ]);
        }
    }

    // ── GET /api/v1/storage/{path} ───────────────────────────────────────

    /**
     * Public endpoint to serve stored files.
     * Used by the frontend to load uploaded images/documents.
     */
    public function serveFile(Request $request, Response $response, array $params): Response
    {
        try {
            $path = urldecode($params['path'] ?? '');
            if (empty($path) || str_contains($path, '..')) {
                return $this->json($response, 400, [
                    'success' => false,
                    'error'   => 'INVALID_PATH',
                    'message' => 'Invalid file path.',
                ]);
            }

            $contents = Storage::get($path);
            if ($contents === false) {
                return $this->json($response, 404, [
                    'success' => false,
                    'error'   => 'NOT_FOUND',
                    'message' => 'File not found.',
                ]);
            }

            // Determine MIME type from path extension
            $ext         = strtolower(pathinfo($path, PATHINFO_EXTENSION));
            $mimeMap     = require __DIR__ . '/../../config/storage_mimes.php';
            $contentType = $mimeMap[$ext] ?? 'application/octet-stream';

            $response->setHeader('Content-Type', $contentType);
            $response->setHeader('Cache-Control', 'public, max-age=86400');
            $response->setContent($contents);
            return $response;
        } catch (\Throwable $e) {
            return $this->json($response, 500, [
                'success' => false,
                'error'   => 'SERVE_ERROR',
                'message' => 'Failed to serve file.',
            ]);
        }
    }
}
