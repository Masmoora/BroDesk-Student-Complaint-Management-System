import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { LogOut, FileText } from "lucide-react";

export const Navbar = () => {
  const { signOut, userRole } = useAuth();

  const getRoleTitle = () => {
    switch (userRole) {
      case "admin":
        return "Admin Dashboard";
      case "staff":
        return "Staff Dashboard";
      case "student":
        return "Student Dashboard";
      default:
        return "Dashboard";
    }
  };

  return (
    <nav className="border-b bg-card shadow-soft">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="h-6 w-6 text-primary" />
            <h1 className="text-xl font-bold text-foreground">BroDesk - {getRoleTitle()}</h1>
          </div>
          <Button onClick={signOut} variant="ghost" size="sm">
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </Button>
        </div>
      </div>
    </nav>
  );
};
