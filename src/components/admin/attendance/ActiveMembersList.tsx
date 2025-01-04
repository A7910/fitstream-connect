import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Search } from "lucide-react";
import { MemberListItem } from "./MemberListItem";
import { useAttendanceActions } from "./useAttendanceActions";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { useIsMobile } from "@/hooks/use-mobile";

interface Profile {
  full_name: string | null;
  phone_number: string | null;
  avatar_url: string | null;
}

interface ActiveUser {
  user_id: string;
  profiles?: Profile;
  start_date: string;
  end_date: string;
  isCheckedIn?: boolean;
}

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

  const renderUserList = () => {
    if (isMobile) {
      return (
        <Carousel className="w-full">
          <CarouselContent>
            {filteredUsers.map((user) => (
              <CarouselItem key={user.user_id}>
                <div className="p-1">
                  <MemberListItem
                    key={user.user_id}
                    userId={user.user_id}
                    fullName={user.profiles?.full_name}
                    phoneNumber={user.profiles?.phone_number}
                    avatarUrl={user.profiles?.avatar_url}
                    startDate={user.start_date}
                    endDate={user.end_date}
                    isSelected={selectedUserId === user.user_id}
                    isCheckedIn={false}
                    onSelect={setSelectedUserId}
                    onCheckIn={() => handleCheckIn(user.user_id)}
                    onCheckOut={() => handleCheckOut(user.user_id)}
                  />
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious />
          <CarouselNext />
        </Carousel>
      );
    }

    return (
      <div className="grid gap-4">
        {paginatedUsers.map((user) => (
          <MemberListItem
            key={user.user_id}
            userId={user.user_id}
            fullName={user.profiles?.full_name}
            phoneNumber={user.profiles?.phone_number}
            avatarUrl={user.profiles?.avatar_url}
            startDate={user.start_date}
            endDate={user.end_date}
            isSelected={selectedUserId === user.user_id}
            isCheckedIn={false}
            onSelect={setSelectedUserId}
            onCheckIn={() => handleCheckIn(user.user_id)}
            onCheckOut={() => handleCheckOut(user.user_id)}
          />
        ))}
      </div>
    );
  };

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

      {renderUserList()}

      {!isMobile && filteredUsers.length === 0 && (
        <p className="text-center text-muted-foreground py-8">
          No active members available for check-in
        </p>
      )}

      {!isMobile && totalPages > 1 && (
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious 
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
              />
            </PaginationItem>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <PaginationItem key={page}>
                <PaginationLink
                  onClick={() => setCurrentPage(page)}
                  isActive={currentPage === page}
                  className="cursor-pointer"
                >
                  {page}
                </PaginationLink>
              </PaginationItem>
            ))}
            <PaginationItem>
              <PaginationNext
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}
    </div>
  );
};