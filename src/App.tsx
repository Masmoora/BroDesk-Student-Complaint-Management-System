import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import Landing from "./pages/Landing";
import Auth from "./pages/Auth";
import StudentHome from "./pages/student/StudentHome";
import SubmitComplaint from "./pages/student/SubmitComplaint";
import StudentComplaints from "./pages/student/StudentComplaints";
import StaffHome from "./pages/staff/StaffHome";
import StaffComplaints from "./pages/staff/StaffComplaints";
import AdminDashboardHome from "./pages/admin/AdminDashboardHome";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminComplaints from "./pages/admin/AdminComplaints";
import AdminStaff from "./pages/admin/AdminStaff";
import AdminCategories from "./pages/admin/AdminCategories";
import AdminSettings from "./pages/admin/AdminSettings";
import AdminNotifications from "./pages/admin/AdminNotifications";
import ComplaintDetail from "./pages/ComplaintDetail";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/auth" element={<Auth />} />

            {/* Student Routes */}
            <Route path="/student/home" element={<StudentHome />} />
            <Route path="/student/submit-complaint" element={<SubmitComplaint />} />
            <Route path="/student/complaints" element={<StudentComplaints />} />

            {/* Staff Routes */}
            <Route path="/staff/home" element={<StaffHome />} />
            <Route path="/staff/complaints" element={<StaffComplaints />} />

            {/* Admin Routes */}
            <Route path="/admin/dashboard" element={<AdminDashboardHome />} />
            <Route path="/admin/users" element={<AdminUsers />} />
            <Route path="/admin/staff" element={<AdminStaff />} />
            <Route path="/admin/complaints" element={<AdminComplaints />} />
            <Route path="/admin/categories" element={<AdminCategories />} />
            <Route path="/admin/notifications" element={<AdminNotifications />} />
            <Route path="/admin/settings" element={<AdminSettings />} />

            {/* Shared Routes */}
            <Route path="/complaint/:id" element={<ComplaintDetail />} />

            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
