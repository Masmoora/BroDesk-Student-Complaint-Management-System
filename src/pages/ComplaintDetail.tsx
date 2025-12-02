import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { StatusBadge } from "@/components/StatusBadge";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Send } from "lucide-react";

type Complaint = {
  id: string;
  title: string;
  description: string;
  category: string;
  status: "pending" | "in_progress" | "resolved";
  created_at: string;
  student_id: string;
  assigned_to: string | null;
  student_profile: {
    full_name: string;
    email: string;
  } | null;
};

type Comment = {
  id: string;
  message: string;
  created_at: string;
  user_profile: {
    full_name: string;
  } | null;
};

export default function ComplaintDetail() {
  const { id } = useParams();
  const { user, userRole } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [complaint, setComplaint] = useState<Complaint | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchComplaintDetails();
    fetchComments();
  }, [id]);

  const fetchComplaintDetails = async () => {
    try {
      const { data, error } = await supabase
        .from("complaints")
        .select("*")
        .eq("id", id)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("full_name, email")
          .eq("id", data.student_id)
          .single();

        setComplaint({
          ...data,
          student_profile: profile
        } as any);
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
      navigate("/");
    } finally {
      setLoading(false);
    }
  };

  const fetchComments = async () => {
    try {
      const { data, error } = await supabase
        .from("comments")
        .select("*")
        .eq("complaint_id", id)
        .order("created_at", { ascending: true });

      if (error) throw error;

      if (data && data.length > 0) {
        const userIds = data.map(c => c.user_id);
        const { data: profiles } = await supabase
          .from("profiles")
          .select("id, full_name")
          .in("id", userIds);

        const profileMap = new Map(profiles?.map(p => [p.id, p]) || []);
        const commentsWithProfiles = data.map(c => ({
          ...c,
          user_profile: profileMap.get(c.user_id) || null
        })) as any;

        setComments(commentsWithProfiles);
      } else {
        setComments([]);
      }
    } catch (error: any) {
      console.error("Error fetching comments:", error);
    }
  };

  const handleStatusUpdate = async (newStatus: "pending" | "in_progress" | "resolved") => {
    try {
      const { error } = await supabase
        .from("complaints")
        .update({ status: newStatus })
        .eq("id", id);

      if (error) throw error;

      // Create notification for the student
      if (complaint?.student_id) {
        let notificationMessage = '';
        let notificationType: 'complaint_updated' | 'complaint_resolved' = 'complaint_updated';
        
        if (newStatus === 'resolved') {
          notificationMessage = `Your complaint "${complaint.title}" has been resolved.`;
          notificationType = 'complaint_resolved';
        } else if (newStatus === 'in_progress') {
          notificationMessage = `Your complaint "${complaint.title}" is now being processed.`;
        } else {
          notificationMessage = `Your complaint "${complaint.title}" status has been updated to ${newStatus}.`;
        }

        await supabase.from("notifications").insert({
          user_id: complaint.student_id,
          title: "Complaint Status Updated",
          message: notificationMessage,
          type: notificationType,
        });
      }

      // Create notification for all admins
      const { data: adminRoles } = await supabase
        .from("user_roles")
        .select("user_id")
        .eq("role", "admin");

      if (adminRoles && adminRoles.length > 0) {
        const adminNotifications = adminRoles.map(admin => ({
          user_id: admin.user_id,
          title: "Complaint Status Updated",
          message: `Complaint "${complaint?.title}" status changed to ${newStatus}.`,
          type: "complaint_updated",
        }));

        await supabase.from("notifications").insert(adminNotifications);
      }

      toast({
        title: "Success",
        description: "Status updated successfully",
      });

      fetchComplaintDetails();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleAddComment = async () => {
    if (!newComment.trim()) return;

    setSubmitting(true);
    try {
      const { error } = await supabase.from("comments").insert({
        complaint_id: id,
        user_id: user!.id,
        message: newComment.trim(),
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Comment added successfully",
      });

      setNewComment("");
      fetchComments();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const canUpdateStatus = userRole === "staff" || userRole === "admin";

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="container mx-auto px-4 py-8">
          <p className="text-center text-muted-foreground">Loading...</p>
        </main>
      </div>
    );
  }

  if (!complaint) return null;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <Button
          variant="ghost"
          onClick={() => {
            if (userRole === "admin") navigate("/admin/complaints");
            else if (userRole === "staff") navigate("/staff/complaints");
            else navigate("/student/complaints");
          }}
          className="mb-6"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Dashboard
        </Button>

        <Card className="mb-6">
          <CardHeader>
            <div className="flex justify-between items-start gap-4">
              <div className="flex-1">
                <CardTitle className="text-2xl">{complaint.title}</CardTitle>
                <CardDescription className="mt-2">
                  Submitted by {complaint.student_profile?.full_name || "Unknown"} ({complaint.student_profile?.email || "N/A"}) •{" "}
                  {new Date(complaint.created_at).toLocaleString()} • {complaint.category}
                </CardDescription>
              </div>
              <StatusBadge status={complaint.status} />
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">Description</h3>
                <p className="text-muted-foreground whitespace-pre-wrap">{complaint.description}</p>
              </div>

              {canUpdateStatus && (
                <div className="pt-4 border-t">
                  <h3 className="font-semibold mb-2">Update Status</h3>
                  <Select
                    value={complaint.status}
                    onValueChange={handleStatusUpdate}
                  >
                    <SelectTrigger className="w-[200px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="in_progress">In Progress</SelectItem>
                      <SelectItem value="resolved">Resolved</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Comments & Updates</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {comments.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No comments yet. Be the first to add one!
                </p>
              ) : (
                <div className="space-y-4">
                  {comments.map((comment) => (
                    <div key={comment.id} className="border-l-2 border-primary/20 pl-4">
                      <div className="flex justify-between items-start mb-1">
                        <span className="font-semibold text-sm">{comment.user_profile?.full_name || "Unknown"}</span>
                        <span className="text-xs text-muted-foreground">
                          {new Date(comment.created_at).toLocaleString()}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                        {comment.message}
                      </p>
                    </div>
                  ))}
                </div>
              )}

              <div className="pt-4 border-t">
                <Textarea
                  placeholder="Add a comment or update..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  rows={3}
                  className="mb-2"
                />
                <Button onClick={handleAddComment} disabled={submitting || !newComment.trim()}>
                  <Send className="mr-2 h-4 w-4" />
                  {submitting ? "Sending..." : "Add Comment"}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
