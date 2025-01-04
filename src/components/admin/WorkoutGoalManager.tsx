import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { Trash2 } from "lucide-react";
import { Pagination } from "@/components/ui/pagination";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface WorkoutGoalManagerProps {
  page?: number;
  itemsPerPage?: number;
  onPageChange?: (page: number) => void;
}

const WorkoutGoalManager = ({ 
  page = 1, 
  itemsPerPage = 5,
  onPageChange 
}: WorkoutGoalManagerProps) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [newGoal, setNewGoal] = useState({
    name: "",
    description: "",
  });

  const { data: workoutGoalsData, isLoading } = useQuery({
    queryKey: ["workoutGoals", page],
    queryFn: async () => {
      // First get total count
      const { count, error: countError } = await supabase
        .from("workout_goals")
        .select("*", { count: 'exact', head: true });

      if (countError) throw countError;

      // Then get paginated data
      const { data, error } = await supabase
        .from("workout_goals")
        .select("*")
        .range((page - 1) * itemsPerPage, page * itemsPerPage - 1)
        .order("created_at", { ascending: false });
      
      if (error) throw error;

      return {
        goals: data,
        totalPages: Math.ceil((count || 0) / itemsPerPage)
      };
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
          >
            Create Goal
          </Button>

          <div className="mt-6">
            <h3 className="text-lg font-semibold mb-4">Existing Goals</h3>
            {isLoading ? (
              <p>Loading goals...</p>
            ) : (
              <div className="space-y-4">
                {workoutGoalsData?.goals?.map((goal) => (
                  <div
                    key={goal.id}
                    className="p-4 border rounded-lg"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-medium">{goal.name}</h4>
                        <p className="text-sm text-muted-foreground">{goal.description}</p>
                      </div>
                      <Button
                        variant="destructive"
                        size="icon"
                        onClick={() => deleteGoal.mutate(goal.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
                {workoutGoalsData?.totalPages > 1 && (
                  <div className="mt-4 flex justify-center">
                    <Pagination
                      page={page}
                      totalPages={workoutGoalsData.totalPages}
                      onPageChange={onPageChange || (() => {})}
                    />
                  </div>
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
