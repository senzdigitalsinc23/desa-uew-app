<?php
declare(strict_types=1);

namespace App\Storage;

use App\Interfaces\FileStorage;
use Aws\S3\S3Client;

/**
 * Amazon S3 (or S3-compatible) implementation of FileStorage.
 *
 * Requires aws/aws-sdk-php.
 */
class S3Storage implements FileStorage
{
    protected S3Client $client;
    protected string $bucket;
    protected string $region;
    protected string $baseUrl;
    protected array $mimes;
    protected ?string $acl;

    public function __construct(
        S3Client $client,
        string   $bucket,
        string   $region,
        ?string  $baseUrl = null,
        ?string  $acl     = null
    ) {
        $this->client   = $client;
        $this->bucket   = $bucket;
        $this->region   = $region;
        $this->baseUrl  = $baseUrl ?? "https://{$bucket}.s3.{$region}.amazonaws.com";
        $this->acl      = $acl;
        $this->mimes    = require __DIR__ . '/../../config/storage_mimes.php';
    }

    public function put(string $path, string $contents, array $options = []): array
    {
        $key     = ltrim($path, '/');
        $mime    = $options['mime'] ?? 'application/octet-stream';
        $public  = $options['public'] ?? $this->acl === 'public-read';

        $params = [
            'Bucket' => $this->bucket,
            'Key'    => $key,
            'Body'   => $contents,
            'ContentType' => $mime,
        ];

        $this->client->putObject($params);

        return [
            'path' => $path,
            'size' => strlen($contents),
            'mime' => $mime,
            'url'  => $this->url($path),
        ];
    }

    public function get(string $path): string|false
    {
        $key = ltrim($path, '/');
        try {
            $result = $this->client->getObject([
                'Bucket' => $this->bucket,
                'Key'    => $key,
            ]);
            return (string)$result['Body'];
        } catch (\Throwable) {
            return false;
        }
    }

    public function exists(string $path): bool
    {
        $key = ltrim($path, '/');
        try {
            $this->client->headObject(['Bucket' => $this->bucket, 'Key' => $key]);
            return true;
        } catch (\Throwable) {
            return false;
        }
    }

    public function delete(string $path): bool
    {
        $key = ltrim($path, '/');
        try {
            $this->client->deleteObject(['Bucket' => $this->bucket, 'Key' => $key]);
            return true;
        } catch (\Throwable) {
            return false;
        }
    }

    public function url(string $path, int $expireSeconds = 0): string
    {
        $key = ltrim($path, '/');
        // Return a proxy URL through our PHP server to avoid CORS/S3 permission issues
        // The catch-all route /api/v1/storage/{path} serves files from S3 with proper headers
        if ($expireSeconds > 0) {
            // Generate a presigned URL for temporary access
            $cmd = $this->client->getCommand('GetObject', [
                'Bucket' => $this->bucket,
                'Key'    => $key,
            ]);
            $request = $this->client->createPresignedRequest($cmd, "+" . $expireSeconds . " seconds");
            return (string)$request->getUri();
        }
        $appUrl = $_ENV['APP_URL'] ?? 'http://localhost:8000';
        return rtrim($appUrl, '/') . '/api/v1/storage/' . $key;
    }

    public function size(string $path): int|false
    {
        $key = ltrim($path, '/');
        try {
            $result = $this->client->headObject(['Bucket' => $this->bucket, 'Key' => $key]);
            return (int)$result['ContentLength'];
        } catch (\Throwable) {
            return false;
        }
    }
}
