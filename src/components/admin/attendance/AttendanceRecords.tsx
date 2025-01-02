import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { Loader2, CalendarIcon, Trash2, Search, User } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { useToast } from "@/components/ui/use-toast";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

interface Profile {
  full_name: string | null;
  phone_number: string | null;
}

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

export const AttendanceRecords = () => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [searchQuery, setSearchQuery] = useState("");
  const { toast } = useToast();

  const { data: attendanceRecords = [], isLoading: isLoadingAttendance, refetch } = useQuery<AttendanceRecord[]>({
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

  const filteredRecords = attendanceRecords.filter(record => 
    record.user?.full_name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
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

        <div className="flex-1 relative">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8"
          />
        </div>

        <Button
          variant="outline"
          size="icon"
          className="text-destructive hover:bg-destructive/10"
          onClick={handleClearAttendance}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>

      {isLoadingAttendance ? (
        <div className="flex items-center justify-center p-8">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      ) : (
        <div className="grid gap-4">
          {filteredRecords.map((record) => (
            <div key={record.id} className="p-4 border rounded-lg animate-fade-in">
              <div className="flex items-center space-x-4">
                <Avatar>
                  <AvatarImage src={record.user?.avatar_url || undefined} />
                  <AvatarFallback>
                    <User className="h-4 w-4" />
                  </AvatarFallback>
                </Avatar>
                <div className="space-y-1">
                  <p className="font-medium">{record.user?.full_name || "N/A"}</p>
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
            </div>
          ))}
          {filteredRecords.length === 0 && (
            <p className="text-center text-muted-foreground py-8">
              No attendance records found
            </p>
          )}
        </div>
      )}
    </div>
  );
};