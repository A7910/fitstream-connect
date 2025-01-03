import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import Navbar from "@/components/Navbar";
import GoalSelector from "@/components/workout/GoalSelector";
import MuscleGroupFilter from "@/components/workout/MuscleGroupFilter";
import { BackButton } from "@/components/ui/back-button";
import AdminControls from "@/components/workout/AdminControls";
import WorkoutPlanHeader from "@/components/workout/WorkoutPlanHeader";
import ExerciseList from "@/components/workout/ExerciseList";
import { useState } from "react";

const WorkoutPlan = () => {
  const navigate = useNavigate();
  const [selectedMuscleGroup, setSelectedMuscleGroup] = useState<string>("all");

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
        const { error } = await supabase
          .from("user_workout_goals")
          .update({ goal_id: goalId })
          .eq("user_id", session.user.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("user_workout_goals")
          .insert({
            user_id: session.user.id,
            goal_id: goalId,
          });

        if (error) throw error;
      }

      await refetchUserGoal();
    } catch (error) {
      console.error("Error updating workout goal:", error);
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
            <AdminControls 
              workoutGoals={workoutGoals} 
              refetchWorkoutGoals={refetchWorkoutGoals}
            />
          )}

          <Card className="bg-white shadow-lg">
            <CardHeader>
              <WorkoutPlanHeader />
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <GoalSelector
                  value={userGoal?.goal_id}
                  onValueChange={handleGoalChange}
                  workoutGoals={workoutGoals}
                />

                {userGoal && (
                  <div className="space-y-6">
                    <MuscleGroupFilter
                      value={selectedMuscleGroup}
                      onValueChange={setSelectedMuscleGroup}
                      muscleGroups={muscleGroups}
                    />

                    <h3 className="font-normal text-3xl text-primary">
                      Recommended Exercises for {userGoal.workout_goals.name}
                    </h3>
                    
                    <ExerciseList
                      exercises={filteredExercises || []}
                      getExerciseImage={getExerciseImage}
                    />
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
