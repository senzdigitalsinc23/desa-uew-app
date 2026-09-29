<?php
declare(strict_types=1);

namespace App\Storage;

use App\Interfaces\FileStorage;

/**
 * Google Drive implementation of FileStorage.
 *
 * Requires: google/apiclient (^2.0)
 *
 * Env vars:
 *   GOOGLE_DRIVE_CLIENT_ID     — OAuth client ID
 *   GOOGLE_DRIVE_CLIENT_SECRET — OAuth client secret
 *   GOOGLE_DRIVE_REFRESH_TOKEN — Refresh token for service account flow
 *   GOOGLE_DRIVE_FOLDER_ID     — Parent folder UUID (optional)
 */
class GoogleDriveStorage implements FileStorage
{
    protected \Google_Client $client;
    protected \Google_Service_Drive $drive;
    protected string $folderId;
    protected array $mimes;

    public function __construct()
    {
        if (!class_exists(\Google_Client::class)) {
            throw new \RuntimeException('Google API Client not installed. Run: composer require google/apiclient:^2.0');
        }

        $this->client = new \Google_Client();
        $this->client->setClientId($_ENV['GOOGLE_DRIVE_CLIENT_ID'] ?? '');
        $this->client->setClientSecret($_ENV['GOOGLE_DRIVE_CLIENT_SECRET'] ?? '');
        $this->client->setRefreshToken($_ENV['GOOGLE_DRIVE_REFRESH_TOKEN'] ?? '');
        $this->client->setAccessType('offline');
        $this->client->setPrompt('consent');

        $this->drive       = new \Google_Service_Drive($this->client);
        $this->folderId    = $_ENV['GOOGLE_DRIVE_FOLDER_ID'] ?? '';
        $this->mimes       = require __DIR__ . '/../../config/storage_mimes.php';
    }

    public function put(string $path, string $contents, array $options = []): array
    {
        $fileName  = basename($path);
        $extension = strtolower(pathinfo($fileName, PATHINFO_EXTENSION));
        $mime      = $options['mime'] ?? ($this->mimes[$extension] ?? 'application/octet-stream');

        $file = new \Google_Service_Drive_DriveFile([
            'name' => $fileName,
        ]);

        $parentId = $this->folderId ?: null;
        if ($parentId) {
            $file->setParents([$parentId]);
        }

        $result = $this->drive->files->create($file, [
            'data'              => $contents,
            'mimeType'          => $mime,
            'uploadType'        => 'multipart',
            'fields'            => 'id,name,mimeType,size,webViewLink,webContentLink',
        ]);

        // Make publicly readable if option set
        if ($options['public'] ?? false) {
            $this->makePublic($result->id);
        }

        return [
            'path' => $path,
            'size' => (int) $result->size,
            'mime' => $mime,
            'url'  => $result->webViewLink ?? $result->webContentLink ?? '',
            'drive_id' => $result->id,
        ];
    }

    public function get(string $path): string|false
    {
        $fileId = $this->resolveFileId($path);
        if (!$fileId) {
            return false;
        }
        try {
            $stream = $this->drive->files->get($fileId, ['alt' => 'media']);
            return (string) $stream;
        } catch (\Throwable) {
            return false;
        }
    }

    public function exists(string $path): bool
    {
        return (bool) $this->resolveFileId($path);
    }

    public function delete(string $path): bool
    {
        $fileId = $this->resolveFileId($path);
        if (!$fileId) {
            return true;
        }
        try {
            $this->drive->files->delete($fileId);
            return true;
        } catch (\Throwable) {
            return false;
        }
    }

    public function url(string $path, int $expireSeconds = 0): string
    {
        $fileId = $this->resolveFileId($path);
        if (!$fileId) {
            return '';
        }
        // Google Drive view link
        return "https://drive.google.com/file/d/{$fileId}/view";
    }

    public function size(string $path): int|false
    {
        $fileId = $this->resolveFileId($path);
        if (!$fileId) {
            return false;
        }
        try {
            $file = $this->drive->files->get($fileId, ['fields' => 'size']);
            return (int) $file->size;
        } catch (\Throwable) {
            return false;
        }
    }

    /**
     * Resolve a storage path to a Google Drive file ID by listing files in the folder.
     */
    protected function resolveFileId(string $path): ?string
    {
        $fileName = basename($path);
        $query    = "name = '{$fileName}' and trashed = false";
        if ($this->folderId) {
            $query .= " and '{$this->folderId}' in parents";
        }
        try {
            $result = $this->drive->files->listFiles([
                'q'       => $query,
                'pageSize' => 1,
                'fields'  => 'files(id,name)',
            ]);
            foreach ($result->getFiles() as $file) {
                if ($file->getName() === $fileName) {
                    return $file->getId();
                }
            }
        } catch (\Throwable) {
            return null;
        }
        return null;
    }

    /**
     * Make a Drive file publicly accessible.
     */
    protected function makePublic(string $fileId): void
    {
        $permission = new \Google_Service_Drive_Permission([
            'type'  => 'anyone',
            'role'  => 'reader',
        ]);
        $this->drive->permissions->create($fileId, $permission);
    }
}
