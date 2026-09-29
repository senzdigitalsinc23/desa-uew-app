<?php
declare(strict_types=1);

namespace App\Controllers\Api\v1;

use App\Core\Request;
use App\Core\Response;
use App\Core\Traits\JsonResponseTrait;

/**
 * CSRF Token Controller.
 *
 * GET /api/v1/mdware/auth/csrf
 *   Returns a fresh CSRF token for the current session.
 */
class CsrfController
{
    use JsonResponseTrait;

    /**
     * Generate and return a CSRF token.
     * Stores it in the session so the CsrfMiddleware can validate it on POST requests.
     */
    public function token(Request $request, Response $response): Response
    {
        $token = bin2hex(random_bytes(32));

        if (session_status() === PHP_SESSION_NONE) {
            session_start();
        }
        $_SESSION['_csrf_token'] = $token;

        return $this->json($response, 200, [
            'success' => true,
            'data'    => ['token' => $token],
        ]);
    }
}
