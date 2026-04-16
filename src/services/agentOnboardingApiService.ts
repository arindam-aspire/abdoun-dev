import { createHttpClients } from "@/lib/http";
import { getApiErrorMessage } from "@/lib/http";
import type { StandardApiResponse } from "@/services/userService";

const { authApi } = createHttpClients();

const unwrap = <T,>(response: StandardApiResponse<T>): T => response.data;

export type AgentOnboardingRequest = {
  fullName: string;
  phone: string;
  serviceArea: string;
};

export type AgentOnboardingResponse = {
  id: string;
  email: string;
  status: string;
};

export type AgentOnboardingResult = AgentOnboardingResponse & {
  message?: string | null;
};

export async function completeAgentOnboarding(
  token: string,
  payload: AgentOnboardingRequest,
): Promise<AgentOnboardingResult> {
  try {
    const response = await authApi.post<
      StandardApiResponse<AgentOnboardingResponse>
    >("/agents/onboarding", payload, {
      params: { token },
    });
    const body = response.data;
    const payloadData = unwrap(body);
    const message = body.message ?? undefined;
    return { ...payloadData, message };
  } catch (error) {
    throw new Error(getApiErrorMessage(error));
  }
}

