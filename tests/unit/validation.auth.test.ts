import { describe, expect, it } from "vitest";
import { validateSignIn, validateSignUp } from "@/lib/validation/auth";

describe("validateSignUp", () => {
  it("accepts a valid sign-up payload", () => {
    const result = validateSignUp({
      name: "Ada Lovelace",
      email: "ada@example.com",
      password: "password123",
      confirmPassword: "password123",
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.email).toBe("ada@example.com");
    }
  });

  it("rejects an invalid email address", () => {
    const result = validateSignUp({
      name: "Ada Lovelace",
      email: "not-an-email",
      password: "password123",
      confirmPassword: "password123",
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.errors.email).toBeDefined();
    }
  });

  it("rejects when confirmPassword does not match password", () => {
    const result = validateSignUp({
      name: "Ada Lovelace",
      email: "ada@example.com",
      password: "password123",
      confirmPassword: "different123",
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.errors.confirmPassword).toBe("Passwords do not match");
    }
  });

  it("rejects a password shorter than 8 characters (boundary)", () => {
    const result = validateSignUp({
      name: "Ada Lovelace",
      email: "ada@example.com",
      password: "short1",
      confirmPassword: "short1",
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.errors.password).toBeDefined();
    }
  });

  it("accepts a password exactly 8 characters (boundary)", () => {
    const result = validateSignUp({
      name: "Ada Lovelace",
      email: "ada@example.com",
      password: "exactly8",
      confirmPassword: "exactly8",
    });

    expect(result.success).toBe(true);
  });
});

describe("validateSignIn", () => {
  it("accepts a valid sign-in payload", () => {
    const result = validateSignIn({ email: "ada@example.com", password: "password123" });
    expect(result.success).toBe(true);
  });

  it("rejects a missing password", () => {
    const result = validateSignIn({ email: "ada@example.com", password: "" });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.errors.password).toBeDefined();
    }
  });

  it("rejects a malformed email", () => {
    const result = validateSignIn({ email: "ada@", password: "password123" });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.errors.email).toBeDefined();
    }
  });
});
