# LLM Testing Framework

This framework provides a standardized way to test, evaluate, and compare the performance of various Large Language Model (LLM) providers and models for specific use cases. It measures key metrics such as accuracy, processing speed, and cost, allowing developers to make data-driven decisions when choosing an LLM.

The main idea is to have a test runner that can take different LLM configurations and apply them to a specific AI task, comparing the results against a predefined set of expectations.

This kit is designed to test concrete results for a specific AI task (for example, keywords extraction).
So it's easy to implement accuracy calculation for the task.
In the case when the task generates different results each time (like text generation), you have to use another simple LLM or semantic comparator (embedding-based) to evaluate the results.

## Folder Structure

The testing framework is organized as follows:

```
AI/tests/
├── kit/                    # Core testing utilities and interfaces
│   ├── colorize-console.ts # Utilities for colorizing console output.
│   ├── interfaces.ts       # TypeScript interfaces for models, providers, and test cases.
│   ├── llm-providers-pricing.ts # Pricing data for various LLM providers.
│   └── run-tests.ts        # The main test runner script.
│
├── accuracy-util.ts        # Utilities for calculating test accuracy.
├── test-car-keywords-extraction.ts # An example test script for a car keyword extraction task.
└── readme.md               # This file.
```

## Key Components

-   **Test Runner (`kit/run-tests.ts`)**: The engine that orchestrates the tests. It iterates through the defined LLM models and test cases, executes the task, and collects performance metrics.
-   **Interfaces (`kit/interfaces.ts`)**: Defines the core data structures, such as `LLMProviderConfig`, `LLMModelConfig`, and `TestCase`, ensuring consistency across tests.
-   **Example Test (`test-car-keywords-extraction.ts`)**: A practical example demonstrating how to test multiple LLMs (e.g., Inception, VertexAI) for a keyword extraction task. It serves as a template for creating new tests.
-   **Accuracy Utilities (`accuracy-util.ts`)**: Provides helper functions to compare the LLM's output with the expected outcome and calculate an accuracy score. This can be customized for each task's specific needs.

## How we run the test

1.  **Set Up Environment Variables**:
    ```env
    # .env
    INCEPTION_API_KEY="your-inception-api-key"
    VERTEXAI_API_KEY="your-vertexai-api-key"
    # Add other provider keys as needed
    ```

2. **Implement a class running AI task**:
    In this example we have our `KeywordsExtractor` class that encapsulates the logic for the keyword extraction task. All the logic for config loading, prompt construction, and response parsing is contained within this class.
    ```typescript
    const extractor = new KeywordsExtractor(config);
    ```

3.  **Execute the Test Script**:
    Run the example test using `bun`. The script will execute the test cases against each configured LLM and print a detailed report to the console.

    ```sh
    bun run AI/tests/test-car-keywords-extraction.ts
    ```

## How to Create a New Test

To evaluate LLMs for a new task, you can create a new test script by following the structure of `test-car-keywords-extraction.ts`.

1.  **Create the Test File**:
    Create a new file, for example, `my-new-task.test.ts`, inside the `AI/tests/` directory.

2.  **Define the Task Logic**:
    The core of your test is the logic that interacts with the LLM. In the provided example, this logic is encapsulated within the test file itself, but for more complex scenarios, you would have a dedicated class or module that performs the AI task (e.g., summarization, classification, data extraction). This class would be responsible for taking an input and returning a structured output from the LLM.

    The abstraction is key: your task-specific class handles all direct interaction with the LLM provider's API. The test framework only needs to be able to pass a configuration to it and receive a result.

3.  **Configure Models to Test**:
    In your new test file, define an array of `LLM_MODELS_TO_TEST`, specifying the provider, model name, and any other parameters (like `maxTokens`).

4.  **Define Test Cases**:
    Create an array of `TEST_CASES`, where each object contains an `input` for the LLM and an `expected` output to measure accuracy against.

5.  **Adapt Accuracy Calculation**:
    The definition of "accuracy" can vary greatly between tasks. You may need to create custom logic to compare the `expected` value with the actual `output` from the LLM. For example, for a keyword extraction task, you might check for the presence of certain keywords, while for a summarization task, you might use a different metric. You can add new functions to `accuracy-util.ts` or create your own utility file.

6.  **Run the Test**:
    Use the `runAllTests` function from `kit/run-tests.ts`, passing your models, test cases, and task execution logic.


## Example of a real test from our RAG pipeline project

### Keywords extraction model selection

#### First stack of models (5 tests X 10 times each)

| Model                                                              | Accuracy % | Avg Time (ms) | Total Cost ($) |
|--------------------------------------------------------------------|------------|---------------|----------------|
| fireworks:accounts/fireworks/models/kimi-k2-instruct-0905           | 84.8       | 1394          | 0.0125         |
| groq:openai/gpt-oss-120b                                            | 83.1       | 3109          | 0.0032         |
| fireworks:accounts/fireworks/models/llama4-maverick-instruct-basic  | 81.5       | 1107          | 0.0045         |
| groq:openai/gpt-oss-20b                                             | 80.8       | 3140          | 0.0021         |
| groq:llama-3.3-70b-versatile                                        | 77.4       | 911           | 0.0100         |
| fireworks:accounts/fireworks/models/llama4-scout-instruct-basic     | 75.9       | 904           | 0.0031         |
| openai:gpt-4o-mini                                                  | 74.5       | 1977          | 0.0032         |
| fireworks:accounts/fireworks/models/gpt-oss-120b                    | 70.7       | 9105          | 0.0031         |
| anthropic:claude-3-5-haiku-20241022                                 | 60.1       | 3330          | 0.0166         |
| groq:llama-3.1-8b-instant                                           | 49.1       | 666           | 0.0010         |
| anthropic:claude-3-haiku-20240307                                   | 22.1       | 2215          | 0.0054         |


#### Second stack of models (5 tests X 3 times each)

| Model                                              | Accuracy % | Avg Time (ms) | Total Cost ($) |
|----------------------------------------------------|------------|---------------|----------------|
| openrouter:anthropic/claude-sonnet-4               | 90.8       | 4614          | 0.0852         |
| openrouter:google/gemini-2.5-flash-image-preview   | 87.1       | 2503          | 0.0076         |
| openrouter:google/gemini-2.5-flash                 | 86.7       | 1106          | 0.0074         |
| **vertexai:gemini-2.5-flash** (west2, no thinking) | 86.5       | 531           | 0.0064         |
| openrouter:meta-llama/llama-4-maverick             | 84.0       | 1426          | 0.0034         |
| **openrouter:qwen/qwen3-next-80b-a3b-instruct**    | 83.9       | 1188          | 0.0027         |
| openrouter:moonshotai/kimi-k2-0905                 | 82.9       | 1177          | 0.0097         |
| openrouter:gpt-4o-2024-08-06                       | 77.7       | 1769          | 0.0552         |
| openrouter:google/gemini-flash-1.5                 | 73.9       | 1702          | 0.0073         |
| openrouter:google/gemini-flash-1.5-8b              | 71.6       | 963           | 0.0009         |


#### Conclusion

For keywords extraction, the top-performing models are:

- **vertexai:gemini-2.5-flash** (86.5% accuracy, fast and reasonbly priced)
- **openrouter:meta-llama/llama-4-maverick** (84% accuracy, fast and twice cheaper than Gemini 2.5 Flash)
- **openrouter:qwen/qwen3-next-80b-a3b-instruct** (84% accuracy, fast and a little bet cheaper than Maverick)
- **openrouter:anthropic/claude-sonnet-4** (91% accuracy but slow and expensive)

The winner is **vertexai:gemini-2.5-flash** for our case because it's fast and here the calculation doesn't take into account automatic VertexAI system prompt caching that can significantly reduces the final costs.
We can use as a fallback **openrouter:qwen/qwen3-next-80b-a3b-instruct** / **openrouter:meta-llama/llama-4-maverick**.