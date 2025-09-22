import { ConfigurationError } from "@/config-service";
import type { CacheConfig, LLMUseCaseConfig } from "@/lib/types/config";
import { ChatAnthropic } from "@langchain/anthropic";
import { RedisCache } from "@langchain/community/caches/ioredis";
import { ChatFireworks } from "@langchain/community/chat_models/fireworks";
import type { BaseChatModel } from "@langchain/core/language_models/chat_models";
import { sha256 } from "@langchain/core/utils/hash";
import { ChatVertexAI } from "@langchain/google-vertexai";
import { ChatGroq } from "@langchain/groq";
import { ChatOpenAI } from "@langchain/openai";
import Redis, { type RedisOptions } from "ioredis";

const LLM_TEMPERATURE = 0; // For retrieval-augmented generation, we want the model to be as deterministic as possible

export const createChatModel = (
    llmConfig: LLMUseCaseConfig,
    cacheConfig?: CacheConfig,
): BaseChatModel => {
    let cacheClient: RedisCache | undefined ;
    if (cacheConfig !== undefined) {
        cacheClient = new RedisCache(
            new Redis({
                host: cacheConfig.redis.host,
                port: cacheConfig.redis.port,
                password: cacheConfig.redis.password,
                db: cacheConfig.redis.db,
                maxRetriesPerRequest: cacheConfig.redis.maxRetriesPerRequest,
            } as RedisOptions),
            { ttl: cacheConfig.ttl || 3600 },
        );
        cacheClient.makeDefaultKeyEncoder(sha256);
    }
    const modelName = llmConfig.model.name;
    const isTemperatureSupported =
        !modelName.startsWith("gpt-5") && // new models
        !modelName.startsWith("gpt-6") && // new models
        !modelName.startsWith("gpt-7") && // new models
        !modelName.startsWith("o"); // reasoning models

    const config = {
        model: modelName,
        apiKey: llmConfig.provider.apiKey,
        ...(isTemperatureSupported ? { temperature: LLM_TEMPERATURE } : {}),
        ...(cacheClient ? { cache: cacheClient } : {}),
        maxRetries: llmConfig.provider.maxRetries || 1,
        timeout: llmConfig.provider.timeout || 10000,
        ...(llmConfig.model.maxTokens
            ? {
                  maxTokens: llmConfig.model.maxTokens,
                  // Vertex AI uses maxOutputTokens instead of maxTokens
                  maxOutputTokens: llmConfig.model.maxTokens,
              }
            : {}),
        ...(llmConfig.model.topP !== undefined
            ? { topP: llmConfig.model.topP }
            : {}),
        configuration: {
            defaultHeaders: llmConfig.headers,
            ...(llmConfig.provider.baseUrl
                ? { baseURL: llmConfig.provider.baseUrl }
                : {}),
        },
        // Vertex AI specific parameters
        ...(llmConfig.model.location
            ? { location: llmConfig.model.location }
            : {}),
        ...(llmConfig.model.thinkingBudget !== undefined
            ? {
                  thinkingBudget: llmConfig.model.thinkingBudget,
                  includeThoughts: llmConfig.model.thinkingBudget > 0,
              }
            : {}),
    };
    switch (llmConfig.provider.name) {
        case "openai":
            // ATTENTION: reasoning OpenAI models do not support temperature anymore
            return new ChatOpenAI(config);
        case "groq":
            return new ChatGroq(config);
        case "vertexai":
            // Ensure thinkingBudget and includeThoughts are off by default
            if (config.thinkingBudget === undefined) {
                config.includeThoughts = false;
                config.thinkingBudget = 0;
            }
            return new ChatVertexAI(config);
        case "fireworks":
            return new ChatFireworks(config);
        case "anthropic":
            return new ChatAnthropic(config);
        case "openrouter":
            return new ChatOpenAI({
                ...config,
                configuration: {
                    ...config.configuration,
                    baseURL:
                        llmConfig.provider.baseUrl ||
                        "https://openrouter.ai/api/v1",
                },
            });
    }
    throw new ConfigurationError("Unsupported LLM provider");
};
