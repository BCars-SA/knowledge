import type {
    CacheConfig,
    LLMProviderType,
    LLMUseCaseConfig,
    ServerConfig,
} from "@/lib/types/config";
import type { LogFormat, LogLevel, LoggingConfig } from "@artemkdr/core";
import type {
    AppConfig,
    LLMConfig,
    } from "@/types/config";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

export interface IConfigService {
    getConfig(): AppConfig;
    getLLMConfig(): LLMConfig;
    getLLMCommonConfig(): LLMUseCaseConfig;
    getLoggingConfig(): LoggingConfig;
    getServerConfig(): ServerConfig;
    validate(): { success: boolean; errors?: string[] };
}

export class ConfigService implements IConfigService {
    private static instance: ConfigService;
    private config: AppConfig;

    private constructor() {
        this.config = this.loadConfig();
        this.validateConfig();
    }

    static getInstance(): ConfigService {
        if (!ConfigService.instance) {
            ConfigService.instance = new ConfigService();
        }
        return ConfigService.instance;
    }

    validate(): { success: boolean; errors?: string[] } {
        try {
            this.validateConfig();
            return { success: true };
        } catch (error) {
            if (error instanceof ConfigurationError) {
                return { success: false, errors: [error.message] };
            }
            return { success: false, errors: ["Unknown configuration error"] };
        }
    }

    getConfig(): AppConfig {
        return this.config;
    }

    getLLMConfig(): LLMConfig {
        return this.config.llm;
    }

    getLLMCommonConfig(): LLMUseCaseConfig {
        return this.config.llm.common;
    }

    getCacheConfig(key: string): CacheConfig {
        return {
            redis: this.config.cache.redis,
            ttl: this.config.cache.ttl[key] || 3600,
        } as CacheConfig;
    }

    getLoggingConfig(): LoggingConfig {
        return this.config.logging;
    }

    getServerConfig() {
        return this.config.server;
    }

    private loadConfig(): AppConfig {
        return {
            server: {
                port: this.getEnvNumber("PORT", 3000),
                host: this.getEnvString("HOST", "0.0.0.0"),
                apiKey: this.getEnvString("API_KEY", ""),
                cors: {
                    origin: this.getEnvString(
                        "CORS_ORIGIN",
                        "http://localhost:3000",
                    ).split(","),
                    credentials: this.getEnvBoolean("CORS_CREDENTIALS", true),
                    methods: this.getEnvString(
                        "CORS_METHODS",
                        "GET,POST,PUT,DELETE,OPTIONS",
                    ).split(","),
                },
                rateLimit: {
                    windowMs: this.getEnvNumber("RATE_LIMIT_WINDOW_MS", 900000),
                    maxRequests: this.getEnvNumber(
                        "RATE_LIMIT_MAX_REQUESTS",
                        100,
                    ),
                    skipSuccessfulRequests: this.getEnvBoolean(
                        "RATE_LIMIT_SKIP_SUCCESSFUL",
                        false,
                    ),
                },
            },
            llm: this.loadLLMConfig(),
            cache: {
                redis: {
                    host: this.getEnvString("REDIS_HOST", "localhost"),
                    port: this.getEnvNumber("REDIS_PORT", 6379),
                    password: this.getEnvString("REDIS_PASSWORD", ""),
                    db: this.getEnvNumber("REDIS_DB", 0),
                    maxRetriesPerRequest: this.getEnvNumber(
                        "REDIS_MAX_RETRIES",
                        3,
                    ),
                },
                ttl: {
                    embeddings: this.getEnvNumber("CACHE_TTL_EMBEDDINGS", 3600),
                    filtersExtractor: this.getEnvNumber(
                        "CACHE_TTL_FILTERS_EXTRACTOR",
                        3600,
                    ),
                    keywordsExtractor: this.getEnvNumber(
                        "CACHE_TTL_KEYWORDS_EXTRACTOR",
                        3600 * 24 * 30,
                    ),
                },
            },
            logging: {
                level: this.getEnvString("LOG_LEVEL", "info") as LogLevel,
                format: this.getEnvString("LOG_FORMAT", "json") as LogFormat,
                file: {
                    enabled: this.getEnvBoolean("LOG_FILE_ENABLED", true),
                    filename: this.getEnvString(
                        "LOG_FILE_NAME",
                        "my-super-service.log",
                    ),
                    maxSize: this.getEnvString("LOG_FILE_MAX_SIZE", "10m"),
                    maxFiles: this.getEnvNumber("LOG_FILE_MAX_FILES", 5),
                },
                console: {
                    enabled: this.getEnvBoolean("LOG_CONSOLE_ENABLED", true),
                    colorize: this.getEnvBoolean("LOG_CONSOLE_COLORIZE", true),
                },
                masking: {
                    enabled: this.getEnvBoolean("LOG_MASKING_ENABLED", true),
                    maskString: this.getEnvString(
                        "LOG_MASKING_STRING",
                        "***MASKED***",
                    ),
                    customPatterns: this.getEnvString(
                        "LOG_MASKING_CUSTOM_PATTERNS",
                        "",
                    )
                        .split(",")
                        .filter((pattern) => pattern.trim().length > 0),
                },
            },
        };
    }

    private loadLLMConfig(): LLMConfig {
        return {
            common: this.loadUseCaseLLMConfig("LLM_COMMON"),
            chat: this.loadUseCaseLLMConfig("LLM_CHAT"),
        };
    }

    private loadUseCaseLLMConfig(
        prefix: string,
        embeddings = false,
    ): LLMUseCaseConfig {
        return {
            provider: {
                name: this.getEnvString(
                    `${prefix}_PROVIDER`,
                    "openai",
                ) as LLMProviderType,
                apiKey: this.getEnvString(`${prefix}_API_KEY`, ""),
                baseUrl: this.getEnvString(`${prefix}_BASE_URL`, ""),
                timeout: this.getEnvNumber(`${prefix}_TIMEOUT`, 10000),
                rateLimitDelay: this.getEnvNumber(
                    `${prefix}_RATE_LIMIT_DELAY`,
                    0,
                ),
                maxRetries: this.getEnvNumber(`${prefix}_MAX_RETRIES`, 1),
            },
            model: {
                name: this.getEnvString(`${prefix}_MODEL`, "gpt-4"),
                maxTokens: this.getEnvNumber(`${prefix}_MAX_TOKENS`, 2048),
                temperature: this.getEnvNumber(`${prefix}_TEMPERATURE`, 0),
                headers: {
                    "HTTP-Referer": this.getEnvString(
                        `${prefix}_HEADERS_HTTP_REFERER`,
                        "https://my-super-service.com",
                    ),
                    "X-Title": this.getEnvString(
                        `${prefix}_HEADERS_X_TITLE`,
                        "My Super Service",
                    ),
                },
                ...(embeddings && {
                    dimensions: this.getEnvNumber(`${prefix}_DIMENSIONS`, 1536),
                    batchSize: this.getEnvNumber(`${prefix}_BATCH_SIZE`, 100),
                }),
                ...(this.getEnvNumber(`${prefix}_TOP_P`, -1) >= 0 && {
                    topP: this.getEnvNumber(`${prefix}_TOP_P`),
                }),
                ...(this.getEnvNumber(`${prefix}_THINKING_BUDGET`, -1) >= 0 && {
                    thinkingBudget: this.getEnvNumber(
                        `${prefix}_THINKING_BUDGET`,
                    ),
                }),
                ...(this.getEnvString(`${prefix}_LOCATION`, "") && {
                    location: this.getEnvString(`${prefix}_LOCATION`, ""),
                }),
            },
        };
    }

    private validateConfig(): void {
        const requiredEnvVars = ["POSTGRES_PASSWORD"];

        const missing = requiredEnvVars.filter(
            (envVar) =>
                !process.env[envVar] || process.env[envVar]?.match(/TO.*SET/),
        );

        if (missing.length > 0) {
            throw new ConfigurationError(
                `Missing required environment variables: ${missing.join(", ")}`,
            );
        }

        // Validate LLM configuration
        this.validateLLMConfig();

        // Validate server configuration
        if (this.config.server.port < 1 || this.config.server.port > 65535) {
            throw new ConfigurationError("Invalid server port");
        }
    }

    private validateLLMConfig(): void {
        const llmConfig = this.config.llm;

        // Validate that referenced providers exist
        this.validateUseCaseProvider(
            "chat",
            llmConfig.chat,
        );
        this.validateUseCaseProvider("common", llmConfig.common);
    }

    private validateUseCaseProvider(
        useCase: string,
        config: LLMUseCaseConfig,
    ): void {
        if (!config.model?.name) {
            throw new ConfigurationError(
                `LLM ${useCase} configuration is missing model name`,
            );
        }

        if (!config.provider?.name) {
            throw new ConfigurationError(
                `LLM ${useCase} configuration is missing provider name`,
            );
        }

        if (config.provider.name === "vertexai") {
            // check if GOOGLE_APPLICATION_CREDENTIALS is set
            if (!process.env["GOOGLE_APPLICATION_CREDENTIALS"]) {
                throw new ConfigurationError(
                    `LLM ${useCase} configuration is missing GOOGLE_APPLICATION_CREDENTIALS environment variable for Vertex AI provider`,
                );
            }
        } else if (!config.provider?.apiKey) {
            throw new ConfigurationError(
                `LLM ${useCase} configuration is missing provider API key`,
            );
        }

        switch (useCase) {
            case "embeddings":
                if (!config.model?.dimensions) {
                    throw new ConfigurationError(
                        `LLM ${useCase} configuration is missing model dimensions`,
                    );
                }
                if (!config.model?.batchSize) {
                    throw new ConfigurationError(
                        `LLM ${useCase} configuration is missing model batch size`,
                    );
                }
                break;
        }
    }

    private getEnvString(key: string, defaultValue?: string): string {
        const value = process.env[key];
        if (value === undefined) {
            if (defaultValue !== undefined) {
                return defaultValue;
            }
            throw new ConfigurationError(
                `Environment variable ${key} is required`,
            );
        }
        return value;
    }

    private getEnvNumber(key: string, defaultValue?: number): number {
        const value = process.env[key];
        if (value === undefined) {
            if (defaultValue !== undefined) {
                return defaultValue;
            }
            throw new ConfigurationError(
                `Environment variable ${key} is required`,
            );
        }

        const numValue = parseInt(value, 10);
        if (Number.isNaN(numValue)) {
            throw new ConfigurationError(
                `Environment variable ${key} must be a number`,
            );
        }

        return numValue;
    }

    private getEnvBoolean(key: string, defaultValue?: boolean): boolean {
        const value = process.env[key];
        if (value === undefined) {
            if (defaultValue !== undefined) {
                return defaultValue;
            }
            throw new ConfigurationError(
                `Environment variable ${key} is required`,
            );
        }

        return value.toLowerCase() === "true";
    }
}

export class ConfigurationError extends Error {
    constructor(message: string) {
        super(message);
        this.name = "ConfigurationError";
    }
}
