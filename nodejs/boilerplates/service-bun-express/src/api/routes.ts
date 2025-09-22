/**
 * @fileoverview Express route handlers and configuration for API endpoints
 * Handles request routing, validation, and response formatting using Express Router
 */

import type { IConfigService } from "@/config-service";
import type { ILogger } from "@artemkdr/core";
import { Router, type Request, type Response } from "express";
import type { z, ZodSchema } from "zod";
import { HealthController } from "./controllers/health-controller";
import { AuthMiddleware } from "./middleware/auth";
import {
    HealthRequestSchema,
} from "./types/requests";
import type { BaseApiResponse } from "./types/responses";

/**
 * Route handler dependencies
 */
export interface RouteHandlerDependencies {
    configService: IConfigService;
    logger: ILogger;
    /**
     * API key for authenticating requests
     */
    apiKey: string;
}

/**
 * API route configuration class using Express Router
 *
 * Includes:
 * - Route definitions and handlers
 * - Input validation with Zod schemas
 * - Authentication middleware
 * - Error handling and logging
 */
export class ApiRoutes {
    private readonly router: Router;
    private readonly healthController: HealthController;
    private readonly authMiddleware: AuthMiddleware;

    constructor(
        configService: IConfigService,
        private readonly logger: ILogger,
    ) {
        this.router = Router();

        this.healthController = new HealthController(configService);

        // Initialize middleware
        this.authMiddleware = new AuthMiddleware(
            configService.getServerConfig().apiKey,
        );

        this.setupRoutes();
    }

    /**
     * Get configured Express router
     */
    getRouter(): Router {
        return this.router;
    }

    /**
     * Setup all routes and middleware
     */
    private setupRoutes(): void {
        // Health check endpoint (no authentication required)
        this.router.get("/health", (req: Request, res: Response) => {
            this.handleRequest(
                req,
                res,
                HealthRequestSchema,
                this.healthController.getHealth,
            );
        });

        // Apply authentication middleware to all other routes
        this.router.use(this.authMiddleware.authenticate);
    }

    /**
     * Handle API requests with validation and error handling
     * @param req Express request object
     * @param res Express response object
     * @param schema Zod schema for request validation
     * @param handler Request handler function
     * @returns Promise<void>
     */
    private handleRequest = async <T>(
        req: Request,
        res: Response,
        schema: ZodSchema<T>,
        handler: (data: T) => Promise<BaseApiResponse>,
    ) => {
        try {
            // Validate request body
            const validationResult = schema.safeParse(
                req.method === "GET" ? req.query : req.body,
            );
            if (!validationResult.success) {
                this.sendValidationError(res, validationResult.error);
                return;
            }
            const result = await handler(validationResult.data);
            if (!result.success && result.error) {
                this.logError(req, result.error);
            }
            res.status(
                result.success ? 200 : result.error?.statusCode || 500,
            ).json({
                ...result,
                ...(result.success
                    ? {}
                    : {
                          error: {
                              name: result.error?.name,
                              message: result.error?.message,
                          },
                      }),
            });
        } catch (error) {
            const errorMessage =
                error instanceof Error ? error.message : String(error);

            this.logError(
                req,
                error instanceof Error ? error : new Error(errorMessage),
            );

            res.status(500).json({
                success: false,
                timestamp: new Date(),
                error: "Failed to process request",
                details: {
                    method: req.method,
                    path: req.path,
                },
            });
        }
    };

    /** Log error */
    private logError(req: Request, error: Error): void {
        this.logger.error(`Error handling request ${req.method} ${req.path}`, {
            ip: req.ip,
            error: error.message,
            stack: `${error.stack?.slice(0, 5000)}...`,
            ...(error.cause ? { cause: error.cause } : {}),
        });
    }

    /**
     * Send validation error response
     */
    private sendValidationError(res: Response, error: z.ZodError): void {
        const errorDetails = error.issues.map((err: z.core.$ZodIssue) => ({
            field: err.path.join("."),
            message: err.message,
            code: err.code,
        }));

        res.status(400).json({
            success: false,
            timestamp: new Date(),
            error: "Request input validation failed",
            details: errorDetails,
        });
    }
}
