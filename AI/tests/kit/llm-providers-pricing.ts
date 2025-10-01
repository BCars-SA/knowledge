export const PROVIDERS_MODELS_COSTS: Record<
    string,
    Record<string, { input: number; output: number }>
> = {
    openai: {
        "gpt-4o": { input: 0.0025, output: 0.01 },
        "gpt-4o-mini": { input: 0.00015, output: 0.0006 },
    }, // per 1K tokens
    groq: {
        "llama-3.3-70b-versatile": { input: 0.00059, output: 0.00079 },
        "llama-3.1-8b-instant": { input: 0.00005, output: 0.00008 },
        "llama3-8b-8192": { input: 0.00005, output: 0.00008 },
        "openai/gpt-oss-120b": { input: 0.00015, output: 0.00075 },
        "openai/gpt-oss-20b": { input: 0.0001, output: 0.0005 },
    },
    fireworks: {
        "accounts/fireworks/models/llama4-scout-instruct-basic": {
            input: 0.00015,
            output: 0.0006,
        },
        "accounts/fireworks/models/llama-v3p1-8b-instruct": {
            input: 0.0002,
            output: 0.0002,
        },
        "accounts/fireworks/models/llama4-maverick-instruct-basic": {
            input: 0.00022,
            output: 0.00088,
        },
        "accounts/fireworks/models/gpt-oss-20b": {
            input: 0.00007,
            output: 0.0003,
        },
        "accounts/fireworks/models/gpt-oss-120b": {
            input: 0.00015,
            output: 0.0006,
        },
        "accounts/fireworks/models/kimi-k2-instruct-0905": {
            input: 0.0006,
            output: 0.0025,
        },
    },
    anthropic: {
        "claude-3-haiku-20240307": { input: 0.00025, output: 0.00125 },
        "claude-3-5-haiku-20241022": { input: 0.0008, output: 0.004 },
    },
    openrouter: {
        "gpt-4o-2024-08-06": { input: 0.0025, output: 0.01 },

        "qwen/qwen3-next-80b-a3b-instruct": { input: 0.0001, output: 0.0008 },

        "google/gemini-2.5-flash-image-preview": {
            input: 0.0003,
            output: 0.0025,
        },
        "google/gemini-2.5-flash": { input: 0.0003, output: 0.0025 },
        "google/gemini-flash-1.5-8b": { input: 0.000038, output: 0.00015 },

        "meta-llama/llama-4-maverick": { input: 0.00015, output: 0.0006 },

        "anthropic/claude-sonnet-4": { input: 0.003, output: 0.015 },

        "moonshotai/kimi-k2-0905": { input: 0.00038, output: 0.00152 },
    },
    vertexai: {
        "gemini-2.5-flash": { input: 0.0003, output: 0.0003 },
    },
};

// Token cost calculation (approximate)
export function calculateTokenCost(
    providerName: string,
    modelName: string,
    inputTokens: number,
    outputTokens: number,
): number {
    const modelPricing = PROVIDERS_MODELS_COSTS[providerName]?.[modelName] || {
        input: 0,
        output: 0,
    };
    return (
        (inputTokens * modelPricing.input) / 1000 +
        (outputTokens * modelPricing.output) / 1000
    );
}
