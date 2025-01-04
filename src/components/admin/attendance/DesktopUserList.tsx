import { MemberListItem } from "./MemberListItem";
import { type ActiveUser } from "./types";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

interface DesktopUserListProps {
  users: ActiveUser[];
  selectedUserId: string | null;
  setSelectedUserId: (id: string | null) => void;
  handleCheckIn: (userId: string) => void;
  handleCheckOut: (userId: string) => void;
  totalPages: number;
  currentPage: number;
  setCurrentPage: (page: number) => void;
  filteredUsers: ActiveUser[];
}

export const DesktopUserList = ({
  users,
  selectedUserId,
  setSelectedUserId,
  handleCheckIn,
  handleCheckOut,
  totalPages,
  currentPage,
  setCurrentPage,
  filteredUsers,
}: DesktopUserListProps) => {
  return (
    <>
      <div className="grid gap-4">
        {users.map((user) => (
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

      {filteredUsers.length === 0 && (
        <p className="text-center text-muted-foreground py-8">
          No active members available for check-in
        </p>
      )}

      {totalPages > 1 && (
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious 
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
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
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}
    </>
  );
};