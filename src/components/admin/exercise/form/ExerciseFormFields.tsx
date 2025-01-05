import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ImageUpload } from "@/components/ui/image-upload";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ExerciseFormFieldsProps {
  exercise: {
    name: string;
    description: string;
    muscle_group: string;
    difficulty_level: string;
    goal_id: string;
    sets: number;
    image_url: string | null;
  };
  workoutGoals: Array<{ id: string; name: string; }> | undefined;
  onFieldChange: (field: string, value: any) => void;
  imageFile: File | null;
  setImageFile: (file: File | null) => void;
  isEditing?: boolean;
}

const ExerciseFormFields = ({
  exercise,
  workoutGoals,
  onFieldChange,
  imageFile,
  setImageFile,
  isEditing = false,
}: ExerciseFormFieldsProps) => {
  return (
    <>
      <div className="space-y-2">
        <Label htmlFor="exerciseName">Exercise Name</Label>
        <Input
          id="exerciseName"
          value={exercise.name}
          onChange={(e) => onFieldChange("name", e.target.value)}
          placeholder="Enter exercise name"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="exerciseDescription">Description</Label>
        <Textarea
          id="exerciseDescription"
          value={exercise.description}
          onChange={(e) => onFieldChange("description", e.target.value)}
          placeholder="Enter exercise description"
        />
      </div>
      {!isEditing && (
        <div className="space-y-2">
          <Label>Exercise Image</Label>
          <ImageUpload
            value={exercise.image_url}
            onChange={(file) => setImageFile(file)}
            onRemove={() => {
              setImageFile(null);
              onFieldChange("image_url", null);
            }}
          />
        </div>
      )}
      <div className="space-y-2">
        <Label htmlFor="muscleGroup">Muscle Group</Label>
        <Input
          id="muscleGroup"
          value={exercise.muscle_group}
          onChange={(e) => onFieldChange("muscle_group", e.target.value)}
          placeholder="E.g., Chest, Back, Legs"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="difficultyLevel">Difficulty Level</Label>
        <Select
          value={exercise.difficulty_level}
          onValueChange={(value) => onFieldChange("difficulty_level", value)}
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
          value={exercise.goal_id}
          onValueChange={(value) => onFieldChange("goal_id", value)}
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
          value={exercise.sets}
          onChange={(e) => onFieldChange("sets", parseInt(e.target.value) || 3)}
          min={1}
        />
      </div>
    </>
  );
};

export default ExerciseFormFields;