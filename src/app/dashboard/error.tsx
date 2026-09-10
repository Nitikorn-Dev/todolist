"use client";

import { ErrorState } from "@/components/ui/ErrorState";

export default function DashboardError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return <ErrorState message="Couldn't load this page. Please try again." onRetry={reset} />;
}
