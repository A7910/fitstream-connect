import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown, Users } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { useState } from "react";

interface StatsCardsProps {
  activeMembers: number;
  inactiveMembers: number;
  expiringMembers: number;
  latestVisits: number;
  visitsChange: number;
  latestNewMemberships: number;
  membershipsChange: number;
  onDateChange?: (date: Date) => void;
}

const StatsCards = ({
  activeMembers,
  latestVisits,
  visitsChange,
  latestNewMemberships,
  membershipsChange,
  onDateChange,
}: StatsCardsProps) => {
  const [date, setDate] = useState<Date>();

  const handleSelect = (selectedDate: Date | undefined) => {
    if (selectedDate) {
      setDate(selectedDate);
      onDateChange?.(selectedDate);
    }
  };

  // Helper function to format percentage changes
  const formatPercentage = (value: number) => {
    if (isNaN(value) || !isFinite(value)) return "0.0";
    return value.toFixed(1);
  };

  return (
    <div className="grid gap-4 md:grid-cols-3 mb-8">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Active Members</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{activeMembers}</div>
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
          <CardTitle className="text-sm font-medium">
            New Memberships
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className={cn(
                    "ml-2 h-8 w-8 p-0 hover:bg-muted",
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
            {formatPercentage(membershipsChange)}% from{" "}
            {date ? format(date, "MMM dd, yyyy") : "yesterday"}
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default StatsCards;