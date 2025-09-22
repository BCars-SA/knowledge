/**
 * @fileoverview Express authentication middleware for API endpoints
 * Provides API key based authentication
 */

import type { NextFunction, Request, Response } from "express";

/**
 * API key authentication middleware for Express
 */
export class AuthMiddleware {
    constructor(private readonly validApiKey: string) {}

    /**
     * Express middleware function for API key authentication
     */
    authenticate = (req: Request, res: Response, next: NextFunction): void => {
        const authResult = this.validateRequest(req);

        if (!authResult.success) {
            res.status(authResult.status).json({
                success: false,
                timestamp: new Date().toISOString(),
                error: authResult.error,
                duration: 0,
                details: {
                    code:
                        authResult.status === 401
                            ? "MISSING_API_KEY"
                            : "INVALID_API_KEY",
                },
            });
            return;
        }
        next();
    };

    /**
     * Authenticate request based on API key
     */
    private validateRequest(request: Request): {
        success: boolean;
        error?: string;
        status: number;
    } {
        if (!this.validApiKey) {
            return { success: true, status: 200 }; // No API key set, allow all requests
        }

        const authHeader = request.get("authorization");
        const apiKeyHeader = request.get("x-api-key");

        // Check for API key in Authorization header (Bearer format)
        if (authHeader) {
            const match = authHeader.match(/^Bearer\s+(.+)$/);
            if (match) {
                const providedKey = match[1];
                if (providedKey === this.validApiKey) {
                    return { success: true, status: 200 };
                }
            }
        }

        // Check for API key in X-API-Key header
        if (apiKeyHeader) {
            if (apiKeyHeader === this.validApiKey) {
                return { success: true, status: 200 };
            }
        }

        // Authentication failed
        if (!authHeader && !apiKeyHeader) {
            return {
                success: false,
                error: "API key required. Provide via Authorization header (Bearer <key>) or X-API-Key header",
                status: 401,
            };
        }

        return {
            success: false,
            error: "Invalid API key",
            status: 403,
        };
    }
}
