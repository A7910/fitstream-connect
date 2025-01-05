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
    video_url: string | null;
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
    video_url: exercise?.video_url || null,
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [videoFile, setVideoFile] = useState<File | null>(null);

  const uploadImage = async () => {
    if (!imageFile) return newExercise.image_url;

    const fileExt = imageFile.name.split('.').pop();
    const filePath = `${crypto.randomUUID()}.${fileExt}`;

    console.log("Starting image upload process...");
    console.log("File path:", filePath);

    try {
      const { error: uploadError, data } = await supabase.storage
        .from('exercise-images')
        .upload(filePath, imageFile);

      if (uploadError) {
        console.error("Image upload error:", uploadError);
        throw uploadError;
      }

      console.log("Image uploaded successfully:", data);

      const { data: { publicUrl } } = supabase.storage
        .from('exercise-images')
        .getPublicUrl(filePath);

      console.log("Generated public URL:", publicUrl);
      return publicUrl;
    } catch (error) {
      console.error("Error in uploadImage:", error);
      throw error;
    }
  };

  const uploadVideo = async () => {
    if (!videoFile) return newExercise.video_url;

    const fileExt = videoFile.name.split('.').pop();
    const filePath = `${crypto.randomUUID()}.${fileExt}`;

    console.log("Starting video upload process...");
    console.log("File path:", filePath);

    try {
      const { error: uploadError, data } = await supabase.storage
        .from('exercise-videos')
        .upload(filePath, videoFile);

      if (uploadError) {
        console.error("Video upload error:", uploadError);
        throw uploadError;
      }

      console.log("Video uploaded successfully:", data);

      const { data: { publicUrl } } = supabase.storage
        .from('exercise-videos')
        .getPublicUrl(filePath);

      console.log("Generated public URL:", publicUrl);
      return publicUrl;
    } catch (error) {
      console.error("Error in uploadVideo:", error);
      throw error;
    }
  };

  const mutation = useMutation({
    mutationFn: async () => {
      console.log("Starting mutation with exercise:", exercise?.id ? "update" : "create");
      
      let [imageUrl, videoUrl] = await Promise.all([
        uploadImage(),
        uploadVideo()
      ]);

      console.log("Image URL after upload:", imageUrl);
      console.log("Video URL after upload:", videoUrl);

      try {
        if (exercise?.id) {
          // If updating and there's a new image/video, delete the old ones
          if (imageFile && exercise.image_url) {
            const oldImagePath = exercise.image_url.split('/').pop();
            if (oldImagePath) {
              console.log("Deleting old image:", oldImagePath);
              await supabase.storage
                .from('exercise-images')
                .remove([oldImagePath]);
            }
          }

          if (videoFile && exercise.video_url) {
            const oldVideoPath = exercise.video_url.split('/').pop();
            if (oldVideoPath) {
              console.log("Deleting old video:", oldVideoPath);
              await supabase.storage
                .from('exercise-videos')
                .remove([oldVideoPath]);
            }
          }

          const { data, error } = await supabase
            .from('exercises')
            .update({ 
              ...newExercise, 
              image_url: imageUrl || newExercise.image_url,
              video_url: videoUrl || newExercise.video_url
            })
            .eq('id', exercise.id)
            .select('*')
            .maybeSingle();

          if (error) {
            console.error("Error updating exercise:", error);
            throw error;
          }
          
          console.log("Exercise updated successfully:", data);
          return data;
        } else {
          const { data, error } = await supabase
            .from('exercises')
            .insert([{ 
              ...newExercise, 
              image_url: imageUrl,
              video_url: videoUrl
            }])
            .select('*')
            .maybeSingle();

          if (error) {
            console.error("Error creating exercise:", error);
            throw error;
          }
          
          console.log("Exercise created successfully:", data);
          return data;
        }
      } catch (error) {
        console.error("Error in mutation:", error);
        throw error;
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
        video_url: null,
      });
      setImageFile(null);
      setVideoFile(null);
      queryClient.invalidateQueries({ queryKey: ["exercises"] });
      onSuccess?.();
    },
    onError: (error) => {
      console.error("Error saving exercise:", error);
      toast({
        title: "Error",
        description: `Failed to ${exercise ? 'update' : 'create'} exercise. Please try again.`,
        variant: "destructive",
      });
    },
  });

  return (
    <div className="space-y-4">
      <ExerciseFormFields
        exercise={newExercise}
        workoutGoals={workoutGoals}
        onFieldChange={(field, value) => setNewExercise(prev => ({ ...prev, [field]: value }))}
        imageFile={imageFile}
        setImageFile={setImageFile}
        videoFile={videoFile}
        setVideoFile={setVideoFile}
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