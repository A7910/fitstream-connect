import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ExerciseFormProps {
  workoutGoals: Array<{ id: string; name: string; }> | undefined;
}

const ExerciseForm = ({ workoutGoals }: ExerciseFormProps) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [newExercise, setNewExercise] = useState({
    name: "",
    description: "",
    muscle_group: "",
    difficulty_level: "",
    goal_id: "",
    sets: 3,
  });

  const createExercise = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase
        .from("exercises")
        .insert([newExercise])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Exercise created successfully",
      });
      setNewExercise({
        name: "",
        description: "",
        muscle_group: "",
        difficulty_level: "",
        goal_id: "",
        sets: 3,
      });
      queryClient.invalidateQueries({ queryKey: ["exercises"] });
    },
    onError: (error) => {
      console.error("Error creating exercise:", error);
      toast({
        title: "Error",
        description: "Failed to create exercise",
        variant: "destructive",
      });
    },
  });

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="exerciseName">Exercise Name</Label>
        <Input
          id="exerciseName"
          value={newExercise.name}
          onChange={(e) => setNewExercise(prev => ({ ...prev, name: e.target.value }))}
          placeholder="Enter exercise name"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="exerciseDescription">Description</Label>
        <Textarea
          id="exerciseDescription"
          value={newExercise.description}
          onChange={(e) => setNewExercise(prev => ({ ...prev, description: e.target.value }))}
          placeholder="Enter exercise description"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="muscleGroup">Muscle Group</Label>
        <Input
          id="muscleGroup"
          value={newExercise.muscle_group}
          onChange={(e) => setNewExercise(prev => ({ ...prev, muscle_group: e.target.value }))}
          placeholder="E.g., Chest, Back, Legs"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="difficultyLevel">Difficulty Level</Label>
        <Select
          value={newExercise.difficulty_level}
          onValueChange={(value) => setNewExercise(prev => ({ ...prev, difficulty_level: value }))}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select difficulty" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Beginner">Beginner</SelectItem>
            <SelectItem value="Intermediate">Intermediate</SelectItem>
            <SelectItem value="Advanced">Advanced</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label htmlFor="goalSelect">Workout Goal</Label>
        <Select
          value={newExercise.goal_id}
          onValueChange={(value) => setNewExercise(prev => ({ ...prev, goal_id: value }))}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select a goal" />
          </SelectTrigger>
          <SelectContent>
            {workoutGoals?.map((goal) => (
              <SelectItem key={goal.id} value={goal.id}>
                {goal.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label htmlFor="sets">Number of Sets</Label>
        <Input
          id="sets"
          type="number"
          value={newExercise.sets}
          onChange={(e) => setNewExercise(prev => ({ ...prev, sets: parseInt(e.target.value) || 3 }))}
          min={1}
        />
      </div>
      <Button 
        onClick={() => createExercise.mutate()}
        disabled={!newExercise.name || !newExercise.muscle_group || !newExercise.difficulty_level || !newExercise.goal_id}
      >
        Create Exercise
      </Button>
    </div>
  );
};

export default ExerciseForm;