import type { useForgotPasswordFlow, useSignupFlow } from "@/hooks/useAuthForms";

export type SignupFlowState = ReturnType<typeof useSignupFlow>;
export type ForgotPasswordFlowState = ReturnType<typeof useForgotPasswordFlow>;
