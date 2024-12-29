import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown, Users } from "lucide-react";

interface StatsCardsProps {
  activeMembers: number;
  inactiveMembers: number;
  expiringMembers: number;
  latestVisits: number;
  visitsChange: number;
  latestNewMemberships: number;
  membershipsChange: number;
}

const StatsCards = ({
  activeMembers,
  latestVisits,
  visitsChange,
  latestNewMemberships,
  membershipsChange,
}: StatsCardsProps) => {
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
            {visitsChange.toFixed(1)}% from yesterday
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">New Memberships</CardTitle>
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
            {membershipsChange.toFixed(1)}% from yesterday
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default StatsCards;