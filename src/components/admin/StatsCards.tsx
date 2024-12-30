import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { useState } from "react";
import { DateRange } from "@/hooks/useAnalyticsData";

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
}: StatsCardsProps) => {
  const [date, setDate] = useState<Date>();

  const handleSelect = (selectedDate: Date | undefined) => {
    if (selectedDate) {
      setDate(selectedDate);
      onCustomDateChange?.(selectedDate);
    }
  };

  // Calculate membership statistics
  const usersWithMembership = users.map(user => {
    const userMemberships = memberships?.filter(m => m.user_id === user.id) || [];
    // Sort memberships by created_at in descending order and get the latest one
    const latestMembership = userMemberships.sort((a, b) => 
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    )[0];
    
    // Check if the membership is active and not expired
    const isActive = latestMembership?.status === "active" && 
      new Date(latestMembership.end_date) >= new Date();
    
    return {
      ...user,
      membership: {
        ...latestMembership,
        status: isActive ? "active" : "inactive"
      }
    };
  });

  const activeMembers = usersWithMembership.filter(user => 
    user.membership?.status === "active"
  ).length;

  const inactiveMembers = usersWithMembership.length - activeMembers;

  // Calculate expiring soon members (within next 3 days)
  const expiringMembers = usersWithMembership.filter(user => {
    if (!user.membership || user.membership.status !== "active") return false;
    const endDate = new Date(user.membership.end_date);
    const today = new Date();
    const threeDaysFromNow = new Date();
    threeDaysFromNow.setDate(today.getDate() + 3);
    return endDate >= today && endDate <= threeDaysFromNow;
  }).length;

  console.log("Membership statistics:", {
    total: usersWithMembership.length,
    active: activeMembers,
    inactive: inactiveMembers,
    expiring: expiringMembers
  });

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

  return (
    <div className="grid gap-4 md:grid-cols-3 mb-8">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Membership Status</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Active:</span>
              <span className="text-sm font-medium text-green-600">{activeMembers}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Inactive:</span>
              <span className="text-sm font-medium text-red-600">{inactiveMembers}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Expiring Soon:</span>
              <span className="text-sm font-medium text-yellow-600">{expiringMembers}</span>
            </div>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Daily Visits</CardTitle>
          {visitsChange >= 0 ? (
            <TrendingUp className="h-4 w-4 text-green-500" />
          ) : (
            <TrendingDown className="h-4 w-4 text-red-500" />
          )}
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
          {membershipsChange >= 0 ? (
            <TrendingUp className="h-4 w-4 text-green-500" />
          ) : (
            <TrendingDown className="h-4 w-4 text-red-500" />
          )}
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