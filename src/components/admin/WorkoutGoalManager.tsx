import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { Trash2 } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

const ITEMS_PER_PAGE = 5;

const WorkoutGoalManager = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [newGoal, setNewGoal] = useState({
    name: "",
    description: "",
  });
  const [currentPage, setCurrentPage] = useState(1);

  const { data: workoutGoals, isLoading } = useQuery({
    queryKey: ["workoutGoals"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("workout_goals")
        .select("*")
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      return data;
    },
  });

  const createGoal = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase
        .from("workout_goals")
        .insert([newGoal])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Workout goal created successfully",
      });
      setNewGoal({ name: "", description: "" });
      queryClient.invalidateQueries({ queryKey: ["workoutGoals"] });
    },
    onError: (error) => {
      console.error("Error creating workout goal:", error);
      toast({
        title: "Error",
        description: "Failed to create workout goal",
        variant: "destructive",
      });
    },
  });

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

  const totalPages = Math.ceil((workoutGoals?.length || 0) / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedGoals = workoutGoals?.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Workout Goals</CardTitle>
        <CardDescription>Create and manage workout goals</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="goalName">Goal Name</Label>
            <Input
              id="goalName"
              value={newGoal.name}
              onChange={(e) => setNewGoal(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Enter goal name"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="goalDescription">Description</Label>
            <Textarea
              id="goalDescription"
              value={newGoal.description}
              onChange={(e) => setNewGoal(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Enter goal description"
            />
          </div>
          <Button 
            onClick={() => createGoal.mutate()}
            disabled={!newGoal.name}
            className="w-full sm:w-auto"
          >
            Create Goal
          </Button>

          <div className="mt-6">
            <h3 className="text-lg font-semibold mb-4">Existing Goals</h3>
            {isLoading ? (
              <p>Loading goals...</p>
            ) : (
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
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default WorkoutGoalManager;