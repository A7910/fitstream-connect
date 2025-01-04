import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";

const USERS_PER_PAGE = 8;

const AssignedWorkoutViewer = () => {
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [selectedWeek, setSelectedWeek] = useState<string | null>(null);
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  // Fetch users with assigned workouts
  const { data: usersWithWorkouts = [], isLoading: isLoadingUsers } = useQuery({
    queryKey: ["users-with-workouts"],
    queryFn: async () => {
      console.log("Fetching users with workouts...");
      const { data: weeks, error: weeksError } = await supabase
        .from("dedicated_workout_weeks")
        .select(`
          id,
          user_id,
          profiles (
            id,
            full_name,
            avatar_url
          )
        `)
        .order('created_at', { ascending: false });

      if (weeksError) throw weeksError;

      // Get unique users
      const uniqueUsers = Array.from(
        new Map(weeks.map(week => [week.user_id, week.profiles])).values()
      );

      console.log("Found users with workouts:", uniqueUsers);
      return uniqueUsers;
    },
  });

  // Fetch weeks for selected user
  const { data: weeks = [] } = useQuery({
    queryKey: ["user-workout-weeks", selectedUser],
    enabled: !!selectedUser,
    queryFn: async () => {
      console.log("Fetching weeks for user:", selectedUser);
      const { data, error } = await supabase
        .from("dedicated_workout_weeks")
        .select("*")
        .eq("user_id", selectedUser)
        .order("week_number");

      if (error) throw error;
      console.log("Found weeks:", data);
      return data;
    },
  });

  // Fetch days for selected week
  const { data: days = [] } = useQuery({
    queryKey: ["workout-days", selectedWeek],
    enabled: !!selectedWeek,
    queryFn: async () => {
      console.log("Fetching days for week:", selectedWeek);
      const { data, error } = await supabase
        .from("dedicated_workout_days")
        .select("*")
        .eq("week_id", selectedWeek)
        .order("day_number");

      if (error) throw error;
      console.log("Found days:", data);
      return data;
    },
  });

  // Fetch exercises for selected day
  const { data: exercises = [], isLoading: isLoadingExercises } = useQuery({
    queryKey: ["day-exercises", selectedDay],
    enabled: !!selectedDay,
    queryFn: async () => {
      console.log("Fetching exercises for day:", selectedDay);
      const { data, error } = await supabase
        .from("dedicated_workout_exercises")
        .select(`
          *,
          exercises (
            name,
            description,
            muscle_group,
            difficulty_level
          )
        `)
        .eq("day_id", selectedDay);

      if (error) throw error;
      console.log("Found exercises:", data);
      return data;
    },
  });

  // Filter users based on search
  const filteredUsers = usersWithWorkouts.filter(user =>
    user.full_name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isLoadingUsers) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Assigned Workouts</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <Input
              type="search"
              placeholder="Search users..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <ScrollArea className="h-[400px] rounded-md border">
              <div className="p-4 space-y-2">
                {filteredUsers.map((user) => (
                  <div
                    key={user.id}
                    className={`flex items-center space-x-3 p-2 rounded-lg cursor-pointer hover:bg-muted/50 transition-colors ${
                      selectedUser === user.id ? "bg-muted" : ""
                    }`}
                    onClick={() => {
                      setSelectedUser(user.id);
                      setSelectedWeek(null);
                      setSelectedDay(null);
                    }}
                  >
                    <Avatar>
                      <AvatarImage src={user.avatar_url || undefined} />
                      <AvatarFallback>
                        <User className="h-4 w-4" />
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm font-medium">
                      {user.full_name || "Unnamed User"}
                    </span>
                  </div>
                ))}
                {filteredUsers.length === 0 && (
                  <div className="text-sm text-muted-foreground text-center py-4">
                    {searchQuery
                      ? "No users found matching your search"
                      : "No users with assigned workouts"}
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>

          <div className="space-y-6">
            {selectedUser && (
              <div className="space-y-4">
                <Select
                  value={selectedWeek || ""}
                  onValueChange={(value) => {
                    setSelectedWeek(value);
                    setSelectedDay(null);
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select week" />
                  </SelectTrigger>
                  <SelectContent>
                    {weeks.map((week) => (
                      <SelectItem key={week.id} value={week.id}>
                        Week {week.week_number}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {selectedWeek && (
                  <Select
                    value={selectedDay || ""}
                    onValueChange={setSelectedDay}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select day" />
                    </SelectTrigger>
                    <SelectContent>
                      {days.map((day) => (
                        <SelectItem key={day.id} value={day.id}>
                          Day {day.day_number}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}

                {selectedDay && (
                  <div className="space-y-4">
                    <h3 className="font-semibold">Assigned Exercises</h3>
                    {isLoadingExercises ? (
                      <div className="flex items-center justify-center p-4">
                        <Loader2 className="h-6 w-6 animate-spin" />
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {exercises.map((exercise) => (
                          <div
                            key={exercise.id}
                            className="p-4 border rounded-lg space-y-2"
                          >
                            <h4 className="font-medium">
                              {exercise.exercises.name}
                            </h4>
                            <p className="text-sm text-muted-foreground">
                              {exercise.exercises.description}
                            </p>
                            <div className="text-sm">
                              <p>Sets: {exercise.sets}</p>
                              <p>Reps: {exercise.reps || "Not specified"}</p>
                              {exercise.notes && <p>Notes: {exercise.notes}</p>}
                            </div>
                            <div className="flex gap-2 text-xs">
                              <span className="px-2 py-1 bg-muted rounded-full">
                                {exercise.exercises.muscle_group}
                              </span>
                              <span className="px-2 py-1 bg-muted rounded-full">
                                {exercise.exercises.difficulty_level}
                              </span>
                            </div>
                          </div>
                        ))}
                        {exercises.length === 0 && (
                          <p className="text-sm text-muted-foreground text-center py-4">
                            No exercises assigned for this day
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AssignedWorkoutViewer;