import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import WorkoutGoalManager from "@/components/admin/WorkoutGoalManager";
import ExerciseManager from "@/components/admin/ExerciseManager";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { addDays, isWithinInterval, startOfDay } from "date-fns";
import { useToast } from "@/components/ui/use-toast";
import AdminHeader from "@/components/admin/AdminHeader";
import StatsCards from "@/components/admin/StatsCards";
import UserManagement from "@/components/admin/UserManagement";
import AttendanceManagement from "@/components/admin/AttendanceManagement";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [compareDate, setCompareDate] = useState<Date>(
    startOfDay(new Date(Date.now() - 86400000))
  );

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

  const { data: memberships = [] } = useQuery({
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

      return membershipData.map(membership => ({
        ...membership,
        profile: profilesData.find(profile => profile.id === membership.user_id)
      }));
    },
  });

  const { data: membershipsComparison = { today: 0, compareDay: 0 } } = useQuery({
    queryKey: ["memberships-comparison", compareDate],
    enabled: !!isAdmin,
    queryFn: async () => {
      const today = startOfDay(new Date());
      
      const { data: todayData, error: todayError } = await supabase
        .from("user_memberships")
        .select("created_at")
        .gte("created_at", today.toISOString())
        .lt("created_at", new Date().toISOString());

      if (todayError) throw todayError;

      const { data: compareData, error: compareError } = await supabase
        .from("user_memberships")
        .select("created_at")
        .gte("created_at", compareDate.toISOString())
        .lt("created_at", addDays(compareDate, 1).toISOString());

      if (compareError) throw compareError;

      return {
        today: todayData.length,
        compareDay: compareData.length
      };
    },
  });

  const { data: visitsData = { today: 0, yesterday: 0 } } = useQuery({
    queryKey: ["daily-visits"],
    enabled: !!isAdmin,
    queryFn: async () => {
      const today = startOfDay(new Date());
      const yesterday = startOfDay(new Date(Date.now() - 86400000));
      
      const { data, error } = await supabase
        .from("analytics_daily")
        .select("date, total_visits")
        .in("date", [today.toISOString(), yesterday.toISOString()]);

      if (error) throw error;

      const todayVisits = data.find(d => d.date === today.toISOString())?.total_visits || 0;
      const yesterdayVisits = data.find(d => d.date === yesterday.toISOString())?.total_visits || 0;

      return {
        today: todayVisits,
        yesterday: yesterdayVisits
      };
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
    if (session === null || isAdmin === false) {
      navigate("/admin/login");
    }
  }, [session, isAdmin, navigate]);

  if (!session || isAdmin === undefined) return null;
  if (!isAdmin) return null;

  const today = new Date();
  const threeDaysFromNow = addDays(today, 3);

  const activeMembers = memberships.filter(m => m.status === "active").length;
  const inactiveMembers = memberships.filter(m => m.status !== "active").length;
  const expiringMembers = memberships.filter(m => {
    const endDate = new Date(m.end_date);
    return m.status === "active" && isWithinInterval(endDate, {
      start: today,
      end: threeDaysFromNow
    });
  }).length;

  const membershipsChange = membershipsComparison.compareDay
    ? ((membershipsComparison.today - membershipsComparison.compareDay) / membershipsComparison.compareDay) * 100
    : 0;

  const visitsChange = visitsData.yesterday
    ? ((visitsData.today - visitsData.yesterday) / visitsData.yesterday) * 100
    : 0;

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <AdminHeader onLogout={handleLogout} />

        <StatsCards
          activeMembers={activeMembers}
          inactiveMembers={inactiveMembers}
          expiringMembers={expiringMembers}
          latestVisits={visitsData.today}
          visitsChange={visitsChange}
          latestNewMemberships={membershipsComparison.today}
          membershipsChange={membershipsChange}
          onDateChange={setCompareDate}
        />

        <Tabs defaultValue="users" className="space-y-4">
          <TabsList>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="attendance">Attendance</TabsTrigger>
            <TabsTrigger value="workout">Workout Plans</TabsTrigger>
          </TabsList>

          <TabsContent value="users" className="space-y-4">
            <UserManagement memberships={memberships} />
          </TabsContent>

          <TabsContent value="attendance" className="space-y-4">
            <AttendanceManagement />
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