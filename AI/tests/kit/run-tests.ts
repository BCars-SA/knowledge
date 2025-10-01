import { colorizeConsole, consoleColors } from "./colorize-console";
import type {
    ILLMConfig,
    IResult,
    ModelTestSummary,
    TestCase,
    TestResult,
} from "./interfaces";

// Universal test runner: accepts a testAction function
export async function runAllTests<TResult extends IResult>({
    models,
    testCases,
    testAction,
    runnerName = "Universal Test Runner",
    timesPerTest = 3, // Set to >1 to run each test multiple times for averaging
    delay = 0,
    getResultOutput,
}: {
    models: Array<{ config: ILLMConfig }>;
    testCases: Array<TestCase>;
    testAction: (
        testCase: TestCase,
        modelConfig: ILLMConfig,
    ) => Promise<TestResult<TResult>>;
    runnerName?: string;
    timesPerTest?: number;
    delay?: number;
    getResultOutput?: (result: TResult) => unknown;
}) {
    console.log(
        colorizeConsole(
            consoleColors.blue,
            `🧪 Starting ${runnerName}\n`,
            true,
        ),
    );

    const allResults: TestResult<TResult>[] = [];

    for (const { config } of models) {
        const providerName = config.provider?.name;
        const modelName = config.model?.name;
        console.log(
            colorizeConsole(
                consoleColors.yellow,
                `\n📊 Testing Model: ${providerName}:${modelName}`,
                true,
            ),
        );
        console.log(colorizeConsole(consoleColors.gray, "─".repeat(50)));

        const modelResults: TestResult<TResult>[] = [];

        for (const testCase of testCases) {
            console.log(
                colorizeConsole(
                    consoleColors.gray,
                    `Running ${testCase.query?.slice(0, 100) ?? testCase.id}... `,
                ),
            );

            try {
                const results: TestResult<TResult>[] = [];
                for (let i = 0; i < timesPerTest; i++) {
                    const result = await testAction(testCase, config);
                    results.push(result);
                    if (delay > 0) {
                        await new Promise((resolve) =>
                            setTimeout(resolve, delay),
                        );
                    }
                }
                const averagedResult = averageTestResults(results);
                modelResults.push(averagedResult);
                allResults.push(averagedResult);

                const statusIcon =
                    averagedResult.accuracy >= 0.8
                        ? "✅"
                        : averagedResult.accuracy >= 0.5
                          ? "⚠️"
                          : "❌";
                const accuracyStr = (averagedResult.accuracy * 100).toFixed(1);
                console.log(
                    `${statusIcon} ${accuracyStr}% (${averagedResult.executionTime}ms)`,
                );
                if (averagedResult.accuracy < 1 && getResultOutput) {
                    console.log(
                        colorizeConsole(
                            consoleColors.red,
                            `   Expected: ${JSON.stringify(testCase.expectedOutput)}`,
                        ),
                    );
                    console.log(
                        colorizeConsole(
                            consoleColors.red,
                            `   Got:      ${JSON.stringify(getResultOutput(averagedResult.result))}`,
                        ),
                    );
                }
            } catch (error) {
                console.log(
                    colorizeConsole(consoleColors.red, `❌ Error: ${error}`),
                );
            }
        }

        // Generate model summary
        const summary = generateModelSummary(
            providerName,
            modelName,
            modelResults,
        );
        printModelSummary(summary);
    }

    // Generate and print overall comparison
    console.log(
        colorizeConsole(consoleColors.blue, "\n📈 Overall Comparison", true),
    );
    console.log(colorizeConsole(consoleColors.gray, "=".repeat(70)));
    printOverallComparison(allResults, models);
}

function averageTestResults<T extends IResult>(
    results: TestResult<T>[],
): TestResult<T> {
    const total = results.length;
    if (total === 0) {
        throw new Error("No results to average");
    }

    const summedResult = results.reduce(
        (acc, curr) => {
            acc.accuracy += curr.accuracy;
            acc.executionTime += curr.executionTime;
            acc.tokenCost += curr.tokenCost;
            acc.errors.push(...curr.errors);
            return acc;
        },
        {
            ...results[0],
            accuracy: 0,
            executionTime: 0,
            tokenCost: 0,
            errors: [] as string[],
        },
    );

    // if avg accuracy < 1, then we have to take as a result one that is not fully accurate
    if (summedResult.accuracy / total < 1) {
        const firstFailed = results.find((r) => r.accuracy < 1);
        if (firstFailed) {
            summedResult.result = firstFailed.result;
        }
    }

    return {
        ...summedResult,
        accuracy: summedResult.accuracy / total,
        executionTime: summedResult.executionTime / total,
        tokenCost: summedResult.tokenCost / total,
        errors: Array.from(new Set(summedResult.errors)), // Unique errors
    };
}

// Generate model summary
function generateModelSummary<TResult extends IResult>(
    providerName: string,
    modelName: string,
    results: TestResult<TResult>[],
): ModelTestSummary {
    const totalTests = results.length;
    const successfulTests = results.filter((r) => r.result?.success).length;
    const averageAccuracy =
        results.reduce((sum, r) => sum + r.accuracy, 0) / totalTests;
    const averageExecutionTime =
        results.reduce((sum, r) => sum + r.executionTime, 0) / totalTests;
    const totalTokenCost = results.reduce((sum, r) => sum + r.tokenCost, 0);
    const errorRate = (totalTests - successfulTests) / totalTests;
    const errors = results.flatMap((r) => r.errors);

    return {
        modelName,
        providerName,
        totalTests,
        successfulTests,
        averageAccuracy,
        averageExecutionTime,
        totalTokenCost,
        errorRate,
        errors,
    };
}

// Print model summary
function printModelSummary(summary: ModelTestSummary): void {
    console.log(
        colorizeConsole(
            consoleColors.cyan,
            `\n📋 ${summary.providerName}:${summary.modelName} Summary:`,
            true,
        ),
    );
    console.log(
        `   Success Rate: ${colorizeConsole(consoleColors.green, `${((summary.successfulTests / summary.totalTests) * 100).toFixed(1)}%`)}`,
    );
    console.log(
        `   Average Accuracy: ${colorizeConsole(consoleColors.blue, `${(summary.averageAccuracy * 100).toFixed(1)}%`)}`,
    );
    console.log(
        `   Average Time: ${colorizeConsole(consoleColors.yellow, `${summary.averageExecutionTime.toFixed(0)}ms`)}`,
    );
    console.log(
        `   Total Cost: ${colorizeConsole(consoleColors.magenta, `$${summary.totalTokenCost.toFixed(4)}`)}`,
    );

    if (summary.errors.length > 0) {
        console.log(
            colorizeConsole(
                consoleColors.red,
                `   Errors: ${summary.errors.length}`,
            ),
        );
    }
}

// Print overall comparison
function printOverallComparison<TResult extends IResult>(
    allResults: TestResult<TResult>[],
    models: Array<{ config: ILLMConfig }>,
): void {
    const modelSummaries = models.map(({ config }) => {
        const modelName = config.model?.name ?? "unknown";
        const providerName = config.provider?.name ?? "unknown";
        const modelResults = allResults.filter(
            (r) => r.providerName === providerName && r.modelName === modelName,
        );
        return generateModelSummary(providerName, modelName, modelResults);
    });

    // Sort by accuracy
    modelSummaries.sort(
        (a: ModelTestSummary, b: ModelTestSummary) =>
            b.averageAccuracy - a.averageAccuracy,
    );

    console.table(
        modelSummaries.map((s: ModelTestSummary) => ({
            Model: `${s.providerName}:${s.modelName}`,
            "Success %": ((s.successfulTests / s.totalTests) * 100).toFixed(1),
            "Accuracy %": (s.averageAccuracy * 100).toFixed(1),
            "Avg Time (ms)": s.averageExecutionTime.toFixed(0),
            "Total Cost ($)": s.totalTokenCost.toFixed(4),
            Errors: s.errors.length,
        })),
    );

    // Recommendations
    console.log(
        colorizeConsole(consoleColors.green, "\n🏆 Recommendations:", true),
    );
    const bestAccuracy = modelSummaries[0];
    const fastestModel = modelSummaries.reduce(
        (min: ModelTestSummary, current: ModelTestSummary) =>
            current.averageExecutionTime < min.averageExecutionTime
                ? current
                : min,
    );
    const cheapestModel = modelSummaries.reduce(
        (min: ModelTestSummary, current: ModelTestSummary) =>
            current.totalTokenCost < min.totalTokenCost ? current : min,
    );

    console.log(
        `   🎯 Best Accuracy: ${colorizeConsole(consoleColors.yellow, `${bestAccuracy.providerName}:${bestAccuracy.modelName}`)} (${(bestAccuracy.averageAccuracy * 100).toFixed(1)}%)`,
    );
    console.log(
        `   ⚡ Fastest: ${colorizeConsole(consoleColors.yellow, `${fastestModel.providerName}:${fastestModel.modelName}`)} (${fastestModel.averageExecutionTime.toFixed(0)}ms avg)`,
    );
    console.log(
        `   💰 Most Cost-Effective: ${colorizeConsole(consoleColors.yellow, `${cheapestModel.providerName}:${cheapestModel.modelName}`)} ($${cheapestModel.totalTokenCost.toFixed(4)})`,
    );
}
