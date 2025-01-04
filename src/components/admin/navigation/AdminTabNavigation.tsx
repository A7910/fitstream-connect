import { useState } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import { TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { 
  Users, 
  CalendarCheck, 
  Dumbbell, 
  Target, 
  ClipboardList,
  Bell,
  ChevronDown
} from "lucide-react";

interface AdminTabNavigationProps {
  activeTab: string;
  onTabChange: (value: string) => void;
}

export const tabItems = [
  { id: "users", label: "Users", icon: <Users className="h-4 w-4" /> },
  { id: "attendance", label: "Attendance", icon: <CalendarCheck className="h-4 w-4" /> },
  { id: "workout", label: "Workout Plans", icon: <Dumbbell className="h-4 w-4" /> },
  { id: "dedicated", label: "Dedicated Workout", icon: <Target className="h-4 w-4" /> },
  { id: "assigned", label: "Assigned Workouts", icon: <ClipboardList className="h-4 w-4" /> },
  { id: "announcements", label: "Announcements", icon: <Bell className="h-4 w-4" /> },
];

export const AdminTabNavigation = ({ activeTab, onTabChange }: AdminTabNavigationProps) => {
  const isMobile = useIsMobile();

  if (isMobile) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="w-full mb-4 flex items-center justify-between">
            {tabItems.find(tab => tab.id === activeTab)?.label}
            <ChevronDown className="h-4 w-4 ml-2" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-full">
          {tabItems.map((item) => (
            <DropdownMenuItem
              key={item.id}
              className="flex items-center gap-2"
              onClick={() => onTabChange(item.id)}
            >
              {item.icon}
              {item.label}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  return (
    <TabsList>
      {tabItems.map((item) => (
        <TabsTrigger key={item.id} value={item.id}>
          {item.label}
        </TabsTrigger>
      ))}
    </TabsList>
  );
};