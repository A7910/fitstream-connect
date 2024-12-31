import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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

interface ActiveUser {
  user_id: string;
  profiles?: Profile;
  start_date: string;
  end_date: string;
}

interface AttendanceRecord {
  id: string;
  user_id: string;
  check_in: string;
  check_out: string | null;
  profiles?: {
    full_name: string | null;
    phone_number: string | null;
  };
}

const AttendanceManagement = () => {
  const [selectedUserId, setSelectedUserId] = useState("");
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const { toast } = useToast();

  // Query for active users with membership details
  const { data: activeUsers = [], isLoading: isLoadingUsers } = useQuery<ActiveUser[]>({
    queryKey: ["active-users"],
    queryFn: async () => {
      const { data: memberships, error: membershipError } = await supabase
        .from("user_memberships")
        .select(`
          user_id,
          start_date,
          end_date,
          profiles (
            full_name,
            phone_number
          )
        `)
        .eq("status", "active")
        .gte("end_date", new Date().toISOString().split('T')[0]);

      if (membershipError) throw membershipError;
      
      // Sort users alphabetically by full name
      return memberships.sort((a, b) => {
        const nameA = a.profiles?.full_name || '';
        const nameB = b.profiles?.full_name || '';
        return nameA.localeCompare(nameB);
      });
    },
  });

  // Query for attendance records by date
  const { data: attendanceRecords = [], isLoading: isLoadingAttendance } = useQuery<AttendanceRecord[]>({
    queryKey: ["attendance-records", selectedDate],
    queryFn: async () => {
      const startOfDay = new Date(selectedDate);
      startOfDay.setHours(0, 0, 0, 0);
      
      const endOfDay = new Date(selectedDate);
      endOfDay.setHours(23, 59, 59, 999);

      const { data, error } = await supabase
        .from("attendance")
        .select(`
          *,
          profiles (
            full_name,
            phone_number
          )
        `)
        .gte("check_in", startOfDay.toISOString())
        .lte("check_in", endOfDay.toISOString())
        .order("check_in", { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  const handleCheckIn = async () => {
    if (!selectedUserId) {
      toast({
        title: "No user selected",
        description: "Please select a user to check in",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase
        .from("attendance")
        .insert([{ user_id: selectedUserId }]);

      if (error) throw error;

      toast({
        title: "Check-in recorded",
        description: "Attendance has been successfully recorded",
      });
      setSelectedUserId("");
    } catch (error) {
      console.error("Check-in error:", error);
      toast({
        title: "Check-in failed",
        description: "There was an error recording the attendance",
        variant: "destructive",
      });
    }
  };

  const handleCheckOut = async () => {
    if (!selectedUserId) {
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
        .eq("user_id", selectedUserId)
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
    } catch (error) {
      console.error("Check-out error:", error);
      toast({
        title: "Check-out failed",
        description: "There was an error recording the check-out",
        variant: "destructive",
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Attendance Management</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="active-members" className="space-y-4">
          <TabsList>
            <TabsTrigger value="active-members">Active Members</TabsTrigger>
            <TabsTrigger value="attendance-record">Attendance Record</TabsTrigger>
          </TabsList>

          <TabsContent value="active-members">
            {isLoadingUsers ? (
              <div className="flex items-center justify-center p-8">
                <Loader2 className="h-8 w-8 animate-spin" />
              </div>
            ) : (
              <div className="grid gap-4">
                {activeUsers.map((user) => (
                  <div
                    key={user.user_id}
                    className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                      selectedUserId === user.user_id
                        ? "border-primary bg-primary/5"
                        : "hover:bg-accent"
                    }`}
                    onClick={() => setSelectedUserId(user.user_id)}
                  >
                    <div className="flex justify-between items-center">
                      <div className="space-y-1">
                        <p className="font-medium">{user.profiles?.full_name || "N/A"}</p>
                        <p className="text-sm text-muted-foreground">
                          {user.profiles?.phone_number || "No phone number"}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Membership: {format(new Date(user.start_date), 'PP')} - {format(new Date(user.end_date), 'PP')}
                        </p>
                      </div>
                      {selectedUserId === user.user_id && (
                        <div className="flex gap-2">
                          <Button size="sm" onClick={handleCheckIn}>
                            Check In
                          </Button>
                          <Button size="sm" variant="outline" onClick={handleCheckOut}>
                            Check Out
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="attendance-record">
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
                        <p className="font-medium">{record.profiles?.full_name || "N/A"}</p>
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
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default AttendanceManagement;