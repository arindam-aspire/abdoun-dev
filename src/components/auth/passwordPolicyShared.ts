export type PasswordPolicyChecks = {
  minLength: boolean;
  maxLength: boolean;
  upper: boolean;
  lower: boolean;
  number: boolean;
  symbol: boolean;
};

/** Policy flags for signup / change-password UIs (underscore does not count as symbol). */
export function getPasswordPolicyChecks(password: string): PasswordPolicyChecks {
  return {
    minLength: password.length >= 8,
    maxLength: password.length <= 20,
    upper: /[A-Z]/.test(password),
    lower: /[a-z]/.test(password),
    number: /\d/.test(password),
    symbol: /[!@#$%^&*(),.?":{}|<>]/.test(password),
  };
}

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
