import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";
import { MemberListItem } from "./MemberListItem";
import { useAttendanceActions } from "./useAttendanceActions";

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
  const { selectedUserId, setSelectedUserId, handleCheckIn, handleCheckOut } = useAttendanceActions();

  const { data: activeUsers = [], isLoading: isLoadingUsers } = useQuery<ActiveUser[]>({
    queryKey: ["active-users"],
    queryFn: async () => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
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
        .gte("end_date", today.toISOString().split('T')[0]);

      if (membershipError) throw membershipError;
      
      // Check which users are already checked in today
      const { data: todayAttendance } = await supabase
        .from("attendance")
        .select("user_id")
        .gte("check_in", today.toISOString())
        .is("check_out", null);

      const checkedInUserIds = new Set((todayAttendance || []).map(a => a.user_id));

      return memberships
        .filter(m => !checkedInUserIds.has(m.user_id))
        .sort((a, b) => {
          const nameA = a.profiles?.full_name || '';
          const nameB = b.profiles?.full_name || '';
          return nameA.localeCompare(nameB);
        });
    },
    refetchInterval: 60000, // Refetch every minute to handle day changes
  });

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
        <MemberListItem
          key={user.user_id}
          userId={user.user_id}
          fullName={user.profiles?.full_name}
          phoneNumber={user.profiles?.phone_number}
          startDate={user.start_date}
          endDate={user.end_date}
          isSelected={selectedUserId === user.user_id}
          isCheckedIn={false}
          onSelect={setSelectedUserId}
          onCheckIn={() => handleCheckIn(user.user_id)}
          onCheckOut={() => handleCheckOut(user.user_id)}
        />
      ))}
      {activeUsers.length === 0 && (
        <p className="text-center text-muted-foreground py-8">
          No active members available for check-in
        </p>
      )}
    </div>
  );
};