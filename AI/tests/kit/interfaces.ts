// Test query definitions extracted from search.http
export interface TestCase {
    id: string;
    query: string;
    expectedOutput?: unknown;
}

export interface IResult {
    success: boolean;
}

// Test result interfaces
export interface TestResult<T extends IResult> {
    testCase: TestCase;
    providerName: string;
    modelName: string;
    result: T;
    accuracy: number;
    executionTime: number;
    tokenCost: number;
    errors: string[];
}

export interface ModelTestSummary {
    modelName: string;
    providerName: string;
    totalTests: number;
    successfulTests: number;
    averageAccuracy: number;
    averageExecutionTime: number;
    totalTokenCost: number;
    errorRate: number;
    errors: string[];
}

export interface ILLMConfig {
    provider: {
        name: string;
        apiKey?: string;
    };
    model: {
        name: string;
        temperature?: number;
        maxTokens?: number;
    };
}
