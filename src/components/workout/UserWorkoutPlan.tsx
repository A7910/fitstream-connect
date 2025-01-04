import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

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
  const navigate = useNavigate();

  const { data: workoutPlan, isLoading } = useQuery({
    queryKey: ["user-workout-plan"],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return null;

      const { data: weeks, error: weeksError } = await supabase
        .from("dedicated_workout_weeks")
        .select("id, week_number")
        .eq("user_id", session.user.id)
        .order("week_number");

      if (weeksError) throw weeksError;
      if (!weeks?.length) return null;

      const currentWeek = weeks[0];

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
        .eq("week_id", currentWeek.id)
        .order("day_number");

      if (daysError) throw daysError;

      return days.map(day => ({
        day_number: day.day_number,
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

  if (isLoading) {
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

  if (!workoutPlan) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Your Workout Plan</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center space-y-4">
            <p className="text-center text-muted-foreground">
              You don't have a personalized workout plan yet.
              Visit our workout plan page to get started!
            </p>
            <Button onClick={() => navigate("/workout-plan")}>
              View Workout Plans
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex justify-between items-center">
          <span>Your Workout Plan</span>
          <Button variant="outline" onClick={() => navigate("/workout-plan")}>
            View All Plans
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {workoutPlan.map((day: WorkoutDay) => (
            <div key={day.day_number} className="space-y-4">
              <h3 className="font-semibold text-lg">Day {day.day_number}</h3>
              <div className="grid gap-4 md:grid-cols-2">
                {day.exercises.map((exercise) => (
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
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default UserWorkoutPlan;