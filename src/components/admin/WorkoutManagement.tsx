import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import WorkoutGoalManager from "./WorkoutGoalManager";
import ExerciseManager from "./ExerciseManager";

const WorkoutManagement = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Workout Management</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="workout-goals" className="space-y-4">
          <TabsList>
            <TabsTrigger value="workout-goals">Workout Goals</TabsTrigger>
            <TabsTrigger value="exercises">Exercises</TabsTrigger>
          </TabsList>

          <TabsContent value="workout-goals">
            <WorkoutGoalManager />
          </TabsContent>

          <TabsContent value="exercises">
            <ExerciseManager />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default WorkoutManagement;