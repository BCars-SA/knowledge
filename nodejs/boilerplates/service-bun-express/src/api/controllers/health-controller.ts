import type { IConfigService } from "@/config-service";
import type { BaseApiResponse } from "../types/responses";
import { APIError } from "@artemkdr/core";

export class HealthController {
    constructor(private readonly config: IConfigService) {}

    /**
     * Health check endpoint
     */
    getHealth = async (): Promise<BaseApiResponse> => {
        // check that config is loaded and correct
        const validation = this.config.validate();
        if (!validation.success) {
            return {
                success: false,
                timestamp: new Date(),
                error: new APIError("Configuration is invalid"),
            };
        }
        return {
            success: true,
            timestamp: new Date(),
        };
    };
}
