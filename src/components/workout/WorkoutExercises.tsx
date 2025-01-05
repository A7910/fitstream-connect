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
  image_url: string | null;
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
            muscle_group,
            image_url
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
        muscle_group: exercise.exercises.muscle_group,
        image_url: exercise.exercises.image_url
      }));
    },
  });

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
        {exercises?.map((exercise) => (
          <Card key={exercise.id} className="bg-muted overflow-hidden">
            {exercise.image_url && (
              <div className="relative h-48 w-full">
                <img
                  src={exercise.image_url}
                  alt={exercise.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    console.error("Error loading image:", exercise.image_url);
                    e.currentTarget.src = "/placeholder.svg";
                  }}
                />
              </div>
            )}
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