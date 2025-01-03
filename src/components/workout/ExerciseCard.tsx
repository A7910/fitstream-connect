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
    <Card className="overflow-hidden bg-white shadow-lg hover:shadow-xl transition-shadow duration-300">
      <div className="relative h-48 w-full">
        <img
          src={getExerciseImage(exercise.muscle_group)}
          alt={exercise.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
      </div>
      <CardHeader className="relative z-10 -mt-8 bg-white rounded-t-xl">
        <CardTitle className="font-bebas text-2xl text-primary">{exercise.name}</CardTitle>
        <CardDescription className="font-poppins text-secondary">
          Muscle Group: {exercise.muscle_group}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="font-poppins text-sm text-gray-600 mb-4">
          {exercise.description}
        </p>
        <div className="flex justify-between items-center">
          <p className="font-poppins text-sm text-accent">
            Difficulty: {exercise.difficulty_level}
          </p>
          <p className="font-bebas text-lg text-primary">
            Sets: {exercise.sets}
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default ExerciseCard;