import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";

export const GoalForm = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [newGoal, setNewGoal] = useState({
    name: "",
    description: "",
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
    </div>
  );
};