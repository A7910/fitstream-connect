import { useState } from "react";
import { MembershipStatus, getMembershipStatus } from "./MembershipStatus";
import { MembershipActions } from "./MembershipActions";
import { Input } from "@/components/ui/input";
import { Search, Filter } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { User } from "lucide-react";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

interface UserListProps {
  users: any[];
  membershipPlans: any[];
  statusFilter: 'all' | 'active' | 'inactive' | 'expired';
  onStatusFilterChange: (status: 'all' | 'active' | 'inactive' | 'expired') => void;
  onMembershipAction: (
    userId: string,
    planId: string | null,
    action: 'activate' | 'deactivate',
    startDate?: Date,
    endDate?: Date
  ) => void;
}

const USERS_PER_PAGE = 8;

const UserList = ({ users, membershipPlans, onMembershipAction, statusFilter, onStatusFilterChange }: UserListProps) => {
  const [selectedDates, setSelectedDates] = useState<{ [key: string]: { start: Date | undefined; end: Date | undefined } }>({});
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const getMembershipPlanName = (planId: string | null) => {
    if (!planId) return 'No Plan';
    const plan = membershipPlans.find(p => p.id === planId);
    return plan ? plan.name : 'Unknown Plan';
  };

  const filteredUsers = users.filter(user => {
    const nameMatch = user.full_name?.toLowerCase().includes(searchQuery.toLowerCase());
    if (!nameMatch) return false;
    
    if (statusFilter === 'all') return true;
    
    const userStatus = getMembershipStatus(user.membership);
    return userStatus === statusFilter;
  });

  const totalPages = Math.ceil(filteredUsers.length / USERS_PER_PAGE);
  const startIndex = (currentPage - 1) * USERS_PER_PAGE;
  const paginatedUsers = filteredUsers.slice(startIndex, startIndex + USERS_PER_PAGE);

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1">
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
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="icon">
              <Filter className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem 
              onClick={() => onStatusFilterChange('all')}
              className={statusFilter === 'all' ? "bg-muted" : ""}
            >
              All Users
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={() => onStatusFilterChange('active')}
              className={statusFilter === 'active' ? "bg-muted" : ""}
            >
              Active Members
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={() => onStatusFilterChange('inactive')}
              className={statusFilter === 'inactive' ? "bg-muted" : ""}
            >
              Inactive Members
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={() => onStatusFilterChange('expired')}
              className={statusFilter === 'expired' ? "bg-muted" : ""}
            >
              Expired Members
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {paginatedUsers.map((user) => (
        <div
          key={user.id}
          className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors space-y-4 sm:space-y-0"
        >
          <div className="flex items-center space-x-4">
            <Avatar>
              <AvatarImage src={user.avatar_url || undefined} />
              <AvatarFallback>
                <User className="h-4 w-4" />
              </AvatarFallback>
            </Avatar>
            <div className="space-y-1">
              <p className="font-medium">{user.full_name}</p>
              <div className="flex flex-wrap items-center gap-2">
                <MembershipStatus membership={user.membership} />
                <span className="text-sm text-muted-foreground">
                  ({getMembershipPlanName(user.membership?.plan_id)})
                </span>
              </div>
              <div className="text-sm text-muted-foreground">
                {user.phone_number}
              </div>
            </div>
          </div>
          <MembershipActions
            userId={user.id}
            membership={user.membership}
            membershipPlans={membershipPlans}
            selectedDates={selectedDates[user.id] || { start: undefined, end: undefined }}
            onDateChange={(start, end) =>
              setSelectedDates(prev => ({
                ...prev,
                [user.id]: { start, end }
              }))
            }
            onMembershipAction={onMembershipAction}
          />
        </div>
      ))}

      {filteredUsers.length === 0 && (
        <p className="text-center text-muted-foreground py-8">
          No users found
        </p>
      )}

      {totalPages > 1 && (
        <Pagination className="mt-4">
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

export default UserList;