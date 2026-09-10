"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { updateUserRoleAction, type UpdateRoleResult } from "@/lib/admin/actions";

const initialState: UpdateRoleResult = {};

function SaveButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-md border border-gray-300 px-2 py-1 text-xs font-medium hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60 dark:border-gray-600 dark:hover:bg-gray-800"
    >
      {pending ? "Saving..." : "Save"}
    </button>
  );
}

type UserRoleFormProps = {
  userId: string;
  currentRole: string;
};

export function UserRoleForm({ userId, currentRole }: UserRoleFormProps) {
  const [state, formAction] = useActionState(updateUserRoleAction, initialState);

  return (
    <form action={formAction} noValidate className="flex flex-wrap items-center gap-2">
      <input type="hidden" name="userId" value={userId} />
      <label className="sr-only" htmlFor={`role-${userId}`}>
        Role
      </label>
      <select
        id={`role-${userId}`}
        name="role"
        defaultValue={currentRole}
        className="rounded-md border border-gray-300 px-2 py-1 text-sm dark:border-gray-600 dark:bg-gray-900"
      >
        <option value="MEMBER">MEMBER</option>
        <option value="ADMIN">ADMIN</option>
      </select>
      <SaveButton />
      {state.error ? (
        <span role="alert" className="text-xs text-red-600">
          {state.error}
        </span>
      ) : null}
    </form>
  );
}
