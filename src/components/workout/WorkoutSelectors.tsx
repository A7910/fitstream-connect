import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface WorkoutSelectorsProps {
  selectedWeek: string;
  setSelectedWeek: (week: string) => void;
  selectedDay: string;
  setSelectedDay: (day: string) => void;
}

export const WorkoutSelectors = ({
  selectedWeek,
  setSelectedWeek,
  selectedDay,
  setSelectedDay,
}: WorkoutSelectorsProps) => {
  const { data: workoutWeeks, isLoading: weeksLoading } = useQuery({
    queryKey: ["user-workout-weeks"],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return null;

      const { data: weeks, error: weeksError } = await supabase
        .from("dedicated_workout_weeks")
        .select("id, week_number")
        .eq("user_id", session.user.id)
        .order("week_number");

      if (weeksError) {
        console.error("Error fetching weeks:", weeksError);
        throw weeksError;
      }

      return weeks;
    },
  });

  const { data: workoutDays } = useQuery({
    queryKey: ["user-workout-days", selectedWeek],
    enabled: !!selectedWeek,
    queryFn: async () => {
      const { data: days, error: daysError } = await supabase
        .from("dedicated_workout_days")
        .select("id, day_number")
        .eq("week_id", selectedWeek)
        .order("day_number");

      if (daysError) {
        console.error("Error fetching days:", daysError);
        throw daysError;
      }

      return days;
    },
  });

  if (weeksLoading) {
    return <div>Loading selectors...</div>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <Select
        value={selectedWeek}
        onValueChange={setSelectedWeek}
      >
        <SelectTrigger>
          <SelectValue placeholder="Select Week" />
        </SelectTrigger>
        <SelectContent>
          {workoutWeeks?.map((week) => (
            <SelectItem key={week.id} value={week.id}>
              Week {week.week_number}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={selectedDay}
        onValueChange={setSelectedDay}
        disabled={!selectedWeek || !workoutDays?.length}
      >
        <SelectTrigger>
          <SelectValue placeholder="Select Day" />
        </SelectTrigger>
        <SelectContent>
          {workoutDays?.map((day) => (
            <SelectItem key={day.id} value={day.id}>
              Day {day.day_number}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};