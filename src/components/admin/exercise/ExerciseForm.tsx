import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { ImageUpload } from "@/components/ui/image-upload";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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

  const mutation = useMutation({
    mutationFn: async () => {
      let imageUrl = newExercise.image_url;

      if (imageFile) {
        imageUrl = await uploadImage();
      }

      if (exercise?.id) {
        // Update existing exercise
        const { data, error } = await supabase
          .from('exercises')
          .update({ ...newExercise, image_url: imageUrl })
          .eq('id', exercise.id)
          .select()
          .single();

        if (error) throw error;
        return data;
      } else {
        // Create new exercise
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
      <div className="space-y-2">
        <Label htmlFor="exerciseName">Exercise Name</Label>
        <Input
          id="exerciseName"
          value={newExercise.name}
          onChange={(e) => setNewExercise(prev => ({ ...prev, name: e.target.value }))}
          placeholder="Enter exercise name"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="exerciseDescription">Description</Label>
        <Textarea
          id="exerciseDescription"
          value={newExercise.description}
          onChange={(e) => setNewExercise(prev => ({ ...prev, description: e.target.value }))}
          placeholder="Enter exercise description"
        />
      </div>
      <div className="space-y-2">
        <Label>Exercise Image</Label>
        <ImageUpload
          value={newExercise.image_url}
          onChange={(file) => setImageFile(file)}
          onRemove={() => {
            setImageFile(null);
            setNewExercise(prev => ({ ...prev, image_url: null }));
          }}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="muscleGroup">Muscle Group</Label>
        <Input
          id="muscleGroup"
          value={newExercise.muscle_group}
          onChange={(e) => setNewExercise(prev => ({ ...prev, muscle_group: e.target.value }))}
          placeholder="E.g., Chest, Back, Legs"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="difficultyLevel">Difficulty Level</Label>
        <Select
          value={newExercise.difficulty_level}
          onValueChange={(value) => setNewExercise(prev => ({ ...prev, difficulty_level: value }))}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select difficulty" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Beginner">Beginner</SelectItem>
            <SelectItem value="Intermediate">Intermediate</SelectItem>
            <SelectItem value="Advanced">Advanced</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label htmlFor="goalSelect">Workout Goal</Label>
        <Select
          value={newExercise.goal_id}
          onValueChange={(value) => setNewExercise(prev => ({ ...prev, goal_id: value }))}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select a goal" />
          </SelectTrigger>
          <SelectContent>
            {workoutGoals?.map((goal) => (
              <SelectItem key={goal.id} value={goal.id}>
                {goal.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label htmlFor="sets">Number of Sets</Label>
        <Input
          id="sets"
          type="number"
          value={newExercise.sets}
          onChange={(e) => setNewExercise(prev => ({ ...prev, sets: parseInt(e.target.value) || 3 }))}
          min={1}
        />
      </div>
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