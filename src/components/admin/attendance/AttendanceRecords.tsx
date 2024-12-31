import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { Loader2, CalendarIcon } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

interface Profile {
  full_name: string | null;
  phone_number: string | null;
}

interface User {
  id: string;
  profiles: Profile;
}

interface AttendanceRecord {
  id: string;
  user_id: string;
  check_in: string;
  check_out: string | null;
  user: User;
}

export const AttendanceRecords = () => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  const { data: attendanceRecords = [], isLoading: isLoadingAttendance } = useQuery<AttendanceRecord[]>({
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
            profiles (
              full_name,
              phone_number
            )
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
      return data;
    },
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "w-[240px] justify-start text-left font-normal",
                !selectedDate && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {selectedDate ? format(selectedDate, "PPP") : "Pick a date"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={(date) => setSelectedDate(date || new Date())}
              initialFocus
            />
          </PopoverContent>
        </Popover>
      </div>

      {isLoadingAttendance ? (
        <div className="flex items-center justify-center p-8">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      ) : (
        <div className="grid gap-4">
          {attendanceRecords.map((record) => (
            <div key={record.id} className="p-4 border rounded-lg">
              <div className="space-y-1">
                <p className="font-medium">{record.user?.profiles?.full_name || "N/A"}</p>
                <p className="text-sm text-muted-foreground">
                  Check-in: {format(new Date(record.check_in), 'PP p')}
                </p>
                {record.check_out && (
                  <p className="text-sm text-muted-foreground">
                    Check-out: {format(new Date(record.check_out), 'PP p')}
                  </p>
                )}
              </div>
            </div>
          ))}
          {attendanceRecords.length === 0 && (
            <p className="text-center text-muted-foreground py-8">
              No attendance records found for this date
            </p>
          )}
        </div>
      )}
    </div>
  );
};