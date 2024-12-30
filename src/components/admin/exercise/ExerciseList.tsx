import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Trash2 } from "lucide-react";

interface Exercise {
  id: string;
  name: string;
  description: string | null;
  muscle_group: string;
  difficulty_level: string;
  workout_goals: { name: string } | null;
  sets: number;
}

interface ExerciseListProps {
  exercises: Exercise[] | undefined;
  isLoading: boolean;
}

const ExerciseList = ({ exercises, isLoading }: ExerciseListProps) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const deleteExercise = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("exercises")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Exercise deleted successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["exercises"] });
    },
    onError: (error) => {
      console.error("Error deleting exercise:", error);
      toast({
        title: "Error",
        description: "Failed to delete exercise",
        variant: "destructive",
      });
    },
  });

  if (isLoading) {
    return <p>Loading exercises...</p>;
  }

  return (
    <div className="space-y-4">
      {exercises?.map((exercise) => (
        <div
          key={exercise.id}
          className="p-4 border rounded-lg"
        >
          <div className="flex justify-between items-start">
            <div>
              <h4 className="font-medium">{exercise.name}</h4>
              <p className="text-sm text-muted-foreground">{exercise.description}</p>
              <div className="mt-2 flex flex-wrap gap-2">
                <span className="text-xs bg-secondary px-2 py-1 rounded">
                  {exercise.muscle_group}
                </span>
                <span className="text-xs bg-secondary px-2 py-1 rounded">
                  {exercise.difficulty_level}
                </span>
                <span className="text-xs bg-secondary px-2 py-1 rounded">
                  {exercise.workout_goals?.name}
                </span>
                <span className="text-xs bg-secondary px-2 py-1 rounded">
                  Sets: {exercise.sets}
                </span>
              </div>
            </div>
            <Button
              variant="destructive"
              size="icon"
              onClick={() => deleteExercise.mutate(exercise.id)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ExerciseList;