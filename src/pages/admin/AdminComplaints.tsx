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
    try {
      // Fetch complaints with student profile data
      const { data: complaintsData, error: complaintsError } = await supabase
        .from("complaints")
        .select("*")
        .order("created_at", { ascending: false });

      if (complaintsError) {
        console.error("Error fetching complaints:", complaintsError);
        setLoading(false);
        return;
      }

      // Fetch student profiles for the complaints
      if (complaintsData && complaintsData.length > 0) {
        const studentIds = [...new Set(complaintsData.map(c => c.student_id))];
        const { data: profilesData } = await supabase
          .from("profiles")
          .select("id, full_name")
          .in("id", studentIds);

        // Merge profile data with complaints
        const complaintsWithProfiles = complaintsData.map(complaint => ({
          ...complaint,
          student_profile: profilesData?.find(p => p.id === complaint.student_id),
        }));

        setComplaints(complaintsWithProfiles as any);
      }

      // Fetch staff members (only approved staff)
      const { data: staffRoles } = await supabase
        .from("user_roles")
        .select("user_id")
        .eq("role", "staff");

      if (staffRoles && staffRoles.length > 0) {
        const staffIds = staffRoles.map(s => s.user_id);
        const { data: staffProfiles } = await supabase
          .from("profiles")
          .select("id, full_name")
          .in("id", staffIds)
          .eq("approval_status", "approved");

        const staffWithProfiles = staffRoles
          .map(role => ({
            user_id: role.user_id,
            profile: staffProfiles?.find(p => p.id === role.user_id),
          }))
          .filter(staff => staff.profile !== undefined);

        setStaff(staffWithProfiles as any);
      }
    } catch (error) {
      console.error("Error in fetchData:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAssignStaff = async (complaintId: string, staffId: string) => {
    // Get complaint details for notification
    const complaint = complaints.find(c => c.id === complaintId);
    const staffMember = staff.find(s => s.user_id === staffId);
    
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
      if (complaint && staffMember) {
        // Create notification for the assigned staff member
        await supabase.from("notifications").insert({
          user_id: staffId,
          title: "New Complaint Assigned",
          message: `You have been assigned to complaint: "${complaint.title}"`,
          type: "complaint_assigned",
        });

        // Create notification for all admins about the assignment
        const { data: adminRoles } = await supabase
          .from("user_roles")
          .select("user_id")
          .eq("role", "admin");

        if (adminRoles && adminRoles.length > 0) {
          const adminNotifications = adminRoles.map(admin => ({
            user_id: admin.user_id,
            title: "Complaint Assigned",
            message: `Complaint "${complaint.title}" has been assigned to ${staffMember.profile?.full_name || "staff member"}.`,
            type: "complaint_assigned",
          }));

          await supabase.from("notifications").insert(adminNotifications);
        }
      }

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
