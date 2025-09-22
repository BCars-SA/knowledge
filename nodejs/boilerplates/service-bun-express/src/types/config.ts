import type {
    LLMUseCaseConfig,
    RedisConfig,
    ServerConfig
} from "@/lib/types/config";
import type { LoggingConfig } from "@artemkdr/core";

// Configuration type
export interface AppConfig {
    readonly server: ServerConfig;
    readonly llm: LLMConfig;
    readonly cache: {
        redis: RedisConfig;
        ttl: { [key: string]: number }; // in seconds
    };
    readonly logging: LoggingConfig;
}


export interface LLMConfig {
    readonly common: LLMUseCaseConfig;
    readonly chat: LLMUseCaseConfig;
}
