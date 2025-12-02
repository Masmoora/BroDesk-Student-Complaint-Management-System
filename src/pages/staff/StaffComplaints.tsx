import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/StatusBadge";
import { Navbar } from "@/components/Navbar";
import { ArrowLeft } from "lucide-react";

interface Complaint {
  id: string;
  title: string;
  description: string;
  category: string;
  status: string;
  created_at: string;
  student_profile: {
    full_name: string;
  };
}

export default function StaffComplaints() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchComplaints();
    }
  }, [user]);

  const fetchComplaints = async () => {
    try {
      const { data: complaintsData, error } = await supabase
        .from("complaints")
        .select("*")
        .eq("assigned_to", user?.id)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching complaints:", error);
        setLoading(false);
        return;
      }

      if (complaintsData && complaintsData.length > 0) {
        const studentIds = [...new Set(complaintsData.map(c => c.student_id))];
        const { data: profilesData } = await supabase
          .from("profiles")
          .select("id, full_name")
          .in("id", studentIds);

        const complaintsWithProfiles = complaintsData.map(complaint => ({
          ...complaint,
          student_profile: profilesData?.find(p => p.id === complaint.student_id),
        }));

        setComplaints(complaintsWithProfiles as any);
      } else {
        setComplaints([]);
      }
    } catch (error) {
      console.error("Error in fetchComplaints:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto p-6">
        <Button
          variant="ghost"
          className="mb-6"
          onClick={() => navigate("/staff/home")}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Dashboard
        </Button>

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Assigned Complaints</h1>
          <p className="text-muted-foreground">Manage and resolve complaints assigned to you</p>
        </div>

        {loading ? (
          <p>Loading...</p>
        ) : complaints.length === 0 ? (
          <Card>
            <CardContent className="pt-6 text-center">
              <p className="text-muted-foreground">No complaints assigned to you</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {complaints.map((complaint) => (
              <Card key={complaint.id} className="cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => navigate(`/complaint/${complaint.id}`)}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{complaint.title}</CardTitle>
                      <p className="text-sm text-muted-foreground mt-1">
                        By: {complaint.student_profile?.full_name} • {new Date(complaint.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <StatusBadge status={complaint.status as any} />
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground line-clamp-2">{complaint.description}</p>
                  <div className="mt-2">
                    <span className="text-sm font-medium">Category: </span>
                    <span className="text-sm text-muted-foreground capitalize">{complaint.category}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
