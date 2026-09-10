"use client";

import { useFormStatus } from "react-dom";
import { signOutAction } from "@/lib/auth/actions";

function SignOutSubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-md border border-gray-300 px-3 py-1.5 text-sm font-medium hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60 dark:border-gray-600 dark:hover:bg-gray-800"
    >
      {pending ? "Signing out..." : "Sign out"}
    </button>
  );
}

export function SignOutButton() {
  return (
    <form action={signOutAction}>
      <SignOutSubmitButton />
    </form>
  );
}
