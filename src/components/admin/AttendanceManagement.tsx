import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface Profile {
  full_name: string | null;
  phone_number: string | null;
}

interface ActiveUser {
  user_id: string;
  profiles?: Profile;
}

const AttendanceManagement = () => {
  const [selectedUserId, setSelectedUserId] = useState("");
  const { toast } = useToast();

  const { data: activeUsers = [] } = useQuery<ActiveUser[]>({
    queryKey: ["active-users"],
    queryFn: async () => {
      const { data: memberships, error: membershipError } = await supabase
        .from("user_memberships")
        .select(`
          user_id,
          profiles (
            full_name,
            phone_number
          )
        `)
        .eq("status", "active")
        .gte("end_date", new Date().toISOString().split('T')[0]);

      if (membershipError) throw membershipError;
      return memberships;
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
      <CardContent className="space-y-6">
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
                <div>
                  <p className="font-medium">{user.profiles?.full_name || "N/A"}</p>
                  <p className="text-sm text-muted-foreground">
                    {user.profiles?.phone_number || "No phone number"}
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
      </CardContent>
    </Card>
  );
};

export default AttendanceManagement;