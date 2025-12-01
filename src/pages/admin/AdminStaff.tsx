import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { AdminSidebar } from "@/components/AdminSidebar";
import { CheckCircle, XCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface StaffMember {
  id: string;
  full_name: string;
  email: string;
  phone_number: string | null;
  approval_status: string | null;
  assigned_complaints?: number;
  category?: string;
  specialization?: string;
}

export default function AdminStaff() {
  const { toast } = useToast();
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStaff();
  }, []);

  const fetchStaff = async () => {
    try {
      const { data: staffRoles, error: rolesError } = await supabase
        .from("user_roles")
        .select("user_id")
        .eq("role", "staff");

      if (rolesError) throw rolesError;

      if (staffRoles && staffRoles.length > 0) {
        const staffIds = staffRoles.map(r => r.user_id);

        const { data: profiles, error: profilesError } = await supabase
          .from("profiles")
          .select("*")
          .in("id", staffIds)
          .order("created_at", { ascending: false });

        if (profilesError) throw profilesError;

        const staffWithCounts = await Promise.all(
          (profiles || []).map(async (profile) => {
            const { count } = await supabase
              .from("complaints")
              .select("*", { count: "exact", head: true })
              .eq("assigned_to", profile.id);

            return {
              ...profile,
              assigned_complaints: count || 0,
            };
          })
        );

        setStaff(staffWithCounts);
      }
    } catch (error) {
      console.error("Error fetching staff:", error);
      toast({
        title: "Error",
        description: "Failed to load staff members",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleApproveStaff = async (userId: string) => {
    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          approval_status: "approved",
        })
        .eq("id", userId);

      if (error) throw error;

      // Create notification for the staff member
      await supabase.from("notifications").insert({
        user_id: userId,
        title: "Account Approved",
        message: "Your staff account has been approved by admin. You can now login.",
        type: "approval",
      });

      toast({
        title: "Success",
        description: "Staff member approved successfully",
      });

      fetchStaff();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to approve staff member",
        variant: "destructive",
      });
    }
  };

  const handleRejectStaff = async (userId: string) => {
    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          approval_status: "rejected",
        })
        .eq("id", userId);

      if (error) throw error;

      // Create notification for the staff member
      await supabase.from("notifications").insert({
        user_id: userId,
        title: "Account Rejected",
        message: "Your staff account registration has been rejected by admin.",
        type: "rejection",
      });

      toast({
        title: "Success",
        description: "Staff member rejected successfully",
      });

      fetchStaff();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to reject staff member",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-background flex">
      <AdminSidebar />
      <div className="flex-1 p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Staff Management</h1>
          <p className="text-muted-foreground">Manage staff members and their assignments</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Staff Members</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-center text-muted-foreground py-8">Loading...</p>
            ) : staff.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">No staff members found</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Assigned Complaints</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {staff.map((member) => (
                    <TableRow key={member.id}>
                      <TableCell>{member.full_name}</TableCell>
                      <TableCell>{member.email}</TableCell>
                      <TableCell>{member.phone_number}</TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div>{member.category || "N/A"}</div>
                          {member.specialization && (
                            <div className="text-muted-foreground text-xs">{member.specialization}</div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            member.approval_status === "approved"
                              ? "default"
                              : member.approval_status === "pending"
                              ? "secondary"
                              : "destructive"
                          }
                        >
                          {member.approval_status}
                        </Badge>
                      </TableCell>
                      <TableCell>{member.assigned_complaints || 0}</TableCell>
                      <TableCell>
                        {member.approval_status === "pending" && (
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="default"
                              onClick={() => handleApproveStaff(member.id)}
                            >
                              <CheckCircle className="mr-2 h-4 w-4" />
                              Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleRejectStaff(member.id)}
                            >
                              <XCircle className="mr-2 h-4 w-4" />
                              Reject
                            </Button>
                          </div>
                        )}
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
