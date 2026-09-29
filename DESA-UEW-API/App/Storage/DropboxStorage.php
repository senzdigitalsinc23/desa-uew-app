<?php
declare(strict_types=1);

namespace App\Storage;

use App\Interfaces\FileStorage;

/**
 * Dropbox implementation of FileStorage.
 *
 * Requires: dropbox/dropbox-sdk (^3.0)
 *
 * Env vars:
 *   DROPBOX_ACCESS_TOKEN — OAuth access token
 *   DROPBOX_APP_KEY      — App key (for SDK init)
 */
class DropboxStorage implements FileStorage
{
    protected \Dropbox\DropboxClient $client;
    protected string $basePath;
    protected array $mimes;

    public function __construct()
    {
        if (!class_exists(\Dropbox\DropboxClient::class)) {
            throw new \RuntimeException('Dropbox SDK not installed. Run: composer require dropbox/dropbox-sdk:^3.0');
        }

        $token  = $_ENV['DROPBOX_ACCESS_TOKEN'] ?? '';
        $appKey = $_ENV['DROPBOX_APP_KEY'] ?? 'desa-uew-app';

        $this->client   = new \Dropbox\DropboxClient($token, $appKey, 'desa-uew-app');
        $this->basePath = '/DESA-UEW/';
        $this->mimes    = require __DIR__ . '/../../config/storage_mimes.php';
    }

    public function put(string $path, string $contents, array $options = []): array
    {
        $fullPath = $this->basePath . ltrim($path, '/');
        $extension = strtolower(pathinfo(basename($path), PATHINFO_EXTENSION));
        $mime      = $options['mime'] ?? ($this->mimes[$extension] ?? 'application/octet-stream');

        $result = $this->client->filesUpload(
            $fullPath,
            \Dropbox\WriteMode::overridingFile(),
            $contents
        );

        return [
            'path' => $path,
            'size' => (int) $result['size'],
            'mime' => $mime,
            'url'  => $result['link'] ?? '',
        ];
    }

    public function get(string $path): string|false
    {
        try {
            $result = $this->client->filesDownload($this->basePath . ltrim($path, '/'));
            return (string) $result[1];
        } catch (\Throwable) {
            return false;
        }
    }

    public function exists(string $path): bool
    {
        try {
            $this->client->filesGetMetadata($this->basePath . ltrim($path, '/'));
            return true;
        } catch (\Throwable) {
            return false;
        }
    }

    public function delete(string $path): bool
    {
        try {
            $this->client->filesDeleteV2($this->basePath . ltrim($path, '/'));
            return true;
        } catch (\Throwable) {
            return false;
        }
    }

    public function url(string $path, int $expireSeconds = 0): string
    {
        try {
            $result = $this->client->filesGetTemporaryLink($this->basePath . ltrim($path, '/'));
            return $result['link'];
        } catch (\Throwable) {
            return '';
        }
    }

    public function size(string $path): int|false
    {
        try {
            $result = $this->client->filesGetMetadata($this->basePath . ltrim($path, '/'));
            return (int) $result['size'];
        } catch (\Throwable) {
            return false;
        }
    }
}
