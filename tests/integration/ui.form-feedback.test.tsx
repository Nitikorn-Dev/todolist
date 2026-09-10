import { describe, expect, it } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { SignInForm } from "@/components/auth/SignInForm";

// These exercise the real signInAction: its Zod validation runs (and can
// return an error) before it ever touches Supabase, so no mocking is
// needed to reach the error-display path tested here.
describe("form feedback (validation errors are announced to assistive tech)", () => {
  it("shows an alert with the field error when the email is invalid", async () => {
    const user = userEvent.setup();
    render(<SignInForm />);

    await user.type(screen.getByLabelText("Email"), "not-an-email");
    await user.type(screen.getByLabelText("Password"), "password123");
    await user.click(screen.getByRole("button", { name: "Sign in" }));

    const alert = await waitFor(() => screen.getByRole("alert"));
    expect(alert).toHaveTextContent("Enter a valid email address");
  });

  it("does not show an error before the form has been submitted", () => {
    render(<SignInForm />);
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });
});
