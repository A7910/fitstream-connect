import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown, Users, RefreshCw, ArrowUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { useState } from "react";
import { DateRange } from "@/hooks/useAnalyticsData";
import { MembershipStats } from "./stats/MembershipStats";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface StatsCardsProps {
  users: any[];
  memberships: any[];
  latestVisits: number;
  visitsChange: number;
  latestNewMemberships: number;
  membershipsChange: number;
  onDateRangeChange: (range: DateRange) => void;
  onCustomDateChange?: (date: Date) => void;
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
  onCustomDateChange,
  dateRange,
  rangeStart,
  rangeEnd,
  onRefresh,
}: StatsCardsProps) => {
  const [date, setDate] = useState<Date>();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [currentPage, setCurrentPage] = useState<'stats' | 'plans'>('plans');
  const [defaultFirstPage, setDefaultFirstPage] = useState<'stats' | 'plans'>('plans');

  // Query to fetch membership plans with subscriber counts
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

  // Filter out inactive memberships
  const activeMemberships = memberships.filter(m => m.status === 'active');

  const handleSelect = (selectedDate: Date | undefined) => {
    if (selectedDate) {
      setDate(selectedDate);
      onCustomDateChange?.(selectedDate);
    }
  };

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

  const formatPercentage = (value: number) => {
    if (isNaN(value) || !isFinite(value)) return "0.0";
    return value.toFixed(1);
  };

  const formatDateRange = () => {
    if (dateRange === "custom" && date) {
      return format(date, "MMM dd, yyyy");
    }
    return `last ${dateRange}`;
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

  const renderMembershipPlansCard = () => (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Membership Plans</CardTitle>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setCurrentPage(currentPage === 'plans' ? 'stats' : 'plans')}
          >
            {currentPage === 'plans' ? 'View New Memberships' : 'View Plan Stats'}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleDefaultPage}
            title="Change default first page"
          >
            <ArrowUpDown className="h-4 w-4" />
          </Button>
          <Users className="h-4 w-4 text-muted-foreground" />
        </div>
      </CardHeader>
      <CardContent>
        {currentPage === 'plans' ? (
          <div className="space-y-4">
            {membershipPlans.map((plan) => (
              <div key={plan.id} className="flex justify-between items-center">
                <span className="font-medium">{plan.name}</span>
                <span className="text-muted-foreground">
                  {plan.subscribers_count} subscribers
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div>
            <div className="text-2xl font-bold">{latestNewMemberships}</div>
            <p className="text-xs text-muted-foreground">
              {membershipsChange > 0 ? "+" : ""}
              {formatPercentage(membershipsChange)}% from {formatDateRange()}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="grid gap-4 md:grid-cols-3 mb-8">
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
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Daily Visits</CardTitle>
          <div className="flex items-center gap-2">
            <RefreshButton />
            {visitsChange >= 0 ? (
              <TrendingUp className="h-4 w-4 text-green-500" />
            ) : (
              <TrendingDown className="h-4 w-4 text-red-500" />
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{latestVisits}</div>
          <p className="text-xs text-muted-foreground">
            {visitsChange > 0 ? "+" : ""}
            {formatPercentage(visitsChange)}% from yesterday
          </p>
        </CardContent>
      </Card>
      {renderMembershipPlansCard()}
    </div>
  );
};

export default StatsCards;