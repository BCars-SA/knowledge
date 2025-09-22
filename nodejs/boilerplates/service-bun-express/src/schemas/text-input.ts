import z from "zod";

/**
 * Zod schema for text validation
 */
export const TextInputSchema = z
    .string()
    .min(1, "Text is required")
    .refine((val) => val.trim().length > 0, {
        message: "Text cannot be empty",
    });
