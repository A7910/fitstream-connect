import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import UserSelector from "./UserSelector";
import WeekDaySelector from "./WeekDaySelector";
import ExerciseSelector from "./ExerciseSelector";
import { useToast } from "@/components/ui/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const DedicatedWorkoutManager = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [selectedWeek, setSelectedWeek] = useState<number>(1);
  const [selectedDay, setSelectedDay] = useState<number>(1);

  const createWorkoutMutation = useMutation({
    mutationFn: async ({ weekId, exercises }: { weekId: string, exercises: Array<{ exerciseId: string, sets?: number, reps?: number, notes?: string }> }) => {
      console.log("Creating workout day with exercises:", { weekId, exercises });
      
      const { data: dayData, error: dayError } = await supabase
        .from('dedicated_workout_days')
        .insert([{ week_id: weekId, day_number: selectedDay }])
        .select()
        .single();

      if (dayError) throw dayError;

      const exercisesWithDayId = exercises.map(exercise => ({
        day_id: dayData.id,
        exercise_id: exercise.exerciseId,
        sets: exercise.sets || 3,
        reps: exercise.reps,
        notes: exercise.notes
      }));

      const { error: exercisesError } = await supabase
        .from('dedicated_workout_exercises')
        .insert(exercisesWithDayId);

      if (exercisesError) throw exercisesError;

      return dayData;
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Workout plan has been assigned successfully",
      });
      queryClient.invalidateQueries({ queryKey: ['dedicated-workouts'] });
    },
    onError: (error) => {
      console.error("Error creating workout:", error);
      toast({
        title: "Error",
        description: "Failed to assign workout plan. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleCreateWorkout = async (exercises: Array<{ exerciseId: string, sets?: number, reps?: number, notes?: string }>) => {
    if (!selectedUser) {
      toast({
        title: "Error",
        description: "Please select a user first",
        variant: "destructive",
      });
      return;
    }

    try {
      // First, ensure we have a week record
      const { data: weekData, error: weekError } = await supabase
        .from('dedicated_workout_weeks')
        .insert([{ user_id: selectedUser, week_number: selectedWeek }])
        .select()
        .single();

      if (weekError) throw weekError;

      await createWorkoutMutation.mutateAsync({
        weekId: weekData.id,
        exercises
      });
    } catch (error) {
      console.error("Error in handleCreateWorkout:", error);
      toast({
        title: "Error",
        description: "Failed to create workout plan. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Dedicated Workout Plans</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <UserSelector
          selectedUser={selectedUser}
          onUserSelect={setSelectedUser}
        />
        {selectedUser && (
          <>
            <WeekDaySelector
              selectedWeek={selectedWeek}
              selectedDay={selectedDay}
              onWeekChange={setSelectedWeek}
              onDayChange={setSelectedDay}
            />
            <ExerciseSelector
              onSubmit={handleCreateWorkout}
              isLoading={createWorkoutMutation.isPending}
            />
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default DedicatedWorkoutManager;