import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import ExerciseFormFields from "./form/ExerciseFormFields";

interface Exercise {
  id: string;
  name: string;
  description: string | null;
  muscle_group: string;
  difficulty_level: string;
  sets: number;
  goal_id: string;
  image_url: string | null;
  video_url: string | null;
}

interface ExerciseFormProps {
  workoutGoals?: Array<{ id: string; name: string }>;
  exercise?: Exercise;
  onSuccess?: () => void;
}

const ExerciseForm = ({ workoutGoals, exercise, onSuccess }: ExerciseFormProps) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const createExercise = useMutation({
    mutationFn: async (formData: FormData) => {
      console.log("Creating exercise...");
      try {
        const exerciseData = {
          name: formData.get("name"),
          description: formData.get("description"),
          muscle_group: formData.get("muscle_group"),
          difficulty_level: formData.get("difficulty_level"),
          sets: Number(formData.get("sets")),
          goal_id: formData.get("goal_id"),
        };

        // Handle image upload if present
        const imageFile = formData.get("image") as File;
        let image_url = null;
        if (imageFile && imageFile.size > 0) {
          console.log("Uploading image...");
          const { data: imageData, error: imageError } = await supabase.storage
            .from("exercise-images")
            .upload(`${crypto.randomUUID()}.${imageFile.name.split(".").pop()}`, imageFile);

          if (imageError) {
            console.error("Error uploading image:", imageError);
            throw imageError;
          }
          image_url = `${supabase.storageUrl}/object/public/exercise-images/${imageData.path}`;
        }

        // Handle video upload if present
        const videoFile = formData.get("video") as File;
        let video_url = null;
        if (videoFile && videoFile.size > 0) {
          console.log("Uploading video...");
          const { data: videoData, error: videoError } = await supabase.storage
            .from("exercise-videos")
            .upload(`${crypto.randomUUID()}.${videoFile.name.split(".").pop()}`, videoFile);

          if (videoError) {
            console.error("Error uploading video:", videoError);
            throw videoError;
          }
          video_url = `${supabase.storageUrl}/object/public/exercise-videos/${videoData.path}`;
        }

        // Create exercise with media URLs
        const { data, error } = await supabase
          .from("exercises")
          .insert([{ ...exerciseData, image_url, video_url }])
          .select()
          .maybeSingle();

        if (error) throw error;
        return data;
      } catch (error) {
        console.error("Error saving exercise:", error);
        throw error;
      }
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Exercise created successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["exercises"] });
      onSuccess?.();
    },
    onError: (error) => {
      console.error("Error saving exercise:", error);
      toast({
        title: "Error",
        description: "Failed to create exercise. Please try again.",
        variant: "destructive",
      });
    },
  });

  const updateExercise = useMutation({
    mutationFn: async (formData: FormData) => {
      console.log("Updating exercise...");
      if (!exercise) return null;

      try {
        const exerciseData = {
          name: formData.get("name"),
          description: formData.get("description"),
          muscle_group: formData.get("muscle_group"),
          difficulty_level: formData.get("difficulty_level"),
          sets: Number(formData.get("sets")),
          goal_id: formData.get("goal_id"),
        };

        // Handle image upload if present
        const imageFile = formData.get("image") as File;
        let image_url = exercise.image_url;
        if (imageFile && imageFile.size > 0) {
          console.log("Uploading new image...");
          // Delete old image if exists
          if (exercise.image_url) {
            const oldImagePath = exercise.image_url.split("/").pop();
            if (oldImagePath) {
              await supabase.storage
                .from("exercise-images")
                .remove([oldImagePath]);
            }
          }

          const { data: imageData, error: imageError } = await supabase.storage
            .from("exercise-images")
            .upload(`${crypto.randomUUID()}.${imageFile.name.split(".").pop()}`, imageFile);

          if (imageError) {
            console.error("Error uploading image:", imageError);
            throw imageError;
          }
          image_url = `${supabase.storageUrl}/object/public/exercise-images/${imageData.path}`;
        }

        // Handle video upload if present
        const videoFile = formData.get("video") as File;
        let video_url = exercise.video_url;
        if (videoFile && videoFile.size > 0) {
          console.log("Uploading new video...");
          // Delete old video if exists
          if (exercise.video_url) {
            const oldVideoPath = exercise.video_url.split("/").pop();
            if (oldVideoPath) {
              await supabase.storage
                .from("exercise-videos")
                .remove([oldVideoPath]);
            }
          }

          const { data: videoData, error: videoError } = await supabase.storage
            .from("exercise-videos")
            .upload(`${crypto.randomUUID()}.${videoFile.name.split(".").pop()}`, videoFile);

          if (videoError) {
            console.error("Error uploading video:", videoError);
            throw videoError;
          }
          video_url = `${supabase.storageUrl}/object/public/exercise-videos/${videoData.path}`;
        }

        // Update exercise with media URLs
        const { data, error } = await supabase
          .from("exercises")
          .update({ ...exerciseData, image_url, video_url })
          .eq("id", exercise.id)
          .select()
          .maybeSingle();

        if (error) throw error;
        return data;
      } catch (error) {
        console.error("Error updating exercise:", error);
        throw error;
      }
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Exercise updated successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["exercises"] });
      onSuccess?.();
    },
    onError: (error) => {
      console.error("Error updating exercise:", error);
      toast({
        title: "Error",
        description: "Failed to update exercise. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const formData = new FormData(e.currentTarget);
      if (exercise) {
        await updateExercise.mutateAsync(formData);
      } else {
        await createExercise.mutateAsync(formData);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <ExerciseFormFields
        workoutGoals={workoutGoals}
        exercise={exercise}
        isSubmitting={isSubmitting}
      />
    </form>
  );
};

export default ExerciseForm;