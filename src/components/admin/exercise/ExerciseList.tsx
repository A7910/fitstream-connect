import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Pencil, Trash2, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import ExerciseForm from "./ExerciseForm";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Exercise {
  id: string;
  name: string;
  description: string | null;
  muscle_group: string;
  difficulty_level: string;
  workout_goals: { name: string } | null;
  sets: number;
  goal_id: string;
  image_url: string | null;
}

interface ExerciseListProps {
  exercises: Exercise[] | undefined;
  isLoading: boolean;
  workoutGoals: Array<{ id: string; name: string; }> | undefined;
}

const ITEMS_PER_PAGE = 5;

const ExerciseList = ({ exercises, isLoading, workoutGoals }: ExerciseListProps) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [editingExercise, setEditingExercise] = useState<Exercise | null>(null);
  const [selectedGoal, setSelectedGoal] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);

  const deleteExercise = useMutation({
    mutationFn: async (id: string) => {
      console.log("Deleting exercise with ID:", id);
      const exercise = exercises?.find(e => e.id === id);
      
      if (exercise?.image_url) {
        const imagePath = exercise.image_url.split('/').pop();
        if (imagePath) {
          console.log("Deleting image:", imagePath);
          await supabase.storage
            .from('exercise-images')
            .remove([imagePath]);
        }
      }

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

  const handleClose = () => {
    setEditingExercise(null);
  };

  const filteredExercises = exercises?.filter(exercise => 
    selectedGoal === "all" || exercise.workout_goals?.name === workoutGoals?.find(g => g.id === selectedGoal)?.name
  ) || [];

  const totalPages = Math.ceil((filteredExercises?.length || 0) / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedExercises = filteredExercises?.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  if (isLoading) {
    return <p>Loading exercises...</p>;
  }

  return (
    <>
      <div className="space-y-4">
        <div className="flex items-center gap-4">
          <Select
            value={selectedGoal}
            onValueChange={setSelectedGoal}
          >
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Filter by goal" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Goals</SelectItem>
              {workoutGoals?.map((goal) => (
                <SelectItem key={goal.id} value={goal.id}>
                  {goal.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {paginatedExercises?.map((exercise) => (
          <div
            key={exercise.id}
            className="p-4 border rounded-lg"
          >
            <div className="flex gap-4">
              {exercise.image_url && (
                <div className="w-32 h-32 relative">
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
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setEditingExercise(exercise)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="destructive"
                      size="icon"
                      onClick={() => deleteExercise.mutate(exercise.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}

        {totalPages > 1 && (
          <div className="flex justify-center gap-2 mt-4">
            <Button
              variant="outline"
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
            >
              Previous
            </Button>
            <span className="py-2">
              Page {currentPage} of {totalPages}
            </span>
            <Button
              variant="outline"
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
            >
              Next
            </Button>
          </div>
        )}
      </div>

      <Dialog open={!!editingExercise} onOpenChange={handleClose}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader className="flex flex-row items-center justify-between">
            <DialogTitle>Edit Exercise</DialogTitle>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleClose}
              className="h-6 w-6 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </DialogHeader>
          {editingExercise && (
            <div className="space-y-4">
              <ExerciseForm
                workoutGoals={workoutGoals}
                exercise={editingExercise}
                onSuccess={handleClose}
              />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ExerciseList;