import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState } from "react";

interface Exercise {
  id: string;
  name: string;
  sets: number;
  reps: number | null;
  notes: string | null;
  muscle_group: string;
}

interface WorkoutDay {
  day_number: number;
  exercises: Exercise[];
}

const UserWorkoutPlan = () => {
  const [selectedWeek, setSelectedWeek] = useState<string>("");
  const [selectedDay, setSelectedDay] = useState<string>("");

  const { data: workoutWeeks, isLoading: weeksLoading } = useQuery({
    queryKey: ["user-workout-weeks"],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return null;

      const { data: weeks, error: weeksError } = await supabase
        .from("dedicated_workout_weeks")
        .select("id, week_number")
        .eq("user_id", session.user.id)
        .order("week_number");

      if (weeksError) {
        console.error("Error fetching weeks:", weeksError);
        throw weeksError;
      }

      return weeks;
    },
  });

  const { data: workoutDays, isLoading: daysLoading } = useQuery({
    queryKey: ["user-workout-days", selectedWeek],
    enabled: !!selectedWeek,
    queryFn: async () => {
      const { data: days, error: daysError } = await supabase
        .from("dedicated_workout_days")
        .select(`
          id,
          day_number,
          dedicated_workout_exercises (
            id,
            sets,
            reps,
            notes,
            exercises (
              id,
              name,
              muscle_group
            )
          )
        `)
        .eq("week_id", selectedWeek)
        .order("day_number");

      if (daysError) {
        console.error("Error fetching days:", daysError);
        throw daysError;
      }

      return days.map(day => ({
        ...day,
        exercises: day.dedicated_workout_exercises.map((exercise: any) => ({
          id: exercise.exercises.id,
          name: exercise.exercises.name,
          sets: exercise.sets,
          reps: exercise.reps,
          notes: exercise.notes,
          muscle_group: exercise.exercises.muscle_group
        }))
      }));
    },
  });

  const selectedDayExercises = workoutDays?.find(
    day => day.id === selectedDay
  )?.exercises || [];

  if (weeksLoading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Your Workout Plan</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center items-center h-32">
            Loading your workout plan...
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!workoutWeeks?.length) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Your Workout Plan</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center space-y-4">
            <p className="text-center text-muted-foreground">
              You don't have a personalized workout plan yet.
              Please contact an administrator to get started!
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Your Workout Plan</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Select
              value={selectedWeek}
              onValueChange={setSelectedWeek}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select Week" />
              </SelectTrigger>
              <SelectContent>
                {workoutWeeks.map((week) => (
                  <SelectItem key={week.id} value={week.id}>
                    Week {week.week_number}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={selectedDay}
              onValueChange={setSelectedDay}
              disabled={!selectedWeek || !workoutDays?.length}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select Day" />
              </SelectTrigger>
              <SelectContent>
                {workoutDays?.map((day) => (
                  <SelectItem key={day.id} value={day.id}>
                    Day {day.day_number}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedDay && (
            <div className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                {selectedDayExercises.map((exercise) => (
                  <Card key={exercise.id} className="bg-muted">
                    <CardContent className="p-4">
                      <h4 className="font-medium">{exercise.name}</h4>
                      <p className="text-sm text-muted-foreground mb-2">
                        {exercise.muscle_group}
                      </p>
                      <div className="text-sm">
                        <p>Sets: {exercise.sets}</p>
                        {exercise.reps && <p>Reps: {exercise.reps}</p>}
                        {exercise.notes && (
                          <p className="mt-2 text-muted-foreground">
                            Note: {exercise.notes}
                          </p>
                        )}
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
  );
};

export default UserWorkoutPlan;