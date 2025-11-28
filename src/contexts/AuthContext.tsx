import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

type UserRole = "student" | "staff" | "admin";

interface AuthContextType {
  user: User | null;
  session: Session | null;
  userRole: UserRole | null;
  loading: boolean;
  signUp: (email: string, password: string, fullName: string, role: "student" | "staff", phoneNumber: string) => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);

        // Fetch user role when session changes
        if (session?.user) {
          setTimeout(() => {
            fetchUserRole(session.user.id);
          }, 0);
        } else {
          setUserRole(null);
        }
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);

      if (session?.user) {
        fetchUserRole(session.user.id).finally(() => {
          setLoading(false);
          // Redirect to appropriate dashboard after role is loaded
          if (window.location.pathname === "/auth") {
            fetchUserRole(session.user.id);
          }
        });
      } else {
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchUserRole = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", userId)
        .single();

      if (error) throw error;
      setUserRole(data.role as UserRole);

      // Navigate to appropriate dashboard after role is set
      if (window.location.pathname === "/auth" || window.location.pathname === "/") {
        const role = data.role as UserRole;
        if (role === "admin") {
          navigate("/admin/dashboard");
        } else if (role === "staff") {
          navigate("/staff/home");
        } else if (role === "student") {
          navigate("/student/home");
        }
      }
    } catch (error) {
      console.error("Error fetching user role:", error);
    }
  };

  const signUp = async (email: string, password: string, fullName: string, role: "student" | "staff" = "student", phoneNumber: string) => {
    try {
      // Validate inputs
      if (!email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
        return { error: { message: "Invalid email format" } };
      }
      if (!phoneNumber.match(/^\d{10}$/)) {
        return { error: { message: "Phone number must be exactly 10 digits" } };
      }
      if (password.length < 6) {
        return { error: { message: "Password must be at least 6 characters" } };
      }

      const redirectUrl = `${window.location.origin}/`;

      const {
        data: { user },
        error,
      } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            full_name: fullName,
          },
        },
      });

      if (error) {
        return { error };
      }

      // Create profile and role with approval status as pending
      if (user) {
        const { error: profileError } = await supabase
          .from("profiles")
          .insert({
            id: user.id,
            email: user.email!,
            full_name: fullName,
            phone_number: phoneNumber,
            approval_status: 'pending',
          });

        if (profileError) {
          console.error("Error creating profile:", profileError);
          return { error: profileError };
        }

        // Insert user role
        const { error: roleError } = await supabase
          .from("user_roles")
          .insert({
            user_id: user.id,
            role: role,
          });

        if (roleError) {
          console.error("Error creating user role:", roleError);
          return { error: roleError };
        }

        // Sign out immediately after signup to prevent auto-login
        await supabase.auth.signOut();
      }

      return { error: null };
    } catch (error: any) {
      return { error };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        return { error };
      }

      // Check approval status
      if (data.user) {
        const { data: profileData, error: profileError } = await supabase
          .from("profiles")
          .select("approval_status")
          .eq("id", data.user.id)
          .single();

        if (profileError) {
          return { error: profileError };
        }

        if (profileData.approval_status === 'pending') {
          await supabase.auth.signOut();
          return { error: { message: "Your account is pending approval by admin. Please wait for approval." } };
        }

        if (profileData.approval_status === 'rejected') {
          await supabase.auth.signOut();
          return { error: { message: "Your account has been rejected by admin." } };
        }
      }

      return { error: null };
    } catch (error: any) {
      return { error };
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    navigate("/auth");
  };

  return (
    <AuthContext.Provider value={{ user, session, userRole, loading, signUp, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
