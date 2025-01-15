import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { DateRange } from "@/hooks/useAnalyticsData";
import { MembershipStats } from "./stats/MembershipStats";
import { DailyAttendanceCard } from "./stats/DailyAttendanceCard";
import { MembershipPlansCard } from "./stats/MembershipPlansCard";

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
  latestNewMemberships,
  membershipsChange,
  dateRange,
  onRefresh,
}: StatsCardsProps) => {
  const [defaultFirstPage, setDefaultFirstPage] = useState<'stats' | 'plans'>('plans');

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

  const activeMemberships = memberships.filter(m => m.status === 'active');

  const toggleDefaultPage = () => {
    setDefaultFirstPage(defaultFirstPage === 'plans' ? 'stats' : 'plans');
  };

  const formatDateRange = () => {
    return `last ${dateRange}`;
  };

  return (
    <div className="grid gap-4 md:grid-cols-3 mb-8">
      <DailyAttendanceCard />

      <MembershipStats users={users} memberships={activeMemberships} />

      <MembershipPlansCard
        membershipPlans={membershipPlans}
        latestNewMemberships={latestNewMemberships}
        membershipsChange={membershipsChange}
        dateRange={formatDateRange()}
        onToggleDefault={toggleDefaultPage}
      />
    </div>
  );
};

export default StatsCards;