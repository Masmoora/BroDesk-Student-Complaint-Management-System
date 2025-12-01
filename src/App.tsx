import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
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
            <Route path="/student/home" element={<ProtectedRoute allowedRoles={["student"]}><StudentHome /></ProtectedRoute>} />
            <Route path="/student/submit-complaint" element={<ProtectedRoute allowedRoles={["student"]}><SubmitComplaint /></ProtectedRoute>} />
            <Route path="/student/complaints" element={<ProtectedRoute allowedRoles={["student"]}><StudentComplaints /></ProtectedRoute>} />

            {/* Staff Routes */}
            <Route path="/staff/home" element={<ProtectedRoute allowedRoles={["staff"]}><StaffHome /></ProtectedRoute>} />
            <Route path="/staff/complaints" element={<ProtectedRoute allowedRoles={["staff"]}><StaffComplaints /></ProtectedRoute>} />

            {/* Admin Routes */}
            <Route path="/admin/dashboard" element={<ProtectedRoute allowedRoles={["admin"]}><AdminDashboardHome /></ProtectedRoute>} />
            <Route path="/admin/users" element={<ProtectedRoute allowedRoles={["admin"]}><AdminUsers /></ProtectedRoute>} />
            <Route path="/admin/staff" element={<ProtectedRoute allowedRoles={["admin"]}><AdminStaff /></ProtectedRoute>} />
            <Route path="/admin/complaints" element={<ProtectedRoute allowedRoles={["admin"]}><AdminComplaints /></ProtectedRoute>} />
            <Route path="/admin/categories" element={<ProtectedRoute allowedRoles={["admin"]}><AdminCategories /></ProtectedRoute>} />
            <Route path="/admin/notifications" element={<ProtectedRoute allowedRoles={["admin"]}><AdminNotifications /></ProtectedRoute>} />
            <Route path="/admin/settings" element={<ProtectedRoute allowedRoles={["admin"]}><AdminSettings /></ProtectedRoute>} />

            {/* Shared Routes */}
            <Route path="/complaint/:id" element={<ProtectedRoute><ComplaintDetail /></ProtectedRoute>} />

            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
