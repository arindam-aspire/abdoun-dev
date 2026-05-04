import { getApiErrorMessage } from "@/lib/http/apiError";
import { readV1EnvelopeMessage } from "@/lib/http/standardEnvelope";
import { authApi } from "@/lib/http/clients";

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
    const response = await authApi.post<AgentOnboardingResponse>(
      "/agents/onboarding",
      payload,
      {
        params: { token },
      },
    );
    const payloadData = response.data;
    const message = readV1EnvelopeMessage(response) ?? undefined;
    return { ...payloadData, message };
  } catch (error) {
    throw new Error(getApiErrorMessage(error), { cause: error });
  }
}

