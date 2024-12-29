import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import Navbar from "@/components/Navbar";

const WorkoutPlan = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [selectedMuscleGroup, setSelectedMuscleGroup] = useState<string | null>(null);

  // Check if user is authenticated
  const { data: session } = useQuery({
    queryKey: ["session"],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      return session;
    },
  });

  // Redirect if not authenticated
  useEffect(() => {
    if (session === null) {
      navigate("/login");
    }
  }, [session, navigate]);

  // Fetch workout goals
  const { data: workoutGoals } = useQuery({
    queryKey: ["workoutGoals"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("workout_goals")
        .select("*");
      
      if (error) throw error;
      return data;
    },
  });

  // Fetch user's current goal
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
    queryKey: ["exercises", userGoal?.goal_id, selectedMuscleGroup],
    enabled: !!userGoal?.goal_id,
    queryFn: async () => {
      let query = supabase
        .from("exercises")
        .select("*")
        .eq("goal_id", userGoal.goal_id);

      if (selectedMuscleGroup) {
        query = query.eq("muscle_group", selectedMuscleGroup);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });

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
        <div className="max-w-4xl mx-auto space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>Your Workout Plan</CardTitle>
              <CardDescription>
                Choose your fitness goal and muscle group to see relevant exercises
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Select Your Goal</label>
                  <Select
                    value={userGoal?.goal_id}
                    onValueChange={handleGoalChange}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a goal" />
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

                {userGoal && (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Filter by Muscle Group</label>
                      <Select
                        value={selectedMuscleGroup || ""}
                        onValueChange={(value) => setSelectedMuscleGroup(value || null)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="All muscle groups" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="">All muscle groups</SelectItem>
                          {muscleGroups.map((group) => (
                            <SelectItem key={group} value={group}>
                              {group}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <h3 className="text-lg font-semibold">
                      Recommended Exercises for {userGoal.workout_goals.name}
                    </h3>
                    <div className="grid gap-4 md:grid-cols-2">
                      {exercises?.map((exercise) => (
                        <Card key={exercise.id}>
                          <div className="relative h-48 w-full">
                            <img
                              src={getExerciseImage(exercise.muscle_group)}
                              alt={exercise.name}
                              className="w-full h-full object-cover rounded-t-lg"
                            />
                          </div>
                          <CardHeader>
                            <CardTitle className="text-lg">{exercise.name}</CardTitle>
                            <CardDescription>
                              Muscle Group: {exercise.muscle_group}
                            </CardDescription>
                          </CardHeader>
                          <CardContent>
                            <p className="text-sm text-muted-foreground mb-2">
                              {exercise.description}
                            </p>
                            <div className="flex justify-between items-center mt-4">
                              <p className="text-sm">
                                Difficulty: {exercise.difficulty_level}
                              </p>
                              <p className="text-sm font-semibold">
                                Sets: {exercise.sets}
                              </p>
                            </div>
                          </CardContent>
                        </Card>
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