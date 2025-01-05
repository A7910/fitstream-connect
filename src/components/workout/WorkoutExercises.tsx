import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";

interface Exercise {
  id: string;
  name: string;
  sets: number;
  reps: number | null;
  notes: string | null;
  muscle_group: string;
}

export const WorkoutExercises = ({ selectedDay }: { selectedDay: string }) => {
  const { data: exercises } = useQuery({
    queryKey: ["workout-exercises", selectedDay],
    enabled: !!selectedDay,
    queryFn: async () => {
      const { data: exercises, error } = await supabase
        .from("dedicated_workout_exercises")
        .select(`
          id,
          sets,
          reps,
          notes,
          exercises (
            id,
            name,
            muscle_group
          )
        `)
        .eq("day_id", selectedDay);

      if (error) {
        console.error("Error fetching exercises:", error);
        throw error;
      }

      return exercises.map((exercise: any) => ({
        id: exercise.exercises.id,
        name: exercise.exercises.name,
        sets: exercise.sets,
        reps: exercise.reps,
        notes: exercise.notes,
        muscle_group: exercise.exercises.muscle_group
      }));
    },
  });

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
        {exercises?.map((exercise) => (
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
  );
};