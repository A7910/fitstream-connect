import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip } from "@/components/ui/chart";
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer } from "recharts";

// Chart configuration
const chartConfig = {
  visits: {
    label: "Daily Visits",
    color: "#8884d8",
  },
  members: {
    label: "Active Members",
    color: "#82ca9d",
  },
  newMemberships: {
    label: "New Memberships",
    color: "#ffc658",
  },
};

interface AnalyticsChartProps {
  data: any[];
}

const AnalyticsChart = ({ data }: AnalyticsChartProps) => {
  return (
    <Card className="mb-8">
      <CardHeader>
        <CardTitle>30 Day Analytics</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ChartContainer config={chartConfig}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data}>
                <XAxis
                  dataKey="date"
                  tickFormatter={(date) => new Date(date).toLocaleDateString()}
                  stroke="#888888"
                  fontSize={12}
                />
                <YAxis stroke="#888888" fontSize={12} />
                <ChartTooltip />
                <Area
                  type="monotone"
                  dataKey="total_visits"
                  stroke={chartConfig.visits.color}
                  fill={chartConfig.visits.color}
                  fillOpacity={0.2}
                  name="Daily Visits"
                />
                <Area
                  type="monotone"
                  dataKey="active_members"
                  stroke={chartConfig.members.color}
                  fill={chartConfig.members.color}
                  fillOpacity={0.2}
                  name="Active Members"
                />
                <Area
                  type="monotone"
                  dataKey="new_memberships"
                  stroke={chartConfig.newMemberships.color}
                  fill={chartConfig.newMemberships.color}
                  fillOpacity={0.2}
                  name="New Memberships"
                />
              </AreaChart>
            </ResponsiveContainer>
          </ChartContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default AnalyticsChart;