import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { StatusBadge } from "@/components/StatusBadge";
import { useToast } from "@/hooks/use-toast";
import { AdminSidebar } from "@/components/AdminSidebar";

interface Complaint {
  id: string;
  title: string;
  category: string;
  status: string;
  created_at: string;
  assigned_to: string | null;
  student_profile: {
    full_name: string;
  };
}

interface StaffMember {
  user_id: string;
  profile: {
    full_name: string;
  };
}

export default function AdminComplaints() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const [complaintsResult, staffResult] = await Promise.all([
      supabase
        .from("complaints")
        .select(`
          *,
          student_profile:profiles!complaints_student_id_fkey(full_name)
        `)
        .order("created_at", { ascending: false }),
      supabase
        .from("user_roles")
        .select(`
          user_id,
          profile:profiles!user_roles_user_id_fkey(full_name)
        `)
        .eq("role", "staff"),
    ]);

    if (!complaintsResult.error && complaintsResult.data) {
      setComplaints(complaintsResult.data as any);
    }

    if (!staffResult.error && staffResult.data) {
      setStaff(staffResult.data as any);
    }

    setLoading(false);
  };

  const handleAssignStaff = async (complaintId: string, staffId: string) => {
    const { error } = await supabase
      .from("complaints")
      .update({ assigned_to: staffId })
      .eq("id", complaintId);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to assign staff",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: "Staff assigned successfully",
      });
      fetchData();
    }
  };

  return (
    <div className="min-h-screen bg-background flex">
      <AdminSidebar />
      <div className="flex-1 p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Complaint Management</h1>
          <p className="text-muted-foreground">View and manage all complaints</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>All Complaints</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-center text-muted-foreground py-8">Loading...</p>
            ) : complaints.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">No complaints found</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Student</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Assign Staff</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {complaints.map((complaint) => (
                    <TableRow key={complaint.id}>
                      <TableCell className="font-medium">{complaint.title}</TableCell>
                      <TableCell>{complaint.student_profile?.full_name || "N/A"}</TableCell>
                      <TableCell className="capitalize">{complaint.category}</TableCell>
                      <TableCell>
                        <StatusBadge status={complaint.status as any} />
                      </TableCell>
                      <TableCell>
                        <Select
                          value={complaint.assigned_to || ""}
                          onValueChange={(value) => handleAssignStaff(complaint.id, value)}
                        >
                          <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Assign staff" />
                          </SelectTrigger>
                          <SelectContent>
                            {staff.map((member) => (
                              <SelectItem key={member.user_id} value={member.user_id}>
                                {member.profile?.full_name || "N/A"}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => navigate(`/complaint/${complaint.id}`)}
                        >
                          View Details
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
