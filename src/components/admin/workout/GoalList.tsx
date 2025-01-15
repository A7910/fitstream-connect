import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Trash2 } from "lucide-react";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { useState } from "react";

interface Goal {
  id: string;
  name: string;
  description: string | null;
}

interface GoalListProps {
  goals: Goal[];
  isLoading: boolean;
}

const ITEMS_PER_PAGE = 5;

export const GoalList = ({ goals, isLoading }: GoalListProps) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [currentPage, setCurrentPage] = useState(1);

  const deleteGoal = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("workout_goals")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Workout goal deleted successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["workoutGoals"] });
    },
    onError: (error) => {
      console.error("Error deleting workout goal:", error);
      toast({
        title: "Error",
        description: "Failed to delete workout goal",
        variant: "destructive",
      });
    },
  });

  const totalPages = Math.ceil((goals?.length || 0) / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedGoals = goals?.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  if (isLoading) {
    return <p>Loading goals...</p>;
  }

  return (
    <div className="space-y-4">
      {paginatedGoals?.map((goal) => (
        <div
          key={goal.id}
          className="p-4 border rounded-lg"
        >
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
            <div className="flex-1">
              <h4 className="font-medium">{goal.name}</h4>
              <p className="text-sm text-muted-foreground">{goal.description}</p>
            </div>
            <Button
              variant="destructive"
              size="icon"
              onClick={() => deleteGoal.mutate(goal.id)}
              className="self-end sm:self-start"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      ))}

      {totalPages > 1 && (
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious 
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
              />
            </PaginationItem>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <PaginationItem key={page}>
                <PaginationLink
                  onClick={() => setCurrentPage(page)}
                  isActive={currentPage === page}
                  className="cursor-pointer"
                >
                  {page}
                </PaginationLink>
              </PaginationItem>
            ))}
            <PaginationItem>
              <PaginationNext
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}
    </div>
  );
};