import {
  validateChangePassword,
  validatePhone,
} from "@/features/profile/schemas/profileFormSchema";

describe("profileFormSchema", () => {
  describe("validatePhone", () => {
    it("rejects empty", () => {
      expect(validatePhone("")).toEqual({
        valid: false,
        code: "required",
      });
    });

    it("accepts non-empty", () => {
      expect(validatePhone("+962600000000")).toEqual({ valid: true });
    });
  });

  describe("validateChangePassword", () => {
    it("rejects short password", () => {
      const result = validateChangePassword({
        currentPassword: "old",
        newPassword: "short",
        confirmPassword: "short",
      });
      expect(result.valid).toBe(false);
      expect(result.error).toBe("Password must be at least 8 characters.");
    });

    it("rejects mismatch", () => {
      const result = validateChangePassword({
        currentPassword: "old",
        newPassword: "longenough",
        confirmPassword: "different",
      });
      expect(result.valid).toBe(false);
      expect(result.error).toBe("New password and confirmation do not match.");
    });

    it("accepts valid", () => {
      const result = validateChangePassword({
        currentPassword: "old",
        newPassword: "longenough",
        confirmPassword: "longenough",
      });
      expect(result).toEqual({ valid: true });
    });
  });
});

