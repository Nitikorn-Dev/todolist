import Link from "next/link";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-1 flex-col items-center justify-center gap-6 p-8 text-center">
      <h1 className="text-3xl font-semibold">Task Manager</h1>
      <p className="max-w-md text-gray-600 dark:text-gray-400">
        A simple task management application. Sign in or create an account to get started.
      </p>
      <div className="flex gap-4">
        <Link
          href="/login"
          className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-800"
        >
          Sign in
        </Link>
        <Link
          href="/signup"
          className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          Sign up
        </Link>
      </div>
    </main>
  );
}
