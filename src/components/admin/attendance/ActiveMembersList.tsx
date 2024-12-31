import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";
import { format } from "date-fns";

interface Profile {
  full_name: string | null;
  phone_number: string | null;
}

interface ActiveUser {
  user_id: string;
  profiles?: Profile;
  start_date: string;
  end_date: string;
  isCheckedIn?: boolean;
}

export const ActiveMembersList = () => {
  const [selectedUserId, setSelectedUserId] = useState("");
  const [checkedInUsers, setCheckedInUsers] = useState<Set<string>>(new Set());
  const { toast } = useToast();
  const queryClient = useQueryClient();

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
      
      // Check which users are already checked in today
      const startOfDay = new Date();
      startOfDay.setHours(0, 0, 0, 0);
      
      const { data: todayAttendance } = await supabase
        .from("attendance")
        .select("user_id")
        .gte("check_in", startOfDay.toISOString())
        .is("check_out", null);

      const checkedInUserIds = new Set((todayAttendance || []).map(a => a.user_id));
      setCheckedInUsers(checkedInUserIds);

      return memberships
        .filter(m => !checkedInUserIds.has(m.user_id))
        .sort((a, b) => {
          const nameA = a.profiles?.full_name || '';
          const nameB = b.profiles?.full_name || '';
          return nameA.localeCompare(nameB);
        });
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

      // Update local state to trigger animation
      setCheckedInUsers(prev => new Set([...prev, selectedUserId]));

      toast({
        title: "Check-in recorded",
        description: "Attendance has been successfully recorded",
      });
      
      // Reset selection and refresh data
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

  if (isLoadingUsers) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="grid gap-4">
      {activeUsers.map((user) => (
        <div
          key={user.user_id}
          className={`p-4 border rounded-lg cursor-pointer transition-all duration-300 transform ${
            checkedInUsers.has(user.user_id)
              ? "translate-x-full opacity-0"
              : selectedUserId === user.user_id
              ? "border-primary bg-primary/5"
              : "hover:bg-accent"
          }`}
          onClick={() => !checkedInUsers.has(user.user_id) && setSelectedUserId(user.user_id)}
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
            {selectedUserId === user.user_id && !checkedInUsers.has(user.user_id) && (
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
      {activeUsers.length === 0 && (
        <p className="text-center text-muted-foreground py-8">
          No active members available for check-in
        </p>
      )}
    </div>
  );
};