import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import WorkoutGoalManager from "@/components/admin/WorkoutGoalManager";
import ExerciseManager from "@/components/admin/ExerciseManager";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { addDays, isWithinInterval } from "date-fns";
import Navbar from "@/components/Navbar";

const AdminDashboard = () => {
  const navigate = useNavigate();

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

  const { data: memberships } = useQuery({
    queryKey: ["all-memberships"],
    enabled: !!isAdmin,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("user_memberships")
        .select(`
          *,
          profile:user_id (
            full_name,
            phone_number
          )
        `);
      
      if (error) throw error;
      return data;
    },
  });

  useEffect(() => {
    if (session === null) {
      navigate("/admin/login");
    } else if (isAdmin === false) {
      navigate("/");
    }
  }, [session, isAdmin, navigate]);

  if (!session || !isAdmin) return null;

  const today = new Date();
  const threeDaysFromNow = addDays(today, 3);

  const activeMembers = memberships?.filter(m => m.status === "active")?.length || 0;
  const inactiveMembers = memberships?.filter(m => m.status !== "active")?.length || 0;
  const expiringMembers = memberships?.filter(m => {
    const endDate = new Date(m.end_date);
    return m.status === "active" && isWithinInterval(endDate, {
      start: today,
      end: threeDaysFromNow
    });
  })?.length || 0;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>

        <div className="grid gap-4 md:grid-cols-3 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Members</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{activeMembers}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Inactive Members</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{inactiveMembers}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Expiring Soon</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{expiringMembers}</div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="users" className="space-y-4">
          <TabsList>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="workout">Workout Plans</TabsTrigger>
          </TabsList>

          <TabsContent value="users" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>User Management</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {memberships?.map((membership) => (
                    <div key={membership.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <p className="font-medium">{membership.profile?.full_name}</p>
                        <p className="text-sm text-muted-foreground">
                          Status: {membership.status}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Expires: {new Date(membership.end_date).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {membership.profile?.phone_number}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="workout" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <WorkoutGoalManager />
              <ExerciseManager />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminDashboard;