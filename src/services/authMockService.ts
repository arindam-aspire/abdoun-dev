export type SocialProvider = "google" | "apple" | "facebook";

export interface SignupPayload {
  fullName: string;
  email: string;
  phone: string;
  password: string;
}

interface ChallengeRecord {
  otp: string;
  expiresAt: number;
  attempts: number;
}

const otpStore = new Map<string, ChallengeRecord>();
const resetTokenStore = new Map<string, string>();

function delay(ms = 900) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function createOtp() {
  return String(Math.floor(Math.random() * 1_000_000)).padStart(6, "0");
}

function createId(prefix: string) {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}`;
}

function createChallenge(prefix: string) {
  const challengeId = createId(prefix);
  const otp = createOtp();
  otpStore.set(challengeId, {
    otp,
    expiresAt: Date.now() + 60_000,
    attempts: 0,
  });
  return { challengeId, otp, expiresInSeconds: 60 };
}

export async function mockSignupWithManual(payload: SignupPayload) {
  await delay();
  if (payload.email.toLowerCase().includes("exists")) {
    return {
      nextStep: "login" as const,
      message: "Account already exists. Please log in.",
    };
  }

  const challenge = createChallenge("signup");
  return {
    nextStep: "otp" as const,
    challengeId: challenge.challengeId,
    expiresInSeconds: challenge.expiresInSeconds,
    debugOtp: challenge.otp,
  };
}

export async function mockVerifySignupOtp(challengeId: string, otp: string) {
  await delay(700);
  const record = otpStore.get(challengeId);
  if (!record) throw new Error("OTP session not found. Please request a new code.");
  if (record.expiresAt < Date.now()) throw new Error("OTP expired. Please resend OTP.");

  record.attempts += 1;
  if (record.attempts > 3) throw new Error("Too many invalid OTP attempts.");
  if (record.otp !== otp) throw new Error("Invalid OTP code.");

  otpStore.delete(challengeId);
  return { success: true };
}

export async function mockResendOtp(challengeId: string) {
  await delay(500);
  if (!otpStore.has(challengeId)) throw new Error("Unable to resend OTP. Start again.");

  const otp = createOtp();
  otpStore.set(challengeId, { otp, expiresAt: Date.now() + 60_000, attempts: 0 });
  return { debugOtp: otp, expiresInSeconds: 60 };
}

export async function mockSocialAuth(provider: SocialProvider) {
  await delay(1000);
  if (provider === "facebook") {
    throw new Error("Provider email is not verified. Please sign up manually.");
  }

  return { success: true };
}

export async function mockWhatsappLogin() {
  await delay(900);
  return { success: true };
}

export async function mockManualLogin(identifier: string, password: string) {
  await delay(900);
  if (identifier.toLowerCase().includes("locked")) {
    throw new Error("Too many login attempts. Please try again later.");
  }
  if (password !== "Password1!") {
    throw new Error("Invalid credentials.");
  }

  return { success: true };
}

export async function mockSendOneTimeLink(email: string) {
  await delay(700);
  if (!email.trim() || !email.includes("@")) {
    throw new Error("Enter a valid email address.");
  }
  return { success: true };
}

export async function mockSendOneTimeCode(identifier: string) {
  await delay(800);
  const trimmed = identifier.trim();
  if (!trimmed) throw new Error("Email or phone is required.");
  const isEmail = trimmed.includes("@");
  const isPhone = /^\+?[1-9]\d{7,14}$/.test(trimmed.replace(/[\s()-]/g, ""));
  if (!isEmail && !isPhone) {
    throw new Error("Enter a valid email or phone number.");
  }
  const challenge = createChallenge("login_otp");
  return {
    challengeId: challenge.challengeId,
    debugOtp: challenge.otp,
    expiresInSeconds: challenge.expiresInSeconds,
    message: "If an account exists, a one-time code has been sent.",
  };
}

export async function mockVerifyOneTimeCode(challengeId: string, otp: string) {
  await delay(700);
  const record = otpStore.get(challengeId);
  if (!record) throw new Error("Session not found. Please request a new code.");
  if (record.expiresAt < Date.now()) throw new Error("Code expired. Please resend.");
  record.attempts += 1;
  if (record.attempts > 3) throw new Error("Too many invalid attempts.");
  if (record.otp !== otp) throw new Error("Invalid code.");
  otpStore.delete(challengeId);
  return { success: true };
}

export async function mockForgotPasswordRequest(identifier: string) {
  await delay(800);
  if (!identifier.trim()) throw new Error("Email or phone is required.");

  const challenge = createChallenge("reset");
  return {
    challengeId: challenge.challengeId,
    debugOtp: challenge.otp,
    expiresInSeconds: challenge.expiresInSeconds,
    message: "If an account exists, OTP has been sent.",
  };
}

export async function mockVerifyResetOtp(challengeId: string, otp: string) {
  await delay(700);
  const record = otpStore.get(challengeId);
  if (!record) throw new Error("OTP session not found. Please start over.");
  if (record.expiresAt < Date.now()) throw new Error("OTP expired. Please resend OTP.");
  if (record.otp !== otp) throw new Error("Invalid OTP code.");

  const resetToken = createId("reset_token");
  resetTokenStore.set(resetToken, challengeId);
  return { resetToken };
}

export async function mockSetNewPassword(resetToken: string, password: string) {
  await delay(850);
  if (!password) throw new Error("Password is required.");
  if (!resetTokenStore.has(resetToken)) {
    throw new Error("Reset session expired. Please retry forgot password.");
  }

  resetTokenStore.delete(resetToken);
  return { success: true };
}
