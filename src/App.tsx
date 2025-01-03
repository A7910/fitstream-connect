import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Login from "./pages/Login";
import AdminLogin from "./pages/AdminLogin";
import Profile from "./pages/Profile";
import MembershipPlans from "./pages/MembershipPlans";
import WorkoutPlan from "./pages/WorkoutPlan";
import AdminDashboard from "./pages/AdminDashboard";
import { StrictMode } from "react";

const queryClient = new QueryClient();

const App = () => {
  return (
    <StrictMode>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <TooltipProvider>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/login" element={<Login />} />
              <Route path="/admin/login" element={<AdminLogin />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/membership-plans" element={<MembershipPlans />} />
              <Route path="/workout-plan" element={<WorkoutPlan />} />
              <Route path="/admin" element={<AdminDashboard />} />
            </Routes>
            <Toaster />
            <Sonner />
          </TooltipProvider>
        </BrowserRouter>
      </QueryClientProvider>
    </StrictMode>
  );
};

export default App;