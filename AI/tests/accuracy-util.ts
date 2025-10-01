// Accuracy calculation function
export const calculateAccuracy = (
    expected: Record<string, unknown>,
    actual: Record<string, unknown>,
): number => {
    let matches = 0;

    let total = Object.keys(expected).length;

    for (const [key, expectedValue] of Object.entries(expected)) {
        const actualValue = actual[key];
        if (deepEqual(expectedValue, actualValue)) {
            matches++;
        }
    }

    // Penalize for extra fields in actual that aren't in expected
    const extraFields =
        Object.keys(actual).length - Object.keys(expected).length;
    if (extraFields > 0) {
        total += extraFields;
    }

    return matches / total;
};

// Deep equality check helper
export const deepEqual = (a: unknown, b: unknown): boolean => {
    if (a === b) return true;
    if (a == null || b == null) return false;
    if (typeof a !== typeof b || Array.isArray(a) !== Array.isArray(b))
        return false;

    // Arrays
    if (Array.isArray(a) && Array.isArray(b)) {
        if (a.length !== b.length) return false;
        // If all elements are primitives, compare as sets
        if (
            a.every((x) => typeof x !== "object") &&
            b.every((x) => typeof x !== "object")
        ) {
            const setA = new Set(a);
            const setB = new Set(b);
            if (setA.size !== setB.size) return false;
            for (const val of setA) {
                if (!setB.has(val)) return false;
            }
            return true;
        }
        // Otherwise, compare sorted arrays recursively
        const sortedA = [...a].sort();
        const sortedB = [...b].sort();
        for (let i = 0; i < sortedA.length; i++) {
            if (!deepEqual(sortedA[i], sortedB[i])) return false;
        }
        return true;
    }

    // Objects
    if (typeof a === "object" && typeof b === "object") {
        const aObj = a as Record<string, unknown>;
        const bObj = b as Record<string, unknown>;
        const aKeys = Object.keys(aObj);
        const bKeys = Object.keys(bObj);
        if (aKeys.length !== bKeys.length) return false;
        for (const key of aKeys) {
            if (!bKeys.includes(key) || !deepEqual(aObj[key], bObj[key]))
                return false;
        }
        return true;
    }

    // Primitives
    return false;
};
