import { Loader2 } from "lucide-react";

interface ExerciseDetailsProps {
  exercises: any[];
  isLoadingExercises: boolean;
}

export const ExerciseDetails = ({ exercises, isLoadingExercises }: ExerciseDetailsProps) => {
  if (isLoadingExercises) {
    return (
      <div className="flex items-center justify-center p-4">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {exercises.map((exercise) => (
        <div
          key={exercise.id}
          className="p-4 border rounded-lg space-y-2"
        >
          <h4 className="font-medium">{exercise.exercises.name}</h4>
          <p className="text-sm text-muted-foreground">
            {exercise.exercises.description}
          </p>
          <div className="text-sm">
            <p>Sets: {exercise.sets}</p>
            <p>Reps: {exercise.reps || "Not specified"}</p>
            {exercise.notes && <p>Notes: {exercise.notes}</p>}
          </div>
          <div className="flex flex-wrap gap-2 text-xs">
            <span className="px-2 py-1 bg-muted rounded-full">
              {exercise.exercises.muscle_group}
            </span>
            <span className="px-2 py-1 bg-muted rounded-full">
              {exercise.exercises.difficulty_level}
            </span>
          </div>
        </div>
      ))}
      {exercises.length === 0 && (
        <p className="text-sm text-muted-foreground text-center py-4">
          No exercises assigned for this day
        </p>
      )}
    </div>
  );
};