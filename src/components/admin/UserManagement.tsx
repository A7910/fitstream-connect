import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ChevronDown, Loader2 } from "lucide-react";

interface UserManagementProps {
  memberships: any[];
}

const UserManagement = ({ memberships }: UserManagementProps) => {
  const [isAddingUser, setIsAddingUser] = useState(false);
  const [newUserData, setNewUserData] = useState({
    email: "",
    fullName: "",
    phoneNumber: "",
  });
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: membershipPlans, isLoading: isLoadingPlans } = useQuery({
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

  const { data: allUsers, isLoading: isLoadingUsers } = useQuery({
    queryKey: ["all-users"],
    queryFn: async () => {
      const { data: profiles, error: profilesError } = await supabase
        .from("profiles")
        .select("*");
      
      if (profilesError) throw profilesError;
      return profiles;
    },
  });

  const getMembershipStatusColor = (status: string, endDate: string) => {
    const today = new Date();
    const end = new Date(endDate);
    const daysUntilExpiry = Math.ceil((end.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

    if (status === "active") {
      if (daysUntilExpiry <= 3) return "yellow";
      return "green";
    }
    return "red";
  };

  const handleAddUser = async () => {
    try {
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .insert([
          {
            full_name: newUserData.fullName,
            phone_number: newUserData.phoneNumber,
          },
        ])
        .select()
        .single();

      if (profileError) throw profileError;

      toast({
        title: "User added successfully",
        description: "The user has been added to the system.",
      });

      setIsAddingUser(false);
      setNewUserData({ email: "", fullName: "", phoneNumber: "" });
      queryClient.invalidateQueries({ queryKey: ["all-users"] });
    } catch (error) {
      console.error("Error adding user:", error);
      toast({
        title: "Error adding user",
        description: "There was an error adding the user. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleMembershipAction = async (userId: string, planId: string | null, action: 'activate' | 'deactivate') => {
    try {
      if (action === 'activate' && !planId) {
        throw new Error("No plan selected");
      }

      if (action === 'activate') {
        const startDate = new Date();
        const endDate = new Date();
        const selectedPlan = membershipPlans?.find(p => p.id === planId);
        if (!selectedPlan) throw new Error("Plan not found");
        
        endDate.setMonth(endDate.getMonth() + selectedPlan.duration_months);

        const { error } = await supabase
          .from("user_memberships")
          .insert({
            user_id: userId,
            plan_id: planId,
            start_date: startDate.toISOString(),
            end_date: endDate.toISOString(),
            status: "active"
          });

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("user_memberships")
          .update({ status: "inactive" })
          .eq("user_id", userId)
          .eq("status", "active");

        if (error) throw error;
      }

      toast({
        title: `Membership ${action === 'activate' ? 'activated' : 'deactivated'} successfully`,
        description: `The user's membership has been ${action === 'activate' ? 'activated' : 'deactivated'}.`,
      });

      queryClient.invalidateQueries({ queryKey: ["all-memberships"] });
    } catch (error) {
      console.error(`Error ${action}ing membership:`, error);
      toast({
        title: `Error ${action}ing membership`,
        description: `There was an error ${action}ing the membership. Please try again.`,
        variant: "destructive",
      });
    }
  };

  const renderMembershipActions = (userId: string, membership: any) => {
    if (!membership || membership.status === "inactive") {
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm">
              Activate Membership <ChevronDown className="ml-2 h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            {membershipPlans?.map((plan) => (
              <DropdownMenuItem
                key={plan.id}
                onClick={() => handleMembershipAction(userId, plan.id, 'activate')}
              >
                {plan.name} - {plan.price}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      );
    }

    return (
      <Button
        variant="outline"
        size="sm"
        onClick={() => handleMembershipAction(userId, null, 'deactivate')}
      >
        Deactivate Membership
      </Button>
    );
  };

  if (isLoadingUsers || isLoadingPlans) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  const usersWithMembership = allUsers?.map(user => ({
    ...user,
    membership: memberships?.find(m => m.user_id === user.id)
  })) || [];

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>User Management</CardTitle>
        <Dialog open={isAddingUser} onOpenChange={setIsAddingUser}>
          <DialogTrigger asChild>
            <Button>Add New User</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New User</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="fullName">Full Name</Label>
                <Input
                  id="fullName"
                  value={newUserData.fullName}
                  onChange={(e) =>
                    setNewUserData({ ...newUserData, fullName: e.target.value })
                  }
                />
              </div>
              <div>
                <Label htmlFor="phoneNumber">Phone Number</Label>
                <Input
                  id="phoneNumber"
                  value={newUserData.phoneNumber}
                  onChange={(e) =>
                    setNewUserData({ ...newUserData, phoneNumber: e.target.value })
                  }
                />
              </div>
              <Button onClick={handleAddUser}>Add User</Button>
            </div>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {usersWithMembership.map((user) => {
            const statusColor = user.membership
              ? getMembershipStatusColor(
                  user.membership.status,
                  user.membership.end_date
                )
              : "red";

            return (
              <div
                key={user.id}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="space-y-1">
                  <p className="font-medium">{user.full_name}</p>
                  <div className="flex items-center gap-2">
                    <Badge
                      variant={statusColor === "red" ? "destructive" : "outline"}
                    >
                      {user.membership?.status || "inactive"}
                    </Badge>
                    {statusColor === "yellow" && (
                      <span className="text-xs text-yellow-600">
                        Expiring soon
                      </span>
                    )}
                  </div>
                  {user.membership && (
                    <p className="text-sm text-muted-foreground">
                      Expires:{" "}
                      {format(new Date(user.membership.end_date), "MMM dd, yyyy")}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-sm text-muted-foreground">
                    {user.phone_number}
                  </div>
                  {renderMembershipActions(user.id, user.membership)}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

export default UserManagement;