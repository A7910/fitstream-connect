import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const WorkoutGoalManager = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [newGoal, setNewGoal] = useState({
    name: "",
    description: "",
  });

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
                {workoutGoals?.map((goal) => (
                  <div
                    key={goal.id}
                    className="p-4 border rounded-lg"
                  >
                    <h4 className="font-medium">{goal.name}</h4>
                    <p className="text-sm text-muted-foreground">{goal.description}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default WorkoutGoalManager;