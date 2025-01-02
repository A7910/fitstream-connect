import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import WorkoutGoalManager from "@/components/admin/WorkoutGoalManager";
import ExerciseManager from "@/components/admin/ExerciseManager";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";
import AdminHeader from "@/components/admin/AdminHeader";
import StatsCards from "@/components/admin/StatsCards";
import UserManagement from "@/components/admin/UserManagement";
import AttendanceManagement from "@/components/admin/AttendanceManagement";
import ChatInterface from "@/components/admin/chat/ChatInterface";
import { useAnalyticsData, DateRange } from "@/hooks/useAnalyticsData";
import { BackButton } from "@/components/ui/back-button";
import { Loader2 } from "lucide-react";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [dateRange, setDateRange] = useState<DateRange>("week");
  const [customDate, setCustomDate] = useState<Date>();

  // Check session and admin status
  const { data: session, isLoading: sessionLoading } = useQuery({
    queryKey: ["session"],
    queryFn: async () => {
      console.log("Fetching session...");
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error) {
        console.error("Session error:", error);
        throw error;
      }
      console.log("Session status:", session ? "Found" : "Not found");
      return session;
    },
  });

  // Check admin status only if we have a session
  const { data: isAdmin, isLoading: adminLoading } = useQuery({
    queryKey: ["isAdmin", session?.user?.id],
    enabled: !!session?.user?.id,
    queryFn: async () => {
      console.log("Checking admin status for user:", session?.user?.id);
      const { data, error } = await supabase
        .from("admin_users")
        .select()
        .eq("user_id", session?.user?.id)
        .maybeSingle();

      if (error) {
        console.error("Admin check error:", error);
        throw error;
      }

      const isAdminUser = !!data;
      console.log("Is admin user:", isAdminUser);
      return isAdminUser;
    },
  });

  // Fetch memberships only if user is admin
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

  const { membershipsComparison, visitsData, dateRange: computedDateRange } = useAnalyticsData(
    dateRange,
    customDate
  );

  // Calculate visits change percentage
  const visitsChange = visitsData.yesterday !== 0
    ? ((visitsData.today - visitsData.yesterday) / visitsData.yesterday) * 100
    : 0;

  // Calculate memberships change percentage
  const membershipsChange = membershipsComparison.previous !== 0
    ? ((membershipsComparison.current - membershipsComparison.previous) / membershipsComparison.previous) * 100
    : membershipsComparison.current > 0 ? 100 : 0;

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

  const handleRefresh = async () => {
    try {
      await queryClient.invalidateQueries({ queryKey: ["all-memberships"] });
      await queryClient.invalidateQueries({ queryKey: ["analytics"] });
      toast({
        title: "Statistics refreshed",
        description: "The latest data has been fetched from the database.",
      });
    } catch (error) {
      console.error("Refresh error:", error);
      toast({
        title: "Refresh failed",
        description: "There was an error refreshing the data. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Set up auth state listener
  useEffect(() => {
    console.log("Setting up auth state listener");
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log("Auth state changed:", event);
      if (event === 'SIGNED_OUT') {
        console.log("User signed out, redirecting to login");
        navigate("/admin/login");
      }
    });

    return () => {
      console.log("Cleaning up auth state listener");
      subscription.unsubscribe();
    };
  }, [navigate]);

  // Redirect if not authenticated or not admin
  useEffect(() => {
    console.log("Checking auth status:", { sessionLoading, adminLoading, session, isAdmin });
    if (!sessionLoading && !session) {
      console.log("No session found, redirecting to login");
      navigate("/admin/login");
      return;
    }

    if (!adminLoading && session && isAdmin === false) {
      console.log("User is not admin, redirecting to login");
      navigate("/admin/login");
      toast({
        title: "Access Denied",
        description: "You must be an admin to access this page.",
        variant: "destructive",
      });
    }
  }, [session, isAdmin, sessionLoading, adminLoading, navigate, toast]);

  // Show loading state while checking auth
  if (sessionLoading || adminLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  // Don't render anything if not authenticated or not admin
  if (!session || !isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <BackButton />
        <AdminHeader onLogout={handleLogout} />

        <StatsCards
          users={memberships.map(m => m.profile) || []}
          memberships={memberships}
          latestVisits={visitsData.today}
          visitsChange={visitsChange}
          latestNewMemberships={membershipsComparison.current}
          membershipsChange={membershipsChange}
          dateRange={dateRange}
          onDateRangeChange={setDateRange}
          onCustomDateChange={setCustomDate}
          rangeStart={computedDateRange.start}
          rangeEnd={computedDateRange.end}
          onRefresh={handleRefresh}
        />

        <Tabs defaultValue="users" className="space-y-4">
          <TabsList>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="attendance">Attendance</TabsTrigger>
            <TabsTrigger value="workout">Workout Plans</TabsTrigger>
            <TabsTrigger value="chat">Chat</TabsTrigger>
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

          <TabsContent value="chat" className="space-y-4">
            <ChatInterface />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminDashboard;