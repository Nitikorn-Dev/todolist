type LoadingStateProps = {
  label?: string;
};

export function LoadingState({ label = "Loading..." }: LoadingStateProps) {
  return (
    <div role="status" aria-live="polite" className="flex items-center justify-center p-8">
      <span className="text-sm text-gray-500 dark:text-gray-400">{label}</span>
    </div>
  );
}
