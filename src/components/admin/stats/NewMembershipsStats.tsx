import { formatPercentage } from "@/lib/utils";

interface NewMembershipsStatsProps {
  latestNewMemberships: number;
  membershipsChange: number;
  dateRange: string;
}

export const NewMembershipsStats = ({ 
  latestNewMemberships, 
  membershipsChange, 
  dateRange 
}: NewMembershipsStatsProps) => {
  return (
    <div>
      <div className="text-2xl font-bold">{latestNewMemberships}</div>
      <p className="text-xs text-muted-foreground">
        {membershipsChange > 0 ? "+" : ""}
        {formatPercentage(membershipsChange)}% from {dateRange}
      </p>
    </div>
  );
};