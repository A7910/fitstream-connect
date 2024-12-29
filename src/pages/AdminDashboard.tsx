import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format, addDays } from "date-fns";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import Navbar from "@/components/Navbar";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  // Check if user is authenticated and is admin
  const { data: session } = useQuery({
    queryKey: ["session"],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      return session;
    },
  });

  const { data: isAdmin } = useQuery({
    queryKey: ["isAdmin", session?.user?.id],
    enabled: !!session?.user?.id,
    queryFn: async () => {
      const { data } = await supabase
        .from("admin_users")
        .select()
        .eq("user_id", session?.user?.id)
        .maybeSingle();
      return !!data;
    },
  });

  // Redirect if not authenticated or not admin
  useEffect(() => {
    if (session === null || (isAdmin !== undefined && !isAdmin)) {
      navigate("/");
    }
  }, [session, isAdmin, navigate]);

  // Fetch active members
  const { data: activeMembers } = useQuery({
    queryKey: ["activeMembers"],
    enabled: !!isAdmin,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("user_memberships")
        .select(`
          *,
          profiles:user_id (
            id,
            full_name,
            phone_number
          ),
          membership_plans (
            name
          )
        `)
        .eq("status", "active")
        .gte("end_date", new Date().toISOString());

      if (error) throw error;
      return data;
    },
  });

  // Fetch inactive members
  const { data: inactiveMembers } = useQuery({
    queryKey: ["inactiveMembers"],
    enabled: !!isAdmin,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("user_memberships")
        .select(`
          *,
          profiles:user_id (
            id,
            full_name,
            phone_number
          ),
          membership_plans (
            name
          )
        `)
        .eq("status", "active")
        .lt("end_date", new Date().toISOString());

      if (error) throw error;
      return data;
    },
  });

  // Fetch expiring members
  const { data: expiringMembers } = useQuery({
    queryKey: ["expiringMembers"],
    enabled: !!isAdmin,
    queryFn: async () => {
      const threeDaysFromNow = addDays(new Date(), 3).toISOString();
      const today = new Date().toISOString();

      const { data, error } = await supabase
        .from("user_memberships")
        .select(`
          *,
          profiles:user_id (
            id,
            full_name,
            phone_number
          ),
          membership_plans (
            name
          )
        `)
        .eq("status", "active")
        .gte("end_date", today)
        .lte("end_date", threeDaysFromNow);

      if (error) throw error;
      return data;
    },
  });

  // Cancel membership mutation
  const cancelMembership = useMutation({
    mutationFn: async (membershipId: string) => {
      const { error } = await supabase
        .from("user_memberships")
        .update({ status: "cancelled" })
        .eq("id", membershipId);

      if (error) throw error;
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Membership cancelled successfully",
      });
    },
    onError: (error) => {
      console.error("Error cancelling membership:", error);
      toast({
        title: "Error",
        description: "Failed to cancel membership",
        variant: "destructive",
      });
    },
  });

  if (!session || !isAdmin) return null;

  const MembershipTable = ({ members, title }: { members: any[]; title: string }) => (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>
          {members?.length || 0} members
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Plan</TableHead>
              <TableHead>End Date</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {members?.map((member) => (
              <TableRow key={member.id}>
                <TableCell>{member.profiles?.full_name || "N/A"}</TableCell>
                <TableCell>{member.profiles?.phone_number || "N/A"}</TableCell>
                <TableCell>{member.membership_plans?.name}</TableCell>
                <TableCell>{format(new Date(member.end_date), "PPP")}</TableCell>
                <TableCell>
                  {member.status === "active" && (
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => cancelMembership.mutate(member.id)}
                    >
                      Cancel Membership
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>
        
        <MembershipTable
          members={activeMembers || []}
          title="Active Members"
        />
        
        <MembershipTable
          members={expiringMembers || []}
          title="Members Expiring Soon (Next 3 Days)"
        />
        
        <MembershipTable
          members={inactiveMembers || []}
          title="Inactive Members"
        />
      </div>
    </div>
  );
};

export default AdminDashboard;