import React from "react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { MemberListItem } from "./MemberListItem";
import { type ActiveUser } from "./types";
import { cn } from "@/lib/utils";

interface MobileCarouselViewProps {
  users: ActiveUser[];
  selectedUserId: string | null;
  setSelectedUserId: (id: string | null) => void;
  handleCheckIn: (userId: string) => void;
  handleCheckOut: (userId: string) => void;
}

export const MobileCarouselView = ({
  users,
  selectedUserId,
  setSelectedUserId,
  handleCheckIn,
  handleCheckOut,
}: MobileCarouselViewProps) => {
  return (
    <Carousel className="w-full">
      <CarouselContent className="-ml-1">
        {users.map((user, index) => (
          <CarouselItem key={user.user_id} className="pl-1 relative">
            <div className={cn(
              "transition-all duration-300 transform",
              selectedUserId === user.user_id 
                ? "scale-100 z-10" 
                : "scale-95 opacity-50"
            )}>
              <MemberListItem
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
      <CarouselPrevious className="hidden sm:flex" />
      <CarouselNext className="hidden sm:flex" />
    </Carousel>
  );
};