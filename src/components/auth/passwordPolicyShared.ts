export type PasswordPolicyChecks = {
  minLength: boolean;
  upper: boolean;
  lower: boolean;
  number: boolean;
  symbol: boolean;
};

export function countMetChecks(checks: PasswordPolicyChecks): number {
  return Object.values(checks).filter(Boolean).length;
}

export type PasswordStrengthLevel = "idle" | "weak" | "medium" | "strong";

/**
 * Maps met rules to weak / medium / strong. When password is empty, returns `idle`.
 */
export function getPasswordStrengthLevel(
  passwordLength: number,
  checks: PasswordPolicyChecks,
): PasswordStrengthLevel {
  if (passwordLength === 0) return "idle";
  const n = countMetChecks(checks);
  if (n <= 2) return "weak";
  if (n <= 4) return "medium";
  return "strong";
}
