import React from 'react';
import { Button } from "@/components/ui/button";
import { Pencil, Trash2 } from "lucide-react";
import ExerciseTag from './ExerciseTag';

interface Exercise {
  id: string;
  name: string;
  description: string | null;
  muscle_group: string;
  difficulty_level: string;
  workout_goals: { name: string } | null;
  sets: number;
  image_url: string | null;
  goal_id: string;
}

interface ExerciseCardProps {
  exercise: Exercise;
  onEdit: (exercise: Exercise) => void;
  onDelete: (id: string) => void;
}

const ExerciseCard = ({ exercise, onEdit, onDelete }: ExerciseCardProps) => {
  return (
    <div className="p-4 border rounded-lg">
      <div className="flex flex-col md:flex-row gap-4">
        {exercise.image_url && (
          <div className="w-full md:w-32 h-48 md:h-32 relative">
            <img
              src={exercise.image_url}
              alt={exercise.name}
              className="w-full h-full object-cover rounded-lg"
              onError={(e) => {
                console.error("Error loading image:", exercise.image_url);
                e.currentTarget.src = "/placeholder.svg";
              }}
            />
          </div>
        )}
        <div className="flex-1">
          <div className="flex justify-between items-start">
            <div>
              <h4 className="font-medium">{exercise.name}</h4>
              <p className="text-sm text-muted-foreground">{exercise.description}</p>
              <div className="mt-2 flex flex-row flex-wrap items-center gap-2">
                <ExerciseTag label={exercise.muscle_group} />
                <ExerciseTag label={exercise.difficulty_level} />
                {exercise.workout_goals?.name && (
                  <ExerciseTag label={exercise.workout_goals.name} />
                )}
                <ExerciseTag label={`Sets: ${exercise.sets}`} />
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={() => onEdit(exercise)}
              >
                <Pencil className="h-4 w-4" />
              </Button>
              <Button
                variant="destructive"
                size="icon"
                onClick={() => onDelete(exercise.id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExerciseCard;