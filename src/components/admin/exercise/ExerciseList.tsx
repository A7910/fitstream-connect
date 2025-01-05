import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { X } from "lucide-react";
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
import { Button } from "@/components/ui/button";
import ExerciseCard from "./ExerciseCard";

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
          <ExerciseCard
            key={exercise.id}
            exercise={exercise}
            onEdit={setEditingExercise}
            onDelete={(id) => deleteExercise.mutate(id)}
          />
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