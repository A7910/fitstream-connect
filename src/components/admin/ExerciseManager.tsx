import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import ExerciseForm from "./exercise/ExerciseForm";
import ExerciseList from "./exercise/ExerciseList";

const ExerciseManager = () => {
  const { data: workoutGoals } = useQuery({
    queryKey: ["workoutGoals"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("workout_goals")
        .select("*");
      
      if (error) {
        console.error("Error fetching workout goals:", error);
        throw error;
      }
      return data;
    },
  });

  const { data: exercises, isLoading, error } = useQuery({
    queryKey: ["exercises"],
    queryFn: async () => {
      console.log("Fetching exercises...");
      const { data, error } = await supabase
        .from("exercises")
        .select(`
          *,
          workout_goals (
            name
          )
        `)
        .order("created_at", { ascending: false });
      
      if (error) {
        console.error("Error fetching exercises:", error);
        throw error;
      }

      console.log("Fetched exercises:", data);
      return data;
    },
  });

  if (error) {
    console.error("Error in ExerciseManager:", error);
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Exercises</CardTitle>
        <CardDescription>Create and manage exercises</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <ExerciseForm workoutGoals={workoutGoals} />
          <div className="mt-6">
            <h3 className="text-lg font-semibold mb-4">Existing Exercises</h3>
            <ExerciseList 
              exercises={exercises} 
              isLoading={isLoading} 
              workoutGoals={workoutGoals}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ExerciseManager;