import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import WorkoutGoalManager from "@/components/admin/WorkoutGoalManager";
import ExerciseManager from "@/components/admin/ExerciseManager";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { addDays, isWithinInterval, subDays } from "date-fns";
import { useToast } from "@/components/ui/use-toast";
import AdminHeader from "@/components/admin/AdminHeader";
import StatsCards from "@/components/admin/StatsCards";
import AnalyticsChart from "@/components/admin/AnalyticsChart";
import UserManagement from "@/components/admin/UserManagement";

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
        <AdminHeader onLogout={handleLogout} />

        <StatsCards
          activeMembers={activeMembers}
          inactiveMembers={inactiveMembers}
          expiringMembers={expiringMembers}
          latestVisits={latestDay?.total_visits || 0}
          visitsChange={visitsChange}
          latestNewMemberships={latestDay?.new_memberships || 0}
          membershipsChange={membershipsChange}
        />

        <AnalyticsChart data={analytics || []} />

        <Tabs defaultValue="users" className="space-y-4">
          <TabsList>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="workout">Workout Plans</TabsTrigger>
          </TabsList>

          <TabsContent value="users" className="space-y-4">
            <UserManagement memberships={memberships || []} />
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