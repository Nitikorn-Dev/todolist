"use client";

import { ErrorState } from "@/components/ui/ErrorState";

export default function RootError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return <ErrorState message="Something went wrong. Please try again." onRetry={reset} />;
}
