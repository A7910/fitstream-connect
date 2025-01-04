import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { User } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

interface UserSelectorProps {
  selectedUser: string | null;
  onUserSelect: (userId: string) => void;
}

const USERS_PER_PAGE = 8;

const UserSelector = ({ selectedUser, onUserSelect }: UserSelectorProps) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  
  const { data: users = [], isLoading } = useQuery({
    queryKey: ["active-users"],
    queryFn: async () => {
      const { data: memberships, error } = await supabase
        .from("user_memberships")
        .select(`
          user_id,
          profiles (
            id,
            full_name,
            avatar_url
          )
        `)
        .eq("status", "active");

      if (error) throw error;
      return memberships;
    },
  });

  if (isLoading) {
    return <div className="text-sm text-muted-foreground">Loading users...</div>;
  }

  // Filter users based on search query
  const filteredUsers = users.filter((membership) => 
    membership.profiles?.full_name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Calculate pagination
  const totalPages = Math.ceil(filteredUsers.length / USERS_PER_PAGE);
  const startIndex = (currentPage - 1) * USERS_PER_PAGE;
  const endIndex = startIndex + USERS_PER_PAGE;
  const currentUsers = filteredUsers.slice(startIndex, endIndex);

  // Reset to first page when search query changes
  const handleSearch = (value: string) => {
    setSearchQuery(value);
    setCurrentPage(1);
  };

  // Generate page numbers
  const pageNumbers = [];
  for (let i = 1; i <= totalPages; i++) {
    pageNumbers.push(i);
  }

  return (
    <div className="space-y-4">
      <Label>Select User</Label>
      <Input
        type="search"
        placeholder="Search users..."
        value={searchQuery}
        onChange={(e) => handleSearch(e.target.value)}
        className="mb-4"
      />
      <ScrollArea className="h-[400px] rounded-md border">
        <div className="p-4 space-y-2">
          {currentUsers.map((membership) => (
            <div
              key={membership.user_id}
              className={`flex items-center space-x-3 p-2 rounded-lg cursor-pointer hover:bg-muted/50 transition-colors ${
                selectedUser === membership.user_id ? "bg-muted" : ""
              }`}
              onClick={() => onUserSelect(membership.user_id)}
            >
              <Avatar>
                <AvatarImage src={membership.profiles?.avatar_url || undefined} />
                <AvatarFallback>
                  <User className="h-4 w-4" />
                </AvatarFallback>
              </Avatar>
              <span className="text-sm font-medium">
                {membership.profiles?.full_name || "Unnamed User"}
              </span>
            </div>
          ))}
          {filteredUsers.length === 0 && (
            <div className="text-sm text-muted-foreground text-center py-4">
              {searchQuery ? "No users found matching your search" : "No active users found"}
            </div>
          )}
        </div>
      </ScrollArea>
      
      {totalPages > 1 && (
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious 
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
              />
            </PaginationItem>
            
            {pageNumbers.map((page) => (
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
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}
    </div>
  );
};

export default UserSelector;