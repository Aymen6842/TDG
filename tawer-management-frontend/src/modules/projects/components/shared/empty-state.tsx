interface EmptyStateProps {
  message: string;
  description?: string;
}

export function EmptyState({ message, description }: EmptyStateProps) {
  return (
    <div className="flex h-[calc(100vh-12rem)] flex-col items-center justify-center py-12 text-center">
      <h3 className="text-xl font-medium">{message}</h3>
      {description && (
        <p className="text-sm text-muted-foreground mt-2">{description}</p>
      )}
    </div>
  );
}
