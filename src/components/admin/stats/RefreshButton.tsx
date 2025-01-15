import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";

interface RefreshButtonProps {
  onRefresh?: () => Promise<void>;
}

export const RefreshButton = ({ onRefresh }: RefreshButtonProps) => {
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await onRefresh?.();
    } finally {
      setIsRefreshing(false);
    }
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={handleRefresh}
      className={cn(
        "h-8 w-8 p-0 hover:bg-muted",
        isRefreshing && "animate-spin"
      )}
    >
      <RefreshCw className="h-4 w-4" />
      <span className="sr-only">Refresh statistics</span>
    </Button>
  );
};