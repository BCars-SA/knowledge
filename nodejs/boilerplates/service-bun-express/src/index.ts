/**
 * @fileoverview Main entry point
 * Initializes and starts the HTTP API server with all dependencies
 */

import { ApiServer } from "./api/server";
import { ConfigService } from "./config-service";
import { Logger } from "@artemkdr/core";

async function main() {
    const configService = ConfigService.getInstance();
    const logger = new Logger(configService.getLoggingConfig());

    logger.info("🚀 Starting Server");
    logger.info(`🔧 Configuration loaded`, {
        config: configService.getConfig(),
    });

    try {
        // Initialize pipeline runner with all dependencies
        logger.info("⚙️ Initializing...");
         
        
        // Get server configuration
        const serverConfig = configService.getServerConfig();

        logger.info("📋 Server configuration loaded", {
            port: serverConfig.port,
            host: serverConfig.host,
            apiKeyConfigured: !!serverConfig.apiKey,
        });

        // Validate API key configuration
        if (!serverConfig.apiKey) {
            logger.warn(
                "API key is not configured! The server will accept all the requests then.",
            );
        }

        // Create and configure API server
        const apiServer = new ApiServer(
            {
                port: serverConfig.port,
                host: serverConfig.host,
                apiKey: serverConfig.apiKey,
                requestTimeout: 600000, // 10 minutes
                maxRequestSize: "10MB",
            },
            configService,
            logger,
        );

        // Setup graceful shutdown handling
        apiServer.setupGracefulShutdown();

        // Start the server
        await apiServer.start();

        logger.info(
            "🎉 Server is ready!",
        );
        logger.info("📊 Server Details:", {
            url: apiServer.url,
            pid: process.pid,
            nodeVersion: process.version,
            bunVersion: Bun.version,
            environment: process.env.NODE_ENV || "development",
        });

        // Setup cleanup for task pool on shutdown
        process.on("SIGTERM", async () => {
            logger.info("📋 Shutting down services...");
            
        });

        process.on("SIGINT", async () => {
            logger.info("📋 Shutting down services...");
            
        });
    } catch (error) {
        logger.error("💥 Failed to start server", {
            error: error instanceof Error ? error.message : String(error),
            stack: error instanceof Error ? error.stack : undefined,
        });
        process.exit(1);
    }
}

// Handle uncaught exceptions and unhandled rejections
process.on("uncaughtException", (error) => {
    console.error("💥 Uncaught Exception:", error);
    process.exit(1);
});

process.on("unhandledRejection", (reason, promise) => {
    console.error("💥 Unhandled Rejection at:", promise, "reason:", reason);
    process.exit(1);
});

main().catch((error) => {
    console.error("💥 Fatal error occurred:", error);
    process.exit(1);
});
