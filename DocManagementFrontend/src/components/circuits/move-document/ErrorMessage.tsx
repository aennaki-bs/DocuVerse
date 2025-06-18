
interface ErrorMessageProps {
  error: string | null;
}

export function ErrorMessage({ error }: ErrorMessageProps) {
  if (!error) return null;
  
  return (
    <div className="p-3 rounded bg-red-900/20 border border-red-900/30 text-red-400 text-sm">
      {error}
    </div>
  );
}
