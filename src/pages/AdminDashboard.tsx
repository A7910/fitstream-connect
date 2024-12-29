import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import WorkoutGoalManager from "@/components/admin/WorkoutGoalManager";
import ExerciseManager from "@/components/admin/ExerciseManager";
import AdminLogo from "@/components/admin/AdminLogo";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { addDays, isWithinInterval, subDays } from "date-fns";
import { Button } from "@/components/ui/button";
import { LogOut, TrendingUp, TrendingDown, Users } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { ChartContainer, ChartTooltip } from "@/components/ui/chart";
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer } from "recharts";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

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
      const { data: membershipData, error: membershipError } = await supabase
        .from("user_memberships")
        .select("*");
      
      if (membershipError) throw membershipError;

      const { data: profilesData, error: profilesError } = await supabase
        .from("profiles")
        .select("*");
      
      if (profilesError) throw profilesError;

      const combinedData = membershipData.map(membership => ({
        ...membership,
        profile: profilesData.find(profile => profile.id === membership.user_id)
      }));

      return combinedData;
    },
  });

  const { data: analytics } = useQuery({
    queryKey: ["analytics"],
    enabled: !!isAdmin,
    queryFn: async () => {
      const thirtyDaysAgo = subDays(new Date(), 30);
      const { data, error } = await supabase
        .from("analytics_daily")
        .select("*")
        .gte("date", thirtyDaysAgo.toISOString())
        .order("date", { ascending: true });

      if (error) throw error;
      return data;
    },
  });

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      navigate("/admin/login");
      toast({
        title: "Logged out successfully",
        description: "You have been logged out of the admin dashboard",
      });
    } catch (error) {
      console.error("Logout error:", error);
      toast({
        title: "Logout failed",
        description: "There was an error logging out. Please try again.",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    if (session === null) {
      navigate("/admin/login");
    } else if (isAdmin === false) {
      navigate("/admin/login");
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

  // Calculate trends
  const latestDay = analytics?.[analytics.length - 1];
  const previousDay = analytics?.[analytics.length - 2];
  
  const visitsChange = latestDay && previousDay
    ? ((latestDay.total_visits - previousDay.total_visits) / previousDay.total_visits) * 100
    : 0;
  
  const membershipsChange = latestDay && previousDay
    ? ((latestDay.new_memberships - previousDay.new_memberships) / previousDay.new_memberships) * 100
    : 0;

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">Admin Dashboard</h1>
            <div className="mt-4">
              <AdminLogo />
            </div>
          </div>
          <Button variant="outline" onClick={handleLogout}>
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </Button>
        </div>

        <div className="grid gap-4 md:grid-cols-3 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Active Members
              </CardTitle>
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
              <div className="text-2xl font-bold">{latestDay?.total_visits || 0}</div>
              <p className="text-xs text-muted-foreground">
                {visitsChange > 0 ? "+" : ""}{visitsChange.toFixed(1)}% from yesterday
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
              <div className="text-2xl font-bold">{latestDay?.new_memberships || 0}</div>
              <p className="text-xs text-muted-foreground">
                {membershipsChange > 0 ? "+" : ""}{membershipsChange.toFixed(1)}% from yesterday
              </p>
            </CardContent>
          </Card>
        </div>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle>30 Day Analytics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ChartContainer>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={analytics}>
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
                      stroke="#8884d8"
                      fill="#8884d8"
                      fillOpacity={0.2}
                      name="Daily Visits"
                    />
                    <Area
                      type="monotone"
                      dataKey="active_members"
                      stroke="#82ca9d"
                      fill="#82ca9d"
                      fillOpacity={0.2}
                      name="Active Members"
                    />
                    <Area
                      type="monotone"
                      dataKey="new_memberships"
                      stroke="#ffc658"
                      fill="#ffc658"
                      fillOpacity={0.2}
                      name="New Memberships"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </ChartContainer>
            </div>
          </CardContent>
        </Card>

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