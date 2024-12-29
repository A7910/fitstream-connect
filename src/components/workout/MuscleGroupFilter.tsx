import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface MuscleGroupFilterProps {
  value: string;
  onValueChange: (value: string) => void;
  muscleGroups: string[];
}

const MuscleGroupFilter = ({ value, onValueChange, muscleGroups }: MuscleGroupFilterProps) => {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">Filter by Muscle Group</label>
      <Select
        value={value}
        onValueChange={onValueChange}
      >
        <SelectTrigger>
          <SelectValue placeholder="All muscle groups" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All muscle groups</SelectItem>
          {muscleGroups.map((group) => (
            <SelectItem key={group} value={group}>
              {group}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default MuscleGroupFilter;