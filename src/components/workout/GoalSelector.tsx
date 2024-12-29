import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface GoalSelectorProps {
  value: string | undefined;
  onValueChange: (value: string) => void;
  workoutGoals: Array<{ id: string; name: string; }> | undefined;
}

const GoalSelector = ({ value, onValueChange, workoutGoals }: GoalSelectorProps) => {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">Select Your Goal</label>
      <Select
        value={value}
        onValueChange={onValueChange}
      >
        <SelectTrigger>
          <SelectValue placeholder="Choose a goal" />
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
  );
};

export default GoalSelector;