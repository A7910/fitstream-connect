import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Minus } from "lucide-react";

interface Exercise {
  exerciseId: string;
  sets?: number;
  reps?: number;
  notes?: string;
}

interface ExerciseSelectorProps {
  onSubmit: (exercises: Exercise[]) => void;
  isLoading: boolean;
}

const ExerciseSelector = ({ onSubmit, isLoading }: ExerciseSelectorProps) => {
  const [selectedExercises, setSelectedExercises] = useState<Exercise[]>([{ exerciseId: "" }]);

  const { data: exercises } = useQuery({
    queryKey: ["exercises"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("exercises")
        .select("*")
        .order("name");
      
      if (error) throw error;
      return data;
    },
  });

  const handleAddExercise = () => {
    setSelectedExercises([...selectedExercises, { exerciseId: "" }]);
  };

  const handleRemoveExercise = (index: number) => {
    setSelectedExercises(selectedExercises.filter((_, i) => i !== index));
  };

  const handleExerciseChange = (index: number, field: keyof Exercise, value: any) => {
    const updatedExercises = [...selectedExercises];
    updatedExercises[index] = { ...updatedExercises[index], [field]: value };
    setSelectedExercises(updatedExercises);
  };

  const handleSubmit = () => {
    const validExercises = selectedExercises.filter(ex => ex.exerciseId);
    if (validExercises.length > 0) {
      onSubmit(validExercises);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <Label>Select Exercises</Label>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleAddExercise}
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Exercise
        </Button>
      </div>

      {selectedExercises.map((exercise, index) => (
        <div key={index} className="space-y-4 p-4 border rounded-lg">
          <div className="flex justify-between items-start">
            <div className="flex-1 space-y-2">
              <Select
                value={exercise.exerciseId}
                onValueChange={(value) => handleExerciseChange(index, "exerciseId", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select exercise" />
                </SelectTrigger>
                <SelectContent>
                  {exercises?.map((ex) => (
                    <SelectItem key={ex.id} value={ex.id}>
                      {ex.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Sets</Label>
                  <Input
                    type="number"
                    value={exercise.sets || ""}
                    onChange={(e) => handleExerciseChange(index, "sets", parseInt(e.target.value))}
                    placeholder="Number of sets"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Reps</Label>
                  <Input
                    type="number"
                    value={exercise.reps || ""}
                    onChange={(e) => handleExerciseChange(index, "reps", parseInt(e.target.value))}
                    placeholder="Number of reps"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Notes</Label>
                <Textarea
                  value={exercise.notes || ""}
                  onChange={(e) => handleExerciseChange(index, "notes", e.target.value)}
                  placeholder="Add any specific instructions or notes"
                />
              </div>
            </div>
            {selectedExercises.length > 1 && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => handleRemoveExercise(index)}
                className="ml-2"
              >
                <Minus className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      ))}

      <Button
        onClick={handleSubmit}
        disabled={isLoading || selectedExercises.every(ex => !ex.exerciseId)}
        className="w-full"
      >
        {isLoading ? "Saving..." : "Save Workout Plan"}
      </Button>
    </div>
  );
};

export default ExerciseSelector;