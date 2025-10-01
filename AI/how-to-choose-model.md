# How to Choose, Evaluate, and Test LLM Models

This guide provides a comprehensive framework for selecting the right Large Language Model (LLM) for your specific needs. By systematically testing and evaluating models, you can make data-driven decisions that balance accuracy, performance, and cost.

## 1. Define Your Evaluation Criteria

Before testing, establish clear metrics to measure model performance. A holistic evaluation considers more than just accuracy.

### Key Performance Metrics

-   **Accuracy Metrics**
    -   **Exact Match Rate**: The percentage of responses that perfectly match the expected output.
    -   **Field-Level Accuracy**: For structured data extraction, this measures the percentage of correctly extracted fields.
    -   **Partial Match Scoring**: Awards credit for partially correct responses, useful for tasks where a "close enough" answer is still valuable.

-   **Performance Metrics**
    -   **Execution Time**: The average time a model takes to generate a response. Critical for real-time applications.
    -   **Throughput**: The number of requests a model can handle per minute.
    -   **Consistency**: The variance in response quality and speed across multiple identical requests.

-   **Cost Metrics**
    -   **Cost per Request**: The expense associated with a single API call, based on input and output tokens.
    -   **Cost per Accurate Result**: A cost-effectiveness ratio that connects expense to quality.
    -   **Total Budget Impact**: Projected costs at scale (e.g., per month).

-   **Reliability Metrics**
    -   **Success Rate**: The percentage of API calls that complete without errors.
    -   **Error Rate & Types**: The frequency and categorization of failures (e.g., API errors, timeouts, malformed outputs).

## 2. Build a Testing Framework

A reusable testing framework is essential for efficient and consistent model evaluation. It should be modular and easy to extend.

### Core Components

A good testing framework, like the one demonstrated in the `kit` directory, includes several key components:

-   **Test Runner (`run-tests.ts`)**: The engine that executes test cases against different models. It should handle API calls, measure performance, calculate costs, and aggregate results.
-   **Test Cases**: A collection of representative inputs and their corresponding expected outputs. These are crucial for measuring accuracy.
-   **Accuracy Utilities**: Functions dedicated to comparing a model's actual output against the expected output. A robust utility can handle deep object comparisons, manage unordered arrays, and penalize unexpected fields. You can include these directly into your test runner or as a separate module as `accuracy-util.ts`.
-   **Cost Calculation Utilities (`llm-providers-pricing.ts`)**: A module that centralizes pricing information for various LLM providers to enable automated cost analysis.
-   **Type Definitions (`interfaces.ts`)**: Standardized interfaces for test cases, results, and model configurations to ensure consistency across the framework.
-   **Output Formatting (`colorize-console.ts`)**: Helper functions to format console output with colors for better readability of test results.

## 3. Configure Your Tests

With a framework in place, you can configure a test suite to compare different models.

### 1. Select Models to Test

Create a configuration array that defines the models you want to evaluate. This allows you to easily add or remove models and adjust their parameters. The example from `test-car-keywords-extraction.ts` shows how to structure this:

```typescript
// LLM model configurations to test
const LLM_MODELS_TO_TEST: Array<{ config: LLMUseCaseConfig }> = [
    {
        config: {
            provider: {
                name: "inception",
                apiKey: process.env.INCEPTION_API_KEY || "test-api-key",
            } as LLMProviderConfig,
            model: {
                name: "mercury",
                maxTokens: 512,
            } as LLMModelConfig,
        },
    },
    {
        config: {
            provider: {
                name: "vertexai",
            } as LLMProviderConfig,
            model: {
                name: "gemini-2.5-flash",
                maxTokens: 512,
                thinkingBudget: 0,
                location: "europe-west2",
            } as LLMModelConfig,
        },
    },
    // ... more models
];
```

### 2. Design High-Quality Test Cases

Your test cases are the foundation of your evaluation. They should be diverse and representative of real-world usage.

-   **Include a variety of scenarios**: Cover simple, complex, and multi-criteria inputs.
-   **Test edge cases**: Use ambiguous, incomplete, or malformed inputs to see how models handle them.
-   **Use real data**: Whenever possible, source test cases from actual user data or production logs.

## 4. Run Tests and Interpret Results

Execute your test suite and analyze the aggregated results. A good test runner will provide a summary that makes it easy to compare models across all your defined criteria.

### Example Test Output

```
🧪 Starting LLM Extraction Test

📊 Testing Model: provider:model-name-1
✅ Test 1/10: "input query 1" - Accuracy: 95% (120ms, $0.0032)
❌ Test 2/10: "input query 2" - Accuracy: 67% (156ms, $0.0045)
...

📈 Final Results Summary:
Model: provider:model-name-1
- Average Accuracy: 87.3%
- Average Execution Time: 134ms
- Total Token Cost: $0.0423
- Success Rate: 100%
```

## 5. Best Practices for Model Selection and Testing

-   **Start with Cost-Effective Models**: Use cheaper, faster models during initial development and for less critical tasks.
-   **Use High-Accuracy Models for Production**: Reserve more powerful (and expensive) models for production use cases where quality is paramount.
-   **Consider Speed Requirements**: For real-time applications, prioritize models with low latency.
-   **Monitor Token Usage**: Keep a close eye on token consumption to manage costs effectively. Adjust `max_tokens` to match the expected output length.
-   **Iterate and Refine**: Model selection is not a one-time task. Continuously test new models and refine your test cases as your application evolves.
-   **Integrate into CI/CD**: Automate your LLM tests in your continuous integration pipeline to catch regressions and evaluate model changes before they reach production.
