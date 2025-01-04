import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Search } from "lucide-react";
import { MemberListItem } from "./MemberListItem";
import { useAttendanceActions } from "./useAttendanceActions";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import { MobileCarouselView } from "./MobileCarouselView";
import { type ActiveUser } from "./types";
import { DesktopUserList } from "./DesktopUserList";

const USERS_PER_PAGE = 8;

export const ActiveMembersList = () => {
  const { selectedUserId, setSelectedUserId, handleCheckIn, handleCheckOut } = useAttendanceActions();
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const isMobile = useIsMobile();

  const { data: activeUsers = [], isLoading: isLoadingUsers } = useQuery({
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
            phone_number,
            avatar_url
          )
        `)
        .eq("status", "active")
        .gte("end_date", today.toISOString().split('T')[0]);

      if (membershipError) throw membershipError;
      
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
    refetchInterval: 60000,
  });

  const filteredUsers = activeUsers.filter(user =>
    user.profiles?.full_name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalPages = Math.ceil(filteredUsers.length / USERS_PER_PAGE);
  const startIndex = (currentPage - 1) * USERS_PER_PAGE;
  const paginatedUsers = filteredUsers.slice(startIndex, startIndex + USERS_PER_PAGE);

  if (isLoadingUsers) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search by name..."
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            setCurrentPage(1);
          }}
          className="pl-8"
        />
      </div>

      {isMobile ? (
        <MobileCarouselView
          users={filteredUsers}
          selectedUserId={selectedUserId}
          setSelectedUserId={setSelectedUserId}
          handleCheckIn={handleCheckIn}
          handleCheckOut={handleCheckOut}
        />
      ) : (
        <DesktopUserList
          users={paginatedUsers}
          selectedUserId={selectedUserId}
          setSelectedUserId={setSelectedUserId}
          handleCheckIn={handleCheckIn}
          handleCheckOut={handleCheckOut}
          totalPages={totalPages}
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
          filteredUsers={filteredUsers}
        />
      )}
    </div>
  );
};