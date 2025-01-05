import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import ExerciseFormFields from "./form/ExerciseFormFields";
import { uploadExerciseImage, updateExercise, createExercise } from "@/utils/exercise-operations";
import { supabase } from "@/integrations/supabase/client";

interface ExerciseFormProps {
  workoutGoals: Array<{ id: string; name: string; }> | undefined;
  exercise?: {
    id: string;
    name: string;
    description: string;
    muscle_group: string;
    difficulty_level: string;
    goal_id: string;
    sets: number;
    image_url: string | null;
  };
  onSuccess?: () => void;
  isEditing?: boolean;
}

const ExerciseForm = ({ workoutGoals, exercise, onSuccess, isEditing = false }: ExerciseFormProps) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [newExercise, setNewExercise] = useState({
    name: exercise?.name || "",
    description: exercise?.description || "",
    muscle_group: exercise?.muscle_group || "",
    difficulty_level: exercise?.difficulty_level || "",
    goal_id: exercise?.goal_id || "",
    sets: exercise?.sets || 3,
    image_url: exercise?.image_url || null,
  });
  const [imageFile, setImageFile] = useState<File | null>(null);

  const mutation = useMutation({
    mutationFn: async () => {
      // First verify admin status - check specifically for the current user
      const { data: adminCheck, error: adminError } = await supabase
        .from('admin_users')
        .select('user_id')
        .eq('user_id', (await supabase.auth.getUser()).data.user?.id)
        .maybeSingle();
      
      console.log("Admin check result:", adminCheck);
      
      if (adminError) {
        console.error("Error checking admin status:", adminError);
        throw new Error("Error verifying admin status");
      }

      if (!adminCheck) {
        console.error("User is not an admin");
        throw new Error("Unauthorized: User is not an admin");
      }

      console.log("Starting mutation for exercise:", exercise?.id ? "update" : "create");
      console.log("Current exercise data:", newExercise);
      
      try {
        let imageUrl = newExercise.image_url;
        if (imageFile) {
          console.log("Uploading new image file...");
          imageUrl = await uploadExerciseImage(imageFile, exercise?.image_url);
          console.log("New image URL:", imageUrl);
        }

        const exerciseData = {
          name: newExercise.name,
          description: newExercise.description,
          muscle_group: newExercise.muscle_group,
          difficulty_level: newExercise.difficulty_level,
          goal_id: newExercise.goal_id,
          sets: newExercise.sets,
          ...(imageUrl && { image_url: imageUrl })
        };

        console.log("Prepared exercise data:", exerciseData);

        if (exercise?.id) {
          console.log("Updating existing exercise with ID:", exercise.id);
          // Direct database query to check current exercise data
          const { data: currentExercise } = await supabase
            .from('exercises')
            .select('*')
            .eq('id', exercise.id)
            .maybeSingle();
          
          console.log("Current exercise in database:", currentExercise);
          
          const updatedExercise = await updateExercise(exercise.id, exerciseData);
          console.log("Exercise updated successfully:", updatedExercise);
          return updatedExercise;
        } else {
          console.log("Creating new exercise");
          const newExerciseData = await createExercise(exerciseData);
          console.log("Exercise created successfully:", newExerciseData);
          return newExerciseData;
        }
      } catch (error) {
        console.error("Error in mutation:", error);
        throw error;
      }
    },
    onSuccess: (data) => {
      console.log("Mutation completed successfully:", data);
      toast({
        title: "Success",
        description: `Exercise ${exercise ? 'updated' : 'created'} successfully`,
      });
      if (!exercise) {
        setNewExercise({
          name: "",
          description: "",
          muscle_group: "",
          difficulty_level: "",
          goal_id: "",
          sets: 3,
          image_url: null,
        });
        setImageFile(null);
      }
      queryClient.invalidateQueries({ queryKey: ["exercises"] });
      onSuccess?.();
    },
    onError: (error: any) => {
      console.error("Error saving exercise:", error);
      toast({
        title: "Error",
        description: error.message || `Failed to ${exercise ? 'update' : 'create'} exercise. Please try again.`,
        variant: "destructive",
      });
    },
  });

  return (
    <div className="space-y-4">
      <ExerciseFormFields
        exercise={newExercise}
        workoutGoals={workoutGoals}
        onFieldChange={(field, value) => {
          console.log(`Updating field ${field} with value:`, value);
          setNewExercise(prev => ({ ...prev, [field]: value }));
        }}
        imageFile={imageFile}
        setImageFile={setImageFile}
        isEditing={isEditing}
      />
      <div className="flex justify-end gap-2 mt-6">
        <Button 
          onClick={() => mutation.mutate()}
          disabled={!newExercise.name || !newExercise.muscle_group || !newExercise.difficulty_level || !newExercise.goal_id}
        >
          {exercise ? 'Save Changes' : 'Create Exercise'}
        </Button>
      </div>
    </div>
  );
};

export default ExerciseForm;