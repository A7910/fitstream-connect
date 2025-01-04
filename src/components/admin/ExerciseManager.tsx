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
import { Pagination } from "@/components/ui/pagination";

interface ExerciseManagerProps {
  page?: number;
  itemsPerPage?: number;
  onPageChange?: (page: number) => void;
}

const ExerciseManager = ({ 
  page = 1, 
  itemsPerPage = 5,
  onPageChange 
}: ExerciseManagerProps) => {
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

  const { data: exercisesData, isLoading, error } = useQuery({
    queryKey: ["exercises", page],
    queryFn: async () => {
      console.log("Fetching exercises...");
      try {
        // First get total count
        const { count, error: countError } = await supabase
          .from("exercises")
          .select("*", { count: 'exact', head: true });

        if (countError) throw countError;

        // Then get paginated data
        const { data, error } = await supabase
          .from("exercises")
          .select(`
            *,
            workout_goals (
              name
            )
          `)
          .range((page - 1) * itemsPerPage, page * itemsPerPage - 1)
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
          return { exercises: [], totalPages: 0 };
        }

        console.log("Fetched exercises successfully:", data);
        return { 
          exercises: data, 
          totalPages: Math.ceil((count || 0) / itemsPerPage)
        };
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
              exercises={exercisesData?.exercises || []} 
              isLoading={isLoading} 
              workoutGoals={workoutGoals}
            />
            {exercisesData?.totalPages > 1 && (
              <div className="mt-4 flex justify-center">
                <Pagination
                  page={page}
                  totalPages={exercisesData.totalPages}
                  onPageChange={onPageChange || (() => {})}
                />
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ExerciseManager;