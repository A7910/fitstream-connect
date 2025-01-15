import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { GoalForm } from "./workout/GoalForm";
import { GoalList } from "./workout/GoalList";

const WorkoutGoalManager = () => {
  const { toast } = useToast();

  const { data: workoutGoals, isLoading } = useQuery({
    queryKey: ["workoutGoals"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("workout_goals")
        .select("*")
        .order("created_at", { ascending: false });
      
      if (error) {
        console.error("Error fetching workout goals:", error);
        toast({
          title: "Error",
          description: "Failed to fetch workout goals",
          variant: "destructive",
        });
        throw error;
      }
      return data;
    },
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Workout Goals</CardTitle>
        <CardDescription>Create and manage workout goals</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <GoalForm />
          <div className="mt-6">
            <h3 className="text-lg font-semibold mb-4">Existing Goals</h3>
            <GoalList goals={workoutGoals || []} isLoading={isLoading} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default WorkoutGoalManager;