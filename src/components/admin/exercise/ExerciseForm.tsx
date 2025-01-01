import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import ExerciseFormFields from "./form/ExerciseFormFields";

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
}

const ExerciseForm = ({ workoutGoals, exercise, onSuccess }: ExerciseFormProps) => {
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

  const uploadImage = async () => {
    if (!imageFile) return null;

    const fileExt = imageFile.name.split('.').pop();
    const filePath = `${crypto.randomUUID()}.${fileExt}`;

    const { error: uploadError, data } = await supabase.storage
      .from('exercise-images')
      .upload(filePath, imageFile);

    if (uploadError) throw uploadError;

    const { data: { publicUrl } } = supabase.storage
      .from('exercise-images')
      .getPublicUrl(filePath);

    return publicUrl;
  };

  const handleFieldChange = (field: string, value: any) => {
    setNewExercise(prev => ({ ...prev, [field]: value }));
  };

  const mutation = useMutation({
    mutationFn: async () => {
      let imageUrl = newExercise.image_url;

      if (imageFile) {
        imageUrl = await uploadImage();
      }

      if (exercise?.id) {
        const { data, error } = await supabase
          .from('exercises')
          .update({ ...newExercise, image_url: imageUrl })
          .eq('id', exercise.id)
          .select()
          .single();

        if (error) throw error;
        return data;
      } else {
        const { data, error } = await supabase
          .from('exercises')
          .insert([{ ...newExercise, image_url: imageUrl }])
          .select()
          .single();

        if (error) throw error;
        return data;
      }
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: `Exercise ${exercise ? 'updated' : 'created'} successfully`,
      });
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
      queryClient.invalidateQueries({ queryKey: ["exercises"] });
      onSuccess?.();
    },
    onError: (error) => {
      console.error("Error saving exercise:", error);
      toast({
        title: "Error",
        description: `Failed to ${exercise ? 'update' : 'create'} exercise`,
        variant: "destructive",
      });
    },
  });

  return (
    <div className="space-y-4">
      <ExerciseFormFields
        exercise={newExercise}
        workoutGoals={workoutGoals}
        onFieldChange={handleFieldChange}
        imageFile={imageFile}
        setImageFile={setImageFile}
      />
      <Button 
        onClick={() => mutation.mutate()}
        disabled={!newExercise.name || !newExercise.muscle_group || !newExercise.difficulty_level || !newExercise.goal_id}
      >
        {exercise ? 'Update' : 'Create'} Exercise
      </Button>
    </div>
  );
};

export default ExerciseForm;