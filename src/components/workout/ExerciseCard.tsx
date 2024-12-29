import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface ExerciseCardProps {
  exercise: {
    id: string;
    name: string;
    description: string | null;
    muscle_group: string;
    difficulty_level: string;
    sets: number;
  };
  getExerciseImage: (muscleGroup: string) => string;
}

const ExerciseCard = ({ exercise, getExerciseImage }: ExerciseCardProps) => {
  return (
    <Card key={exercise.id}>
      <div className="relative h-48 w-full">
        <img
          src={getExerciseImage(exercise.muscle_group)}
          alt={exercise.name}
          className="w-full h-full object-cover rounded-t-lg"
        />
      </div>
      <CardHeader>
        <CardTitle className="text-lg">{exercise.name}</CardTitle>
        <CardDescription>
          Muscle Group: {exercise.muscle_group}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground mb-2">
          {exercise.description}
        </p>
        <div className="flex justify-between items-center mt-4">
          <p className="text-sm">
            Difficulty: {exercise.difficulty_level}
          </p>
          <p className="text-sm font-semibold">
            Sets: {exercise.sets}
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default ExerciseCard;