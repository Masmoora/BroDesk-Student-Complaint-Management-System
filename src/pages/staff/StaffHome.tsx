import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Clock, CheckCircle2, AlertCircle } from "lucide-react";
import { Navbar } from "@/components/Navbar";

interface ComplaintStats {
  total: number;
  pending: number;
  in_progress: number;
  resolved: number;
}

export default function StaffHome() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState<ComplaintStats>({
    total: 0,
    pending: 0,
    in_progress: 0,
    resolved: 0,
  });

  useEffect(() => {
    if (user) {
      fetchComplaintStats();
    }
  }, [user]);

  const fetchComplaintStats = async () => {
    const { data, error } = await supabase
      .from("complaints")
      .select("status")
      .eq("assigned_to", user?.id);

    if (!error && data) {
      const stats = {
        total: data.length,
        pending: data.filter((c) => c.status === "pending").length,
        in_progress: data.filter((c) => c.status === "in_progress").length,
        resolved: data.filter((c) => c.status === "resolved").length,
      };
      setStats(stats);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Staff Dashboard</h1>
          <p className="text-muted-foreground">Manage assigned complaints</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Assigned</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Pending</CardTitle>
              <Clock className="h-4 w-4 text-warning" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-warning">{stats.pending}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">In Progress</CardTitle>
              <AlertCircle className="h-4 w-4 text-in-progress" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-in-progress">{stats.in_progress}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Resolved</CardTitle>
              <CheckCircle2 className="h-4 w-4 text-success" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-success">{stats.resolved}</div>
            </CardContent>
          </Card>
        </div>

        <div className="flex gap-4">
          <Button onClick={() => navigate("/staff/complaints")} size="lg">
            View Assigned Complaints
          </Button>
        </div>
      </div>
    </div>
  );
}
