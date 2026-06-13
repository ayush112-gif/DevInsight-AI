import type { ApiSuccess } from "../utils/api-response";

interface HealthPayload {
  message: string;
}

export const getHealthStatus = (): ApiSuccess<HealthPayload> => ({
  success: true,
  message: "DevInsight AI Backend Running",
});
