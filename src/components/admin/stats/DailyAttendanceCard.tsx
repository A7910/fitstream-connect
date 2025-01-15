import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { format, startOfDay, endOfDay } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { UserCheck, ChevronLeft, ChevronRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { formatPercentage } from "@/lib/utils";
import { RefreshButton } from "./RefreshButton";

export const DailyAttendanceCard = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());

  const { data: attendanceCount = 0, isLoading } = useQuery({
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

  const handleDateChange = (direction: 'prev' | 'next') => {
    const newDate = new Date(selectedDate);
    if (direction === 'prev') {
      newDate.setDate(newDate.getDate() - 1);
    } else {
      newDate.setDate(newDate.getDate() + 1);
    }
    setSelectedDate(newDate);
  };

  const attendanceChange = previousDayAttendance > 0 
    ? ((attendanceCount - previousDayAttendance) / previousDayAttendance) * 100
    : 0;

  return (
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
            {isLoading ? "Loading..." : attendanceCount}
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
  );
};