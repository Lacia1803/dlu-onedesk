import { FC } from "react";
import { Frown } from "lucide-react";

interface EmptyStateProps {
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
}

export const EmptyState: FC<EmptyStateProps> = ({ title, description, actionLabel, onAction }) => (
  <div className="flex flex-col items-center justify-center py-12 text-center space-y-4">
    <Frown className="h-12 w-12 text-muted-foreground" />
    <h3 className="text-lg font-semibold text-foreground">{title}</h3>
    {description && <p className="text-sm text-muted-foreground max-w-md">{description}</p>}
    {actionLabel && onAction && (
      <button
        className="mt-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
        onClick={onAction}
      >
        {actionLabel}
      </button>
    )}
  </div>
);
