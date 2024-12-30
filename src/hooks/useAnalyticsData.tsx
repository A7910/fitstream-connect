import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { addDays, endOfDay, startOfDay, subDays, subMonths, subYears } from "date-fns";

export type DateRange = "week" | "month" | "year" | "custom";

export const useAnalyticsData = (dateRange: DateRange, customStartDate?: Date) => {
  // Calculate date ranges based on selection
  const getDateRange = () => {
    const today = new Date();
    switch (dateRange) {
      case "week":
        return { start: subDays(today, 7), end: today };
      case "month":
        return { start: subMonths(today, 1), end: today };
      case "year":
        return { start: subYears(today, 1), end: today };
      case "custom":
        return { start: customStartDate || subDays(today, 1), end: today };
      default:
        return { start: subDays(today, 1), end: today };
    }
  };

  const { start, end } = getDateRange();

  // Query for memberships comparison
  const { data: membershipsComparison = { current: 0, previous: 0 } } = useQuery({
    queryKey: ["memberships-comparison", dateRange, customStartDate],
    queryFn: async () => {
      const currentStart = startOfDay(start);
      const currentEnd = endOfDay(end);
      
      // Calculate the previous period of the same length
      const periodLength = currentEnd.getTime() - currentStart.getTime();
      const previousStart = new Date(currentStart.getTime() - periodLength);
      const previousEnd = new Date(currentEnd.getTime() - periodLength);

      console.log("Fetching memberships for date ranges:", {
        current: { start: currentStart, end: currentEnd },
        previous: { start: previousStart, end: previousEnd },
      });

      const { data: currentData, error: currentError } = await supabase
        .from("user_memberships")
        .select("created_at")
        .gte("created_at", currentStart.toISOString())
        .lte("created_at", currentEnd.toISOString());

      if (currentError) {
        console.error("Error fetching current period memberships:", currentError);
        throw currentError;
      }

      const { data: previousData, error: previousError } = await supabase
        .from("user_memberships")
        .select("created_at")
        .gte("created_at", previousStart.toISOString())
        .lte("created_at", previousEnd.toISOString());

      if (previousError) {
        console.error("Error fetching previous period memberships:", previousError);
        throw previousError;
      }

      console.log("Membership comparison results:", {
        current: currentData.length,
        previous: previousData.length,
      });

      return {
        current: currentData.length,
        previous: previousData.length,
      };
    },
  });

  // Query for daily visits
  const { data: visitsData = { today: 0, yesterday: 0 } } = useQuery({
    queryKey: ["daily-visits"],
    queryFn: async () => {
      const today = startOfDay(new Date());
      const yesterday = startOfDay(new Date(Date.now() - 86400000));
      
      const { data, error } = await supabase
        .from("analytics_daily")
        .select("date, total_visits")
        .in("date", [today.toISOString(), yesterday.toISOString()]);

      if (error) throw error;

      const todayVisits = data.find(d => d.date === today.toISOString())?.total_visits || 0;
      const yesterdayVisits = data.find(d => d.date === yesterday.toISOString())?.total_visits || 0;

      return {
        today: todayVisits,
        yesterday: yesterdayVisits
      };
    },
  });

  return {
    membershipsComparison,
    visitsData,
    dateRange: { start, end },
  };
};