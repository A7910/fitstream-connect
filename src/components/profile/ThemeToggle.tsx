import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/hooks/use-theme";
import { cn } from "@/lib/utils";

export const ThemeToggle = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <Button 
      variant="ghost" 
      size="icon"
      onClick={toggleTheme}
      className={cn(
        "w-full flex items-center justify-between px-4 py-2",
        "transition-colors duration-200",
        "hover:bg-gray-100 dark:hover:bg-gray-800",
        "text-gray-900 dark:text-gray-100"
      )}
    >
      <span className="text-sm font-medium">Dark Mode</span>
      <div className="flex items-center">
        {theme === 'dark' ? (
          <Moon className="h-4 w-4 transition-transform duration-200" />
        ) : (
          <Sun className="h-4 w-4 transition-transform duration-200" />
        )}
      </div>
    </Button>
  );
};