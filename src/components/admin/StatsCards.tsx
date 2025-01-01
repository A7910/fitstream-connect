import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown, Users, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { useState } from "react";
import { DateRange } from "@/hooks/useAnalyticsData";
import { MembershipStats } from "./stats/MembershipStats";

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

  // Filter out inactive memberships
  const activeUsers = users.filter(user => {
    const userMemberships = memberships.filter(m => m.user_id === user.id);
    return userMemberships.some(m => m.status === 'active');
  });

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
          <MembershipStats users={activeUsers} memberships={activeMemberships} />
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
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            New Memberships
            <Select value={dateRange} onValueChange={(value: DateRange) => onDateRangeChange(value)}>
              <SelectTrigger className="w-[120px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="week">Last Week</SelectItem>
                <SelectItem value="month">Last Month</SelectItem>
                <SelectItem value="year">Last Year</SelectItem>
                <SelectItem value="custom">Custom</SelectItem>
              </SelectContent>
            </Select>
            {dateRange === "custom" && (
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "h-8 w-8 p-0 hover:bg-muted",
                      date && "text-primary"
                    )}
                  >
                    <span className="sr-only">Open date picker</span>
                    📅
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="end">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={handleSelect}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            )}
          </CardTitle>
          <div className="flex items-center gap-2">
            <RefreshButton />
            {membershipsChange >= 0 ? (
              <TrendingUp className="h-4 w-4 text-green-500" />
            ) : (
              <TrendingDown className="h-4 w-4 text-red-500" />
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{latestNewMemberships}</div>
          <p className="text-xs text-muted-foreground">
            {membershipsChange > 0 ? "+" : ""}
            {formatPercentage(membershipsChange)}% from {formatDateRange()}
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default StatsCards;