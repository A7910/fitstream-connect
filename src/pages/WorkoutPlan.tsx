import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import Navbar from "@/components/Navbar";
import ExerciseCard from "@/components/workout/ExerciseCard";
import GoalSelector from "@/components/workout/GoalSelector";
import MuscleGroupFilter from "@/components/workout/MuscleGroupFilter";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { BackButton } from "@/components/ui/back-button";

const WorkoutPlan = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [selectedMuscleGroup, setSelectedMuscleGroup] = useState<string>("all");
  const [newGoalName, setNewGoalName] = useState("");
  const [newGoalDescription, setNewGoalDescription] = useState("");
  const [newExercise, setNewExercise] = useState({
    name: "",
    description: "",
    muscle_group: "",
    difficulty_level: "",
    sets: 3,
  });
  const [isAddingExercise, setIsAddingExercise] = useState(false);

  // Check if user is authenticated and is admin
  const { data: session } = useQuery({
    queryKey: ["session"],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      return session;
    },
  });

  const { data: isAdmin } = useQuery({
    queryKey: ["isAdmin", session?.user?.id],
    enabled: !!session?.user?.id,
    queryFn: async () => {
      const { data } = await supabase
        .from("admin_users")
        .select()
        .eq("user_id", session?.user?.id)
        .maybeSingle();
      return !!data;
    },
  });

  // Redirect if not authenticated
  useEffect(() => {
    if (session === null) {
      navigate("/login");
    }
  }, [session, navigate]);

  // Fetch workout goals
  const { data: workoutGoals, refetch: refetchWorkoutGoals } = useQuery({
    queryKey: ["workoutGoals"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("workout_goals")
        .select("*");
      
      if (error) throw error;
      return data;
    },
  });

  // Create new workout goal
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

  // Create new exercise
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

  const { data: userGoal, refetch: refetchUserGoal } = useQuery({
    queryKey: ["userGoal", session?.user?.id],
    enabled: !!session?.user?.id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("user_workout_goals")
        .select("*, workout_goals(*)")
        .eq("user_id", session?.user?.id)
        .maybeSingle();
      
      if (error) throw error;
      return data;
    },
  });

  // Fetch exercises based on selected goal
  const { data: exercises } = useQuery({
    queryKey: ["exercises", userGoal?.goal_id],
    enabled: !!userGoal?.goal_id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("exercises")
        .select("*")
        .eq("goal_id", userGoal.goal_id);

      if (error) throw error;
      return data;
    },
  });

  // Filter exercises based on selected muscle group
  const filteredExercises = exercises?.filter(exercise => 
    selectedMuscleGroup === "all" || exercise.muscle_group === selectedMuscleGroup
  );

  // Get unique muscle groups from exercises
  const muscleGroups = [...new Set(exercises?.map(ex => ex.muscle_group) || [])];

  const handleGoalChange = async (goalId: string) => {
    try {
      if (!session?.user?.id) return;

      if (userGoal) {
        // Update existing goal
        const { error } = await supabase
          .from("user_workout_goals")
          .update({ goal_id: goalId })
          .eq("user_id", session.user.id);

        if (error) throw error;
      } else {
        // Insert new goal
        const { error } = await supabase
          .from("user_workout_goals")
          .insert({
            user_id: session.user.id,
            goal_id: goalId,
          });

        if (error) throw error;
      }

      await refetchUserGoal();
      toast({
        title: "Success",
        description: "Your workout goal has been updated.",
      });
    } catch (error) {
      console.error("Error updating workout goal:", error);
      toast({
        title: "Error",
        description: "Failed to update workout goal. Please try again.",
        variant: "destructive",
      });
    }
  };

  const getExerciseImage = (muscleGroup: string) => {
    const images: { [key: string]: string } = {
      "Chest": "/photo-1581091226825-a6a2a5aee158",
      "Back": "/photo-1581091226825-a6a2a5aee158",
      "Legs": "/photo-1581091226825-a6a2a5aee158",
      "Arms": "/photo-1581091226825-a6a2a5aee158",
      "Shoulders": "/photo-1581091226825-a6a2a5aee158",
      "Core": "/photo-1581091226825-a6a2a5aee158"
    };
    return images[muscleGroup] || "/placeholder.svg";
  };

  if (!session) return null;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <BackButton />
        <div className="max-w-4xl mx-auto space-y-8">
          {isAdmin && (
            <Card>
              <CardHeader>
                <CardTitle>Admin Controls</CardTitle>
                <CardDescription>
                  Create new workout goals and exercises
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Create New Workout Goal</h3>
                    <div className="space-y-2">
                      <Label htmlFor="goalName">Goal Name</Label>
                      <Input
                        id="goalName"
                        value={newGoalName}
                        onChange={(e) => setNewGoalName(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="goalDescription">Description</Label>
                      <Textarea
                        id="goalDescription"
                        value={newGoalDescription}
                        onChange={(e) => setNewGoalDescription(e.target.value)}
                      />
                    </div>
                    <Button onClick={() => createWorkoutGoal.mutate()}>
                      Create Goal
                    </Button>
                  </div>

                  {workoutGoals && workoutGoals.length > 0 && (
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold">Add Exercise to Goal</h3>
                      <Dialog open={isAddingExercise} onOpenChange={setIsAddingExercise}>
                        <DialogTrigger asChild>
                          <Button>Add New Exercise</Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Add New Exercise</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div className="space-y-2">
                              <Label htmlFor="exerciseName">Exercise Name</Label>
                              <Input
                                id="exerciseName"
                                value={newExercise.name}
                                onChange={(e) => setNewExercise(prev => ({ ...prev, name: e.target.value }))}
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="exerciseDescription">Description</Label>
                              <Textarea
                                id="exerciseDescription"
                                value={newExercise.description}
                                onChange={(e) => setNewExercise(prev => ({ ...prev, description: e.target.value }))}
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="muscleGroup">Muscle Group</Label>
                              <Input
                                id="muscleGroup"
                                value={newExercise.muscle_group}
                                onChange={(e) => setNewExercise(prev => ({ ...prev, muscle_group: e.target.value }))}
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="difficultyLevel">Difficulty Level</Label>
                              <Input
                                id="difficultyLevel"
                                value={newExercise.difficulty_level}
                                onChange={(e) => setNewExercise(prev => ({ ...prev, difficulty_level: e.target.value }))}
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="sets">Number of Sets</Label>
                              <Input
                                id="sets"
                                type="number"
                                value={newExercise.sets}
                                onChange={(e) => setNewExercise(prev => ({ ...prev, sets: parseInt(e.target.value) || 3 }))}
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="goalSelect">Select Goal</Label>
                              <select
                                id="goalSelect"
                                className="w-full p-2 border rounded"
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
          )}

          <Card>
            <CardHeader>
              <CardTitle>Your Workout Plan</CardTitle>
              <CardDescription>
                Choose your fitness goal and muscle group to see relevant exercises
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <GoalSelector
                  value={userGoal?.goal_id}
                  onValueChange={handleGoalChange}
                  workoutGoals={workoutGoals}
                />

                {userGoal && (
                  <div className="space-y-4">
                    <MuscleGroupFilter
                      value={selectedMuscleGroup}
                      onValueChange={setSelectedMuscleGroup}
                      muscleGroups={muscleGroups}
                    />

                    <h3 className="text-lg font-semibold">
                      Recommended Exercises for {userGoal.workout_goals.name}
                    </h3>
                    <div className="grid gap-4 md:grid-cols-2">
                      {filteredExercises?.map((exercise) => (
                        <ExerciseCard
                          key={exercise.id}
                          exercise={exercise}
                          getExerciseImage={getExerciseImage}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default WorkoutPlan;
