import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface WeekDaySelectorProps {
  selectedWeek: number;
  selectedDay: number;
  onWeekChange: (week: number) => void;
  onDayChange: (day: number) => void;
}

const WeekDaySelector = ({
  selectedWeek,
  selectedDay,
  onWeekChange,
  onDayChange,
}: WeekDaySelectorProps) => {
  const weeks = [1, 2, 3, 4];
  const days = [1, 2, 3, 4, 5, 6, 7];

  return (
    <div className="grid grid-cols-2 gap-4">
      <div className="space-y-2">
        <Label>Week</Label>
        <Select
          value={selectedWeek.toString()}
          onValueChange={(value) => onWeekChange(parseInt(value))}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select week" />
          </SelectTrigger>
          <SelectContent>
            {weeks.map((week) => (
              <SelectItem key={week} value={week.toString()}>
                Week {week}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Day</Label>
        <Select
          value={selectedDay.toString()}
          onValueChange={(value) => onDayChange(parseInt(value))}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select day" />
          </SelectTrigger>
          <SelectContent>
            {days.map((day) => (
              <SelectItem key={day} value={day.toString()}>
                Day {day}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};

export default WeekDaySelector;