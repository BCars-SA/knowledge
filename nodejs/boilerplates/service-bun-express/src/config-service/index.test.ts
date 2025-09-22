import { afterEach, beforeEach, describe, expect, it, jest } from "bun:test";
import { ConfigService, ConfigurationError } from "./index";

describe("ConfigService", () => {
    let configService: ConfigService;
    let originalEnv: NodeJS.ProcessEnv;

    beforeEach(() => {
        // Save original environment
        originalEnv = { ...process.env };

        // Set up minimal required environment variables for tests
        process.env = {
            ...originalEnv,
            POSTGRES_PASSWORD: "test-password",
            LLM_CHAT_API_KEY: "test--key",
            LLM_COMMON_API_KEY: "test-common-key",
        };

        // Reset singleton for each test
        // @ts-expect-error We reset the private static instance for testing
        ConfigService.instance = undefined;
    });

    afterEach(() => {
        // Restore original environment
        process.env = originalEnv;

        // Reset singleton
        // @ts-expect-error We reset the private static instance for testing
        ConfigService.instance = undefined;
    });

    describe("Basic Configuration Loading", () => {
        beforeEach(() => {
            configService = ConfigService.getInstance();
        });

        it("should load config and provide AppConfig", () => {
            const config = configService.getConfig();
            expect(config).toBeDefined();
            expect(config.server).toBeDefined();
            expect(config.llm).toBeDefined();
            expect(config.cache).toBeDefined();
            expect(config.logging).toBeDefined();
        });

        // it("should provide database config", () => {
        //     const dbConfig = configService.getDatabaseConfig();
        //     expect(dbConfig).toHaveProperty("host");
        //     expect(dbConfig).toHaveProperty("port");
        //     expect(dbConfig).toHaveProperty("user");
        //     expect(dbConfig).toHaveProperty("password");
        // });

        it("should provide LLM config and use case configs", () => {
            const llmConfig = configService.getLLMConfig();
            expect(llmConfig).toBeDefined();
            expect(configService.getLLMCommonConfig()).toBeDefined();
        });


        it("should provide cache config", () => {
            const cacheConfig = configService.getCacheConfig("embeddings");
            expect(cacheConfig).toHaveProperty("redis");
            expect(cacheConfig).toHaveProperty("ttl");
        });

        it("should provide logging config", () => {
            const loggingConfig = configService.getLoggingConfig();
            expect(loggingConfig).toHaveProperty("level");
            expect(loggingConfig).toHaveProperty("format");
            expect(loggingConfig).toHaveProperty("file");
            expect(loggingConfig).toHaveProperty("console");
        });

        it("should provide server config", () => {
            const serverConfig = configService.getServerConfig();
            expect(serverConfig).toHaveProperty("port");
            expect(serverConfig).toHaveProperty("host");
            expect(serverConfig).toHaveProperty("apiKey");
            expect(serverConfig).toHaveProperty("cors");
            expect(serverConfig).toHaveProperty("rateLimit");
        });

        it("should validate config and return success", () => {
            const result = configService.validate();
            expect(result.success).toBe(true);
            if (!result.success) {
                expect(Array.isArray(result.errors)).toBe(true);
            }
        });
    });

    describe("Environment Variable Loading", () => {
        it("should use default values when environment variables are not set", () => {
            // Create a minimal environment with only required variables
            process.env = {
                POSTGRES_PASSWORD: "test-password",
                LLM_CHAT_API_KEY: "test-chat-key",
                LLM_COMMON_API_KEY: "test-common-key",
                // PORT, HOST, POSTGRES_HOST, POSTGRES_PORT intentionally omitted
            };

            configService = ConfigService.getInstance();
            const config = configService.getConfig();

            expect(config.server.port).toBe(3000);
            expect(config.server.host).toBe("0.0.0.0");
            // expect(config.database.host).toBe("localhost");
            // expect(config.database.port).toBe(5432);
        });

        it("should override defaults with environment variables", () => {
            process.env = {
                ...process.env,
                PORT: "8080",
                HOST: "127.0.0.1",
                POSTGRES_HOST: "db.example.com",
                POSTGRES_PORT: "5433",
            };

            configService = ConfigService.getInstance();
            const config = configService.getConfig();

            expect(config.server.port).toBe(8080);
            expect(config.server.host).toBe("127.0.0.1");
            // expect(config.database.host).toBe("db.example.com");
            // expect(config.database.port).toBe(5433);
        });

        it("should parse boolean environment variables correctly", () => {
            process.env = {
                ...process.env,
                CORS_CREDENTIALS: "false",
                LOG_CONSOLE_ENABLED: "true",
                POSTGRES_SSL: "true",
            };

            configService = ConfigService.getInstance();
            const config = configService.getConfig();

            expect(config.server.cors.credentials).toBe(false);
            expect(config.logging.console.enabled).toBe(true);
            // expect(config.database.ssl).toBe(true);
        });

        it("should split comma-separated values correctly", () => {
            process.env = {
                ...process.env,
                CORS_ORIGIN: "http://localhost:3000,https://example.com",
                CORS_METHODS: "GET,POST,PUT",
            };

            configService = ConfigService.getInstance();
            const config = configService.getConfig();

            expect(config.server.cors.origin).toEqual([
                "http://localhost:3000",
                "https://example.com",
            ]);
            expect(config.server.cors.methods).toEqual(["GET", "POST", "PUT"]);
        });
    });

    describe("Validation Logic", () => {
        it("should throw ConfigurationError for missing required environment variables", () => {
            // Create environment missing a required variable
            process.env = {
                LLM_COMMON_API_KEY: "test-common-key",
                // POSTGRES_PASSWORD missing
            };

            expect(() => {
                ConfigService.getInstance();
            }).toThrow(ConfigurationError);
        });

        it("should throw ConfigurationError for missing LLM config variable", () => {
            // Create environment missing a required variable
            process.env = {
                LLM_COMMON_PROVIDER: "openai",
                //LLM_COMMON_API_KEY: "test-common-key",
                POSTGRES_PASSWORD: "pass",
            };

            expect(() => {
                ConfigService.getInstance();
            }).toThrow(ConfigurationError);
        });

        it("should not throw ConfigurationError for missing VertexAI LLM API key if GOOGLE_APPLICATION_CREDENTIALS is set", () => {
            // Create environment missing a required variable
            process.env = {
                POSTGRES_PASSWORD: "pass",
                LLM_COMMON_PROVIDER: "vertexai",
                LLM_CHAT_API_KEY: "test-embeddings-key",
                GOOGLE_APPLICATION_CREDENTIALS: "/path/to/credentials.json",
                //LLM_COMMON_API_KEY: "test-common-key",
            };

            expect(() => {
                ConfigService.getInstance();
            }).not.toThrow(ConfigurationError);
        });

        it("should throw ConfigurationError for missing VertexAI LLM API key if GOOGLE_APPLICATION_CREDENTIALS is not set", () => {
            // Create environment missing a required variable
            process.env = {
                POSTGRES_PASSWORD: "pass",
                LLM_COMMON_PROVIDER: "vertexai",
                LLM_CHAT_API_KEY: "test-embeddings-key",
                //GOOGLE_APPLICATION_CREDENTIALS: "/path/to/credentials.json",
                //LLM_COMMON_API_KEY: "test-common-key",
            };

            expect(() => {
                ConfigService.getInstance();
            }).toThrow(/missing GOOGLE_APPLICATION_CREDENTIALS/);
        });

        it("should detect TO-SET placeholder values as missing", () => {
            process.env = {
                ...process.env,
                POSTGRES_PASSWORD: "TO-SET-ON-DEPLOYMENT",
            };

            expect(() => {
                ConfigService.getInstance();
            }).toThrow(ConfigurationError);
        });

        // it("should validate database port range", () => {
        //     process.env = {
        //         ...process.env,
        //         POSTGRES_PORT: "99999",
        //     };

        //     expect(() => {
        //         ConfigService.getInstance();
        //     }).toThrow(ConfigurationError);
        // });

        it("should validate server port range", () => {
            process.env = {
                ...process.env,
                PORT: "-1",
            };

            expect(() => {
                ConfigService.getInstance();
            }).toThrow(ConfigurationError);
        });

        it("should throw error for invalid number format", () => {
            process.env = {
                ...process.env,
                PORT: "not-a-number",
            };

            expect(() => {
                ConfigService.getInstance();
            }).toThrow(ConfigurationError);
        });

        it("should validate LLM configuration completeness", () => {
            // Create environment missing LLM API key
            process.env = {
                POSTGRES_PASSWORD: "test-password",
                LLM_COMMON_API_KEY: "test-common-key",
                // LLM_CHAT_API_KEY missing
            };

            expect(() => {
                ConfigService.getInstance();
            }).toThrow(ConfigurationError);
        });

        it("should return validation errors when validate() is called", () => {
            // Create a valid instance first
            configService = ConfigService.getInstance();

            // Now simulate validation failure by modifying config directly
            // @ts-expect-error accessing private property for testing
            configService.config.server.port = 99999;

            const result = configService.validate();
            expect(result.success).toBe(false);
            expect(result.errors).toBeDefined();
            expect(Array.isArray(result.errors)).toBe(true);
            expect(result.errors!.length).toBeGreaterThan(0);
        });
    });

    describe("Error Handling", () => {
        it("should handle ConfigurationError in validate method", () => {
            // Create a service with valid config first
            configService = ConfigService.getInstance();

            // Mock validateConfig to throw ConfigurationError
            const mockValidateConfig = jest
                .spyOn(
                    configService as unknown as {
                        validateConfig: () => void;
                    },
                    "validateConfig",
                )
                .mockImplementation(() => {
                    throw new ConfigurationError("Test error");
                });

            const result = configService.validate();
            expect(result.success).toBe(false);
            expect(result.errors).toEqual(["Test error"]);

            mockValidateConfig.mockRestore();
        });

        it("should handle unknown errors in validate method", () => {
            configService = ConfigService.getInstance();

            // Mock validateConfig to throw generic error
            const mockValidateConfig = jest
                .spyOn(
                    configService as unknown as {
                        validateConfig: () => void;
                    },
                    "validateConfig",
                )
                .mockImplementation(() => {
                    throw new Error("Generic error");
                });

            const result = configService.validate();
            expect(result.success).toBe(false);
            expect(result.errors).toEqual(["Unknown configuration error"]);

            mockValidateConfig.mockRestore();
        });

        it("should throw ConfigurationError for multiple missing variables", () => {
            process.env = {
                TEST: "1",
            };

            expect(() => {
                ConfigService.getInstance();
            }).toThrow(
                /POSTGRES_PASSWORD/,
            );
        });
    });

    describe("Singleton Pattern", () => {
        it("should return the same instance when getInstance is called multiple times", () => {
            const instance1 = ConfigService.getInstance();
            const instance2 = ConfigService.getInstance();

            expect(instance1).toBe(instance2);
        });

        it("should maintain same config across multiple getInstance calls", () => {
            process.env = {
                ...process.env,
                PORT: "9999",
            };

            const instance1 = ConfigService.getInstance();
            const instance2 = ConfigService.getInstance();

            expect(instance1.getServerConfig().port).toBe(9999);
            expect(instance2.getServerConfig().port).toBe(9999);
        });
    });
});
