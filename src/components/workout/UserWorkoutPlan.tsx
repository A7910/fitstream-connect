import { Card, CardContent } from "@/components/ui/card";
import { UserWorkoutHeader } from "./UserWorkoutHeader";
import { WorkoutSelectors } from "./WorkoutSelectors";
import { WorkoutExercises } from "./WorkoutExercises";
import { useState } from "react";

const UserWorkoutPlan = () => {
  const [selectedWeek, setSelectedWeek] = useState<string>("");
  const [selectedDay, setSelectedDay] = useState<string>("");

  return (
    <Card className="w-full">
      <UserWorkoutHeader />
      <CardContent>
        <div className="space-y-6">
          <WorkoutSelectors
            selectedWeek={selectedWeek}
            setSelectedWeek={setSelectedWeek}
            selectedDay={selectedDay}
            setSelectedDay={setSelectedDay}
          />
          {selectedDay && (
            <WorkoutExercises selectedDay={selectedDay} />
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default UserWorkoutPlan;