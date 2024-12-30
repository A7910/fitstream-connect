import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

const AttendanceManagement = () => {
  const [userId, setUserId] = useState("");
  const { toast } = useToast();

  const handleCheckIn = async () => {
    try {
      const { data, error } = await supabase
        .from("attendance")
        .insert([{ user_id: userId }]);

      if (error) throw error;

      toast({
        title: "Check-in recorded",
        description: "Attendance has been successfully recorded",
      });
      setUserId("");
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
      setUserId("");
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
      <CardContent className="space-y-4">
        <div className="flex space-x-4">
          <Input
            placeholder="Enter User ID"
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
          />
          <Button onClick={handleCheckIn}>Check In</Button>
          <Button variant="outline" onClick={handleCheckOut}>
            Check Out
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default AttendanceManagement;