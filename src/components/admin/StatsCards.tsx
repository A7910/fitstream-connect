import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown, Users, RefreshCw, ChevronLeft, ChevronRight, UserCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { DateRange } from "@/hooks/useAnalyticsData";
import { MembershipStats } from "./stats/MembershipStats";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { MembershipPlanStats } from "./stats/MembershipPlanStats";
import { NewMembershipsStats } from "./stats/NewMembershipsStats";
import { useSwipeable } from "react-swipeable";
import { formatPercentage } from "@/lib/utils";
import { format, startOfDay, endOfDay } from "date-fns";

interface StatsCardsProps {
  users: any[];
  memberships: any[];
  latestVisits: number;
  visitsChange: number;
  latestNewMemberships: number;
  membershipsChange: number;
  onDateRangeChange: (range: DateRange) => void;
  dateRange: DateRange;
  rangeStart: Date;
  rangeEnd: Date;
  onRefresh: () => void;
}

const StatsCards = ({
  users,
  memberships,
  latestVisits,
  visitsChange,
  latestNewMemberships,
  membershipsChange,
  onDateRangeChange,
  dateRange,
  rangeStart,
  rangeEnd,
  onRefresh,
}: StatsCardsProps) => {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [currentPage, setCurrentPage] = useState<'stats' | 'plans'>('plans');
  const [defaultFirstPage, setDefaultFirstPage] = useState<'stats' | 'plans'>('plans');
  const [selectedDate, setSelectedDate] = useState(new Date());

  const { data: membershipPlans = [] } = useQuery({
    queryKey: ["membership-plans"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("membership_plans")
        .select("*")
        .order("price");
      
      if (error) throw error;
      return data;
    },
  });

  const { data: attendanceCount = 0, isLoading: isLoadingAttendance } = useQuery({
    queryKey: ["daily-attendance", selectedDate],
    queryFn: async () => {
      const start = startOfDay(selectedDate);
      const end = endOfDay(selectedDate);

      const { count, error } = await supabase
        .from("attendance")
        .select("*", { count: 'exact', head: true })
        .gte("check_in", start.toISOString())
        .lte("check_in", end.toISOString());

      if (error) throw error;
      return count || 0;
    },
  });

  const { data: previousDayAttendance = 0 } = useQuery({
    queryKey: ["previous-day-attendance", selectedDate],
    queryFn: async () => {
      const previousDay = new Date(selectedDate);
      previousDay.setDate(previousDay.getDate() - 1);
      const start = startOfDay(previousDay);
      const end = endOfDay(previousDay);

      const { count, error } = await supabase
        .from("attendance")
        .select("*", { count: 'exact', head: true })
        .gte("check_in", start.toISOString())
        .lte("check_in", end.toISOString());

      if (error) throw error;
      return count || 0;
    },
  });

  const activeMemberships = memberships.filter(m => m.status === 'active');

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await onRefresh();
    } finally {
      setIsRefreshing(false);
    }
  };

  const toggleDefaultPage = () => {
    const newDefault = defaultFirstPage === 'plans' ? 'stats' : 'plans';
    setDefaultFirstPage(newDefault);
    setCurrentPage(newDefault);
  };

  const togglePage = (direction: 'next' | 'prev') => {
    setCurrentPage(currentPage === 'plans' ? 'stats' : 'plans');
  };

  const handlers = useSwipeable({
    onSwipedLeft: () => togglePage('next'),
    onSwipedRight: () => togglePage('prev'),
    trackMouse: true
  });

  const handleDateChange = (direction: 'prev' | 'next') => {
    const newDate = new Date(selectedDate);
    if (direction === 'prev') {
      newDate.setDate(newDate.getDate() - 1);
    } else {
      newDate.setDate(newDate.getDate() + 1);
    }
    setSelectedDate(newDate);
  };

  const RefreshButton = () => (
    <Button
      variant="ghost"
      size="icon"
      onClick={handleRefresh}
      className={cn(
        "h-8 w-8 p-0 hover:bg-muted",
        isRefreshing && "animate-spin"
      )}
    >
      <RefreshCw className="h-4 w-4" />
      <span className="sr-only">Refresh statistics</span>
    </Button>
  );

  const formatDateRange = () => {
    return `last ${dateRange}`;
  };

  const renderMembershipPlansCard = () => (
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
              onToggleDefault={toggleDefaultPage}
            />
          ) : (
            <NewMembershipsStats
              latestNewMemberships={latestNewMemberships}
              membershipsChange={membershipsChange}
              dateRange={formatDateRange()}
            />
          )}
        </div>
        <div className="flex justify-center gap-4 mt-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => togglePage('prev')}
            className="h-8 w-8 p-0"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => togglePage('next')}
            className="h-8 w-8 p-0"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  const attendanceChange = previousDayAttendance > 0 
    ? ((attendanceCount - previousDayAttendance) / previousDayAttendance) * 100
    : 0;

  return (
    <div className="grid gap-4 md:grid-cols-3 mb-8">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Daily Attendance</CardTitle>
          <div className="flex items-center gap-2">
            <RefreshButton />
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col space-y-2">
            <div className="text-2xl font-bold">
              {isLoadingAttendance ? "Loading..." : attendanceCount}
            </div>
            <div className="flex items-center justify-between">
              <p className="text-xs text-muted-foreground">
                {attendanceChange > 0 ? "+" : ""}
                {formatPercentage(attendanceChange)}% from yesterday
              </p>
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleDateChange('prev')}
                  className="h-6 w-6 p-0"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="text-sm">{format(selectedDate, 'MMM dd')}</span>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleDateChange('next')}
                  className="h-6 w-6 p-0"
                  disabled={format(selectedDate, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd')}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Membership Status</CardTitle>
          <div className="flex items-center gap-2">
            <RefreshButton />
            <Users className="h-4 w-4 text-muted-foreground" />
          </div>
        </CardHeader>
        <CardContent>
          <MembershipStats users={users} memberships={activeMemberships} />
        </CardContent>
      </Card>

      {renderMembershipPlansCard()}
    </div>
  );
};

export default StatsCards;
