import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

export const useAttendanceActions = () => {
  const [selectedUserId, setSelectedUserId] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const handleCheckIn = async (userId: string) => {
    if (!userId) {
      toast({
        title: "No user selected",
        description: "Please select a user to check in",
        variant: "destructive",
      });
      return;
    }

    try {
      // Check if user is already checked in today
      const startOfDay = new Date();
      startOfDay.setHours(0, 0, 0, 0);
      
      const { data: existingAttendance } = await supabase
        .from("attendance")
        .select()
        .eq("user_id", userId)
        .gte("check_in", startOfDay.toISOString())
        .maybeSingle();

      if (existingAttendance) {
        toast({
          title: "Already checked in",
          description: "This user has already been checked in today",
          variant: "destructive",
        });
        return;
      }

      const { error } = await supabase
        .from("attendance")
        .insert([{ user_id: userId }]);

      if (error) throw error;

      toast({
        title: "Check-in recorded",
        description: "Attendance has been successfully recorded",
      });
      
      setSelectedUserId("");
      queryClient.invalidateQueries({ queryKey: ["active-users"] });
      queryClient.invalidateQueries({ queryKey: ["attendance-records"] });
    } catch (error) {
      console.error("Check-in error:", error);
      toast({
        title: "Check-in failed",
        description: "There was an error recording the attendance",
        variant: "destructive",
      });
    }
  };

  const handleCheckOut = async (userId: string) => {
    if (!userId) {
      toast({
        title: "No user selected",
        description: "Please select a user to check out",
        variant: "destructive",
      });
      return;
    }

    try {
      const { data: existingAttendance, error: fetchError } = await supabase
        .from("attendance")
        .select()
        .eq("user_id", userId)
        .is("check_out", null)
        .order("check_in", { ascending: false })
        .limit(1)
        .single();

      if (fetchError) throw fetchError;

      if (!existingAttendance) {
        toast({
          title: "No active check-in",
          description: "This user needs to check in first",
          variant: "destructive",
        });
        return;
      }

      const { error: updateError } = await supabase
        .from("attendance")
        .update({ check_out: new Date().toISOString() })
        .eq("id", existingAttendance.id);

      if (updateError) throw updateError;

      toast({
        title: "Check-out recorded",
        description: "Check-out has been successfully recorded",
      });
      setSelectedUserId("");
      queryClient.invalidateQueries({ queryKey: ["attendance-records"] });
    } catch (error) {
      console.error("Check-out error:", error);
      toast({
        title: "Check-out failed",
        description: "There was an error recording the check-out",
        variant: "destructive",
      });
    }
  };

  return {
    selectedUserId,
    setSelectedUserId,
    handleCheckIn,
    handleCheckOut,
  };
};