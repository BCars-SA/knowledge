/**
 * @fileoverview Response types for API endpoints
 * Includes comprehensive response structures with statistics and metadata
 */

import type { APIError } from "@artemkdr/core";

/**
 * Base API response structure
 */
export interface BaseApiResponse {
    /** Whether the operation was successful */
    success: boolean;
    /** Operation timestamp */
    timestamp: Date;
    /** Data */
    data?: unknown;
    /** Error (if any) */
    error?: APIError;
    /** Optional additional error details */
    details?: unknown;
}

/**
 * Token usage statistics (mocked for now)
 */
export interface TokenUsage {
    /** Input tokens used */
    inputTokens: number;
    /** Output tokens used */
    outputTokens: number;
    /** Total tokens used */
    totalTokens: number;
    /** Estimated cost in USD */
    estimatedCost: number;
}
