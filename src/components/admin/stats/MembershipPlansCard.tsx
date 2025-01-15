import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, ChevronLeft, ChevronRight } from "lucide-react";
import { RefreshButton } from "./RefreshButton";
import { MembershipPlanStats } from "./MembershipPlanStats";
import { NewMembershipsStats } from "./NewMembershipsStats";
import { useSwipeable } from "react-swipeable";

interface MembershipPlansCardProps {
  membershipPlans: any[];
  latestNewMemberships: number;
  membershipsChange: number;
  dateRange: string;
  onToggleDefault: () => void;
}

export const MembershipPlansCard = ({
  membershipPlans,
  latestNewMemberships,
  membershipsChange,
  dateRange,
  onToggleDefault,
}: MembershipPlansCardProps) => {
  const [currentPage, setCurrentPage] = useState<'plans' | 'stats'>('plans');

  const togglePage = () => {
    setCurrentPage(currentPage === 'plans' ? 'stats' : 'plans');
  };

  const handlers = useSwipeable({
    onSwipedLeft: () => togglePage(),
    onSwipedRight: () => togglePage(),
    trackMouse: true
  });

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Membership Plans</CardTitle>
        <div className="flex items-center gap-2">
          <RefreshButton />
          <Users className="h-4 w-4 text-muted-foreground" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="min-h-[200px]" {...handlers}>
          {currentPage === 'plans' ? (
            <MembershipPlanStats 
              membershipPlans={membershipPlans}
              onToggleDefault={onToggleDefault}
            />
          ) : (
            <NewMembershipsStats
              latestNewMemberships={latestNewMemberships}
              membershipsChange={membershipsChange}
              dateRange={dateRange}
            />
          )}
        </div>
        <div className="flex justify-center gap-4 mt-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => togglePage()}
            className="h-8 w-8 p-0"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => togglePage()}
            className="h-8 w-8 p-0"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};