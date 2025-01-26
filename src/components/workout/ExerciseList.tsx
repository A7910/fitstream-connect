import ExerciseCard from "./ExerciseCard";

interface Exercise {
  id: string;
  name: string;
  description: string | null;
  muscle_group: string;
  difficulty_level: string;
  sets: number;
  image_url: string | null; // Added image_url to the interface
}

interface ExerciseListProps {
  exercises: Exercise[];
  getExerciseImage: (muscleGroup: string) => string;
}

const ExerciseList = ({ exercises, getExerciseImage }: ExerciseListProps) => {
  return (
    <div className="grid gap-6 md:grid-cols-2">
      {exercises?.map((exercise) => (
        <ExerciseCard
          key={exercise.id}
          exercise={exercise}
          getExerciseImage={getExerciseImage}
        />
      ))}
    </div>
  );
};

export default ExerciseList;