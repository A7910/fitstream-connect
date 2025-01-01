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
import { useToast } from "@/components/ui/use-toast";

const ExerciseManager = () => {
  const { toast } = useToast();

  const { data: workoutGoals } = useQuery({
    queryKey: ["workoutGoals"],
    queryFn: async () => {
      console.log("Fetching workout goals...");
      const { data, error } = await supabase
        .from("workout_goals")
        .select("*");
      
      if (error) {
        console.error("Error fetching workout goals:", error);
        toast({
          title: "Error",
          description: "Failed to fetch workout goals. Please try again.",
          variant: "destructive",
        });
        throw error;
      }
      console.log("Fetched workout goals:", data);
      return data;
    },
  });

  const { data: exercises, isLoading, error } = useQuery({
    queryKey: ["exercises"],
    queryFn: async () => {
      console.log("Fetching exercises...");
      try {
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
          toast({
            title: "Error",
            description: "Failed to fetch exercises. Please try again.",
            variant: "destructive",
          });
          throw error;
        }

        if (!data) {
          console.log("No exercises found");
          return [];
        }

        console.log("Fetched exercises successfully:", data);
        return data;
      } catch (error) {
        console.error("Error in exercise query:", error);
        toast({
          title: "Error",
          description: "Failed to fetch exercises. Please try again.",
          variant: "destructive",
        });
        throw error;
      }
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
              exercises={exercises || []} 
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