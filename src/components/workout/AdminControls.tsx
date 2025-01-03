import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

interface AdminControlsProps {
  workoutGoals: Array<{ id: string; name: string; }> | undefined;
  refetchWorkoutGoals: () => void;
}

const AdminControls = ({ workoutGoals, refetchWorkoutGoals }: AdminControlsProps) => {
  const { toast } = useToast();
  const [newGoalName, setNewGoalName] = useState("");
  const [newGoalDescription, setNewGoalDescription] = useState("");
  const [isAddingExercise, setIsAddingExercise] = useState(false);
  const [newExercise, setNewExercise] = useState({
    name: "",
    description: "",
    muscle_group: "",
    difficulty_level: "",
    sets: 3,
  });

  const createWorkoutGoal = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase
        .from("workout_goals")
        .insert([
          {
            name: newGoalName,
            description: newGoalDescription,
          },
        ])
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
      setNewGoalName("");
      setNewGoalDescription("");
      refetchWorkoutGoals();
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

  const createExercise = useMutation({
    mutationFn: async (goalId: string) => {
      const { data, error } = await supabase
        .from("exercises")
        .insert([
          {
            ...newExercise,
            goal_id: goalId,
          },
        ])
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
        sets: 3,
      });
      setIsAddingExercise(false);
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
    <Card className="bg-white shadow-lg">
      <CardHeader>
        <CardTitle className="font-bebas text-3xl text-primary">Admin Controls</CardTitle>
        <CardDescription className="font-poppins">
          Create new workout goals and exercises
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="space-y-4">
            <h3 className="font-bebas text-2xl text-primary">Create New Workout Goal</h3>
            <div className="space-y-2">
              <Label htmlFor="goalName" className="font-poppins">Goal Name</Label>
              <Input
                id="goalName"
                value={newGoalName}
                onChange={(e) => setNewGoalName(e.target.value)}
                className="font-poppins"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="goalDescription" className="font-poppins">Description</Label>
              <Textarea
                id="goalDescription"
                value={newGoalDescription}
                onChange={(e) => setNewGoalDescription(e.target.value)}
                className="font-poppins"
              />
            </div>
            <Button 
              onClick={() => createWorkoutGoal.mutate()}
              className="bg-primary hover:bg-primary/90 text-white font-poppins"
            >
              Create Goal
            </Button>
          </div>

          {workoutGoals && workoutGoals.length > 0 && (
            <div className="space-y-4">
              <h3 className="font-bebas text-2xl text-primary">Add Exercise to Goal</h3>
              <Dialog open={isAddingExercise} onOpenChange={setIsAddingExercise}>
                <DialogTrigger asChild>
                  <Button className="bg-secondary hover:bg-secondary/90 text-white font-poppins">
                    Add New Exercise
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle className="font-bebas text-2xl text-primary">Add New Exercise</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="exerciseName" className="font-poppins">Exercise Name</Label>
                      <Input
                        id="exerciseName"
                        value={newExercise.name}
                        onChange={(e) => setNewExercise(prev => ({ ...prev, name: e.target.value }))}
                        className="font-poppins"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="exerciseDescription" className="font-poppins">Description</Label>
                      <Textarea
                        id="exerciseDescription"
                        value={newExercise.description}
                        onChange={(e) => setNewExercise(prev => ({ ...prev, description: e.target.value }))}
                        className="font-poppins"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="muscleGroup" className="font-poppins">Muscle Group</Label>
                      <Input
                        id="muscleGroup"
                        value={newExercise.muscle_group}
                        onChange={(e) => setNewExercise(prev => ({ ...prev, muscle_group: e.target.value }))}
                        className="font-poppins"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="difficultyLevel" className="font-poppins">Difficulty Level</Label>
                      <Input
                        id="difficultyLevel"
                        value={newExercise.difficulty_level}
                        onChange={(e) => setNewExercise(prev => ({ ...prev, difficulty_level: e.target.value }))}
                        className="font-poppins"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="sets" className="font-poppins">Number of Sets</Label>
                      <Input
                        id="sets"
                        type="number"
                        value={newExercise.sets}
                        onChange={(e) => setNewExercise(prev => ({ ...prev, sets: parseInt(e.target.value) || 3 }))}
                        className="font-poppins"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="goalSelect" className="font-poppins">Select Goal</Label>
                      <select
                        id="goalSelect"
                        className="w-full p-2 border rounded font-poppins"
                        onChange={(e) => createExercise.mutate(e.target.value)}
                      >
                        <option value="">Select a goal</option>
                        {workoutGoals.map((goal) => (
                          <option key={goal.id} value={goal.id}>
                            {goal.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default AdminControls;