import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import {
  LayoutDashboard,
  Users,
  FileText,
  FolderKanban,
  UserCog,
  Bell,
  LogOut,
} from "lucide-react";
import { Button } from "./ui/button";
import { cn } from "@/lib/utils";

export function AdminSidebar() {
  const location = useLocation();
  const { signOut } = useAuth();

  const navItems = [
    {
      title: "Dashboard",
      icon: LayoutDashboard,
      path: "/admin/dashboard"
    },
    {
      title: "User Management",
      icon: Users,
      path: "/admin/users"
    },
    {
      title: "Staff Management",
      icon: UserCog,
      path: "/admin/staff"
    },
    {
      title: "Complaint Management",
      icon: FileText,
      path: "/admin/complaints"
    },
    {
      title: "Category Management",
      icon: FolderKanban,
      path: "/admin/categories"
    },
    {
      title: "Notifications",
      icon: Bell,
      path: "/admin/notifications"
    }
  ];

  return (
    <aside className="w-64 min-h-screen bg-card border-r border-border flex flex-col">
      <div className="p-6 border-b border-border">
        <h1 className="text-2xl font-bold text-primary">BroDesk</h1>
        <p className="text-sm text-muted-foreground mt-1">Admin Panel</p>
      </div>

      <nav className="flex-1 p-4 space-y-2">
        {navItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={cn(
              "flex items-center gap-3 px-4 py-3 rounded-lg transition-colors",
              location.pathname === item.path
                ? "bg-primary text-primary-foreground"
                : "text-foreground hover:bg-accent"
            )}
          >
            <item.icon className="h-5 w-5" />
            <span className="font-medium">{item.title}</span>
          </Link>
        ))}
      </nav>

      <div className="p-4 border-t border-border">
        <Button
          onClick={signOut}
          variant="ghost"
          className="w-full justify-start gap-3"
        >
          <LogOut className="h-5 w-5" />
          <span>Logout</span>
        </Button>
      </div>
    </aside>
  );
}
