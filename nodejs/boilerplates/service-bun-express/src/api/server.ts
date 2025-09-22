/**
 * @fileoverview Express HTTP server implementation for API endpoints
 * Provides high-performance HTTP server with proper middleware, CORS, and error handling
 */

import type { IConfigService } from "@/config-service";
import type { ILogger } from "@artemkdr/core";
import compression from "compression";
import cors from "cors";
import express, {
    type Application,
    type NextFunction,
    type Request,
    type Response,
} from "express";
import helmet from "helmet";
import type { Server } from "node:http";
import path from "node:path";
import { ApiRoutes } from "./routes";

/**
 * Configuration for API server
 */
export interface ApiServerConfig {
    /** Server port */
    port: number;
    /** Server host */
    host: string;
    /** API key for authentication */
    apiKey: string;
    /** Request timeout in milliseconds */
    requestTimeout?: number;
    /** Maximum request body size */
    maxRequestSize?: string;
}

/**
 * API Server class using Express
 */
export class ApiServer {
    private app: Application;
    private server: Server | undefined;
    private routes: ApiRoutes;
    private isRunning = false;

    constructor(
        private readonly config: ApiServerConfig,
        configService: IConfigService,
        private readonly logger: ILogger,
    ) {
        this.app = express();

        this.routes = new ApiRoutes(
            configService,
            logger,
        );
        this.setupMiddleware(configService);
        this.setupRoutes();
        this.setupErrorHandlers();
    }

    /**
     * Setup Express middleware
     */
    private setupMiddleware(configService: IConfigService): void {
        const serverConfig = configService.getServerConfig();

        // Trust proxy (for IP addresses in headers)
        this.app.set("trust proxy", 1);

        // Security middleware
        this.app.use(
            helmet({
                contentSecurityPolicy: false, // Allow for API usage
                crossOriginEmbedderPolicy: false, // Not needed for API
                crossOriginResourcePolicy: { policy: "cross-origin" }, // Allow cross-origin requests
            }),
        );

        // CORS middleware
        this.app.use(
            cors({
                origin: serverConfig.cors.origin,
                credentials: serverConfig.cors.credentials,
                methods: serverConfig.cors.methods,
                allowedHeaders: ["Content-Type", "Authorization", "X-API-Key"],
                exposedHeaders: ["X-Total-Count", "X-Page-Count"],
                maxAge: 86400, // 24 hours
            }),
        );

        // Compression middleware
        this.app.use(
            compression({
                filter: (req, res) => {
                    // Don't compress streaming responses
                    if (req.headers["x-no-compression"]) {
                        return false;
                    }
                    return compression.filter(req, res);
                },
            }),
        );

        // Body parsing middleware
        this.app.use(
            express.json({
                limit: this.config.maxRequestSize || "10mb",
            }),
        );
        this.app.use(
            express.urlencoded({
                extended: true,
                limit: this.config.maxRequestSize || "10mb",
            }),
        );

        // Request logging middleware
        this.app.use((req: Request, res: Response, next: NextFunction) => {
            const startTime = Date.now();

            this.logger.info("Incoming request", {
                method: req.method,
                path: req.path,
                ip: req.ip,
                params: req.params,
                body: req.body,
                userAgent: req.get("User-Agent"),
                contentType: req.get("Content-Type"),
            });

            // Log response when finished
            res.on("finish", () => {
                const duration = Date.now() - startTime;
                this.logger.info("Request completed", {
                    method: req.method,
                    path: req.path,
                    status: res.statusCode,
                    contentType: res.get("Content-Type"),
                    duration: `${duration}ms`,
                    ip: req.ip,
                });
            });

            next();
        });

        // Request timeout middleware
        if (this.config.requestTimeout) {
            this.app.use((req: Request, res: Response, next: NextFunction) => {
                req.setTimeout(this.config.requestTimeout!, () => {
                    if (!res.headersSent) {
                        res.status(408).json({
                            success: false,
                            timestamp: new Date().toISOString(),
                            error: "Request timeout",
                            duration: this.config.requestTimeout,
                        });
                    }
                });
                next();
            });
        }
    }

    /**
     * Setup routes
     */
    private setupRoutes(): void {
        // Serve static files from client-demo folder
        const clientDemoPath = path.join(process.cwd(), "client-demo");
        this.app.use("/demo", express.static(clientDemoPath));

        // Mount API routes
        this.app.use("/api", this.routes.getRouter());

        // Handle 404 for unmatched routes
        this.app.use("*", (req: Request, res: Response) => {
            res.status(404).json({
                success: false,
                timestamp: new Date().toISOString(),
                error: "Route not found",
                details: {
                    method: req.method,
                    path: req.originalUrl,
                },
            });
        });
    }

    /**
     * Setup error handlers
     */
    private setupErrorHandlers(): void {
        // Global error handler
        this.app.use((error: Error, req: Request, res: Response) => {
            const errorMessage = error.message || "Internal server error";

            this.logger.error("Express error handler", {
                error: errorMessage,
                stack: error.stack,
                method: req.method,
                path: req.path,
                ip: req.ip,
                ...(error.cause ? { cause: error.cause } : {}),
            });

            if (!res.headersSent) {
                res.status(500).json({
                    success: false,
                    timestamp: new Date().toISOString(),
                    error: "Internal server error",
                    details: {
                        method: req.method,
                        path: req.path,
                    },
                });
            }
        });
    }

    /**
     * Start the HTTP server
     */
    async start(): Promise<void> {
        if (this.isRunning) {
            throw new Error("Server is already running");
        }

        return new Promise((resolve, reject) => {
            try {
                this.logger.info("🚀 Starting Express API server", {
                    port: this.config.port,
                    host: this.config.host,
                });

                this.server = this.app.listen(
                    this.config.port,
                    this.config.host,
                    () => {
                        this.isRunning = true;

                        this.logger.info(
                            "✅ Express API server started successfully",
                            {
                                port: this.config.port,
                                host: this.config.host,
                                url: this.url,
                            },
                        );

                        resolve();
                    },
                );

                this.server.on("error", (error: Error) => {
                    this.logger.error("❌ Failed to start Express server", {
                        error: error.message,
                        port: this.config.port,
                        host: this.config.host,
                    });
                    reject(error);
                });
            } catch (error) {
                this.logger.error("❌ Failed to start API server", {
                    error:
                        error instanceof Error ? error.message : String(error),
                    port: this.config.port,
                    host: this.config.host,
                });
                reject(error);
            }
        });
    }

    /**
     * Stop the HTTP server
     */
    async stop(): Promise<void> {
        if (!this.isRunning || !this.server) {
            return;
        }

        return new Promise((resolve, reject) => {
            this.logger.info("⏹️ Stopping Express API server...");

            this.server?.close((error: Error | undefined) => {
                if (error) {
                    this.logger.error("❌ Error stopping API server", {
                        error: error.message,
                    });
                    reject(error);
                } else {
                    this.isRunning = false;
                    this.logger.info(
                        "✅ Express API server stopped successfully",
                    );
                    resolve();
                }
            });
        });
    }

    /**
     * Check if server is running
     */
    get running(): boolean {
        return this.isRunning;
    }

    /**
     * Get server URL
     */
    get url(): string {
        return `http://${this.config.host}:${this.config.port}`;
    }

    /**
     * Graceful shutdown handling
     */
    setupGracefulShutdown(): void {
        const signals = ["SIGINT", "SIGTERM", "SIGUSR2"] as const;

        for (const signal of signals) {
            process.on(signal, async () => {
                this.logger.info(
                    `⚡ Received ${signal}, initiating graceful shutdown...`,
                );

                try {
                    await this.stop();

                    this.logger.info("👋 Graceful shutdown completed");
                    process.exit(0);
                } catch (error) {
                    this.logger.error("❌ Error during graceful shutdown", {
                        error:
                            error instanceof Error
                                ? error.message
                                : String(error),
                    });
                    process.exit(1);
                }
            });
        }
    }
}
