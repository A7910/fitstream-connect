import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import Navbar from "@/components/Navbar";
import ExerciseCard from "@/components/workout/ExerciseCard";
import GoalSelector from "@/components/workout/GoalSelector";
import MuscleGroupFilter from "@/components/workout/MuscleGroupFilter";

const WorkoutPlan = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [selectedMuscleGroup, setSelectedMuscleGroup] = useState<string>("all");

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

      if (selectedMuscleGroup && selectedMuscleGroup !== "all") {
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
                      {exercises?.map((exercise) => (
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