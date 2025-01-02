import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

interface AttendanceRecord {
  id: string;
  user_id: string;
  check_in: string;
  check_out: string | null;
  user: {
    id: string;
    full_name: string | null;
    phone_number: string | null;
    avatar_url: string | null;
  };
}

export const useAttendanceRecords = (selectedDate: Date) => {
  const { toast } = useToast();

  const { data: attendanceRecords = [], isLoading, refetch } = useQuery<AttendanceRecord[]>({
    queryKey: ["attendance-records", selectedDate],
    queryFn: async () => {
      const startOfDay = new Date(selectedDate);
      startOfDay.setHours(0, 0, 0, 0);
      
      const endOfDay = new Date(selectedDate);
      endOfDay.setHours(23, 59, 59, 999);

      console.log("Fetching attendance records for date range:", { startOfDay, endOfDay });

      const { data, error } = await supabase
        .from("attendance")
        .select(`
          id,
          user_id,
          check_in,
          check_out,
          user:profiles!attendance_user_id_fkey_profiles (
            id,
            full_name,
            phone_number,
            avatar_url
          )
        `)
        .gte("check_in", startOfDay.toISOString())
        .lte("check_in", endOfDay.toISOString())
        .order("check_in", { ascending: false });

      if (error) {
        console.error("Error fetching attendance records:", error);
        throw error;
      }
      
      console.log("Fetched attendance records:", data);
      return data as AttendanceRecord[];
    },
  });

  const handleClearAttendance = async () => {
    try {
      const startOfDay = new Date(selectedDate);
      startOfDay.setHours(0, 0, 0, 0);
      
      const endOfDay = new Date(selectedDate);
      endOfDay.setHours(23, 59, 59, 999);

      const { error } = await supabase
        .from("attendance")
        .delete()
        .gte("check_in", startOfDay.toISOString())
        .lte("check_in", endOfDay.toISOString());

      if (error) throw error;

      toast({
        title: "Attendance cleared",
        description: "All attendance records for this day have been cleared",
      });

      refetch();
    } catch (error) {
      console.error("Error clearing attendance:", error);
      toast({
        title: "Error",
        description: "Failed to clear attendance records",
        variant: "destructive",
      });
    }
  };

  return {
    attendanceRecords,
    isLoading,
    handleClearAttendance,
  };
};