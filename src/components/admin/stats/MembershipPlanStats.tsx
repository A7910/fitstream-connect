import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, ArrowUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";

interface MembershipPlanStatsProps {
  membershipPlans: any[];
  onToggleDefault: () => void;
}

export const MembershipPlanStats = ({ membershipPlans, onToggleDefault }: MembershipPlanStatsProps) => {
  return (
    <div className="space-y-4">
      {membershipPlans.map((plan) => (
        <div key={plan.id} className="flex justify-between items-center">
          <span className="font-medium">{plan.name}</span>
          <span className="text-muted-foreground">
            {plan.subscribers_count} subscribers
          </span>
        </div>
      ))}
      <div className="flex justify-end">
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggleDefault}
          title="Change default first page"
        >
          <ArrowUpDown className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};