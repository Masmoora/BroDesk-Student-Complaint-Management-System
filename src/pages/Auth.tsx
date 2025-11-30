import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft } from "lucide-react";

export default function Auth() {
  const [searchParams] = useSearchParams();
  const initialMode = searchParams.get("mode") === "signup" ? "signup" : "login";
  const [mode, setMode] = useState<"login" | "signup">(initialMode);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { signIn, signUp } = useAuth();
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    role: "student" as "student" | "staff",
    // Student fields
    batchType: "",
    batchNumber: "",
    course: "",
    studentId: "",
    // Staff fields
    category: "",
    specialization: "",
  });

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const validateForm = () => {
    if (mode === "signup") {
      if (!formData.name.trim()) {
        toast({
          title: "Validation Error",
          description: "Name is required",
          variant: "destructive",
        });
        return false;
      }
      if (!formData.phone.match(/^\d{10}$/)) {
        toast({
          title: "Validation Error",
          description: "Phone must be exactly 10 digits",
          variant: "destructive",
        });
        return false;
      }
      if (formData.password !== formData.confirmPassword) {
        toast({
          title: "Validation Error",
          description: "Passwords do not match",
          variant: "destructive",
        });
        return false;
      }
      
      // Student-specific validation
      if (formData.role === "student") {
        if (!formData.batchType) {
          toast({
            title: "Validation Error",
            description: "Batch type is required for students",
            variant: "destructive",
          });
          return false;
        }
        if (!formData.batchNumber.trim()) {
          toast({
            title: "Validation Error",
            description: "Batch number is required for students",
            variant: "destructive",
          });
          return false;
        }
        if (!formData.course.trim()) {
          toast({
            title: "Validation Error",
            description: "Course is required for students",
            variant: "destructive",
          });
          return false;
        }
      }
      
      // Staff-specific validation
      if (formData.role === "staff") {
        if (!formData.category.trim()) {
          toast({
            title: "Validation Error",
            description: "Category is required for staff",
            variant: "destructive",
          });
          return false;
        }
      }
    }

    if (!formData.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      toast({
        title: "Validation Error",
        description: "Please enter a valid email address",
        variant: "destructive",
      });
      return false;
    }

    if (formData.password.length < 6) {
      toast({
        title: "Validation Error",
        description: "Password must be at least 6 characters",
        variant: "destructive",
      });
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      if (mode === "login") {
        const { error } = await signIn(formData.email, formData.password);
        if (error) {
          toast({
            title: "Login Failed",
            description: error.message,
            variant: "destructive",
          });
        }
      } else {
        const { error } = await signUp(
          formData.email,
          formData.password,
          formData.name,
          formData.role,
          formData.phone,
          {
            batchType: formData.batchType,
            batchNumber: formData.batchNumber,
            course: formData.course,
            studentId: formData.studentId,
            category: formData.category,
            specialization: formData.specialization,
          }
        );
        if (error) {
          toast({
            title: "Signup Failed",
            description: error.message,
            variant: "destructive",
          });
        } else {
          toast({
            title: "Registration Successful",
            description: "Account created successfully. Pending admin approval.",
          });
          setFormData({
            name: "",
            email: "",
            phone: "",
            password: "",
            confirmPassword: "",
            role: "student",
            batchType: "",
            batchNumber: "",
            course: "",
            studentId: "",
            category: "",
            specialization: "",
          });
          setMode("login");
        }
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Something went wrong",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-secondary/10 flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <Button
          variant="ghost"
          className="mb-4"
          onClick={() => navigate("/")}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Home
        </Button>

        <Card>
          <CardHeader className="text-center">
            <h1 className="text-4xl font-bold text-primary mb-2">BroDesk</h1>
            <CardTitle>{mode === "login" ? "Welcome Back" : "Create Account"}</CardTitle>
            <CardDescription>
              {mode === "login"
                ? "Enter your credentials to access your account"
                : "Fill in your details to register"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {mode === "signup" && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => handleChange("name", e.target.value)}
                      placeholder="Enter your full name"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">Mobile Number</Label>
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={(e) => handleChange("phone", e.target.value)}
                      placeholder="10 digit mobile number"
                      required
                    />
                  </div>
                </>
              )}

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleChange("email", e.target.value)}
                  placeholder="Enter your email"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => handleChange("password", e.target.value)}
                  placeholder="Enter your password"
                  required
                />
              </div>

              {mode === "signup" && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirm Password</Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      value={formData.confirmPassword}
                      onChange={(e) => handleChange("confirmPassword", e.target.value)}
                      placeholder="Confirm your password"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Select Role</Label>
                    <RadioGroup
                      value={formData.role}
                      onValueChange={(value) => handleChange("role", value)}
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="student" id="student" />
                        <Label htmlFor="student" className="font-normal cursor-pointer">
                          Student
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="staff" id="staff" />
                        <Label htmlFor="staff" className="font-normal cursor-pointer">
                          Staff
                        </Label>
                      </div>
                    </RadioGroup>
                  </div>

                  {/* Student-specific fields */}
                  {formData.role === "student" && (
                    <>
                      <div className="space-y-2">
                        <Label>Batch Type</Label>
                        <RadioGroup
                          value={formData.batchType}
                          onValueChange={(value) => handleChange("batchType", value)}
                        >
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="Remote" id="remote" />
                            <Label htmlFor="remote" className="font-normal cursor-pointer">
                              Remote
                            </Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="Offline" id="offline" />
                            <Label htmlFor="offline" className="font-normal cursor-pointer">
                              Offline
                            </Label>
                          </div>
                        </RadioGroup>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="batchNumber">Batch Number</Label>
                        <Input
                          id="batchNumber"
                          value={formData.batchNumber}
                          onChange={(e) => handleChange("batchNumber", e.target.value)}
                          placeholder="Enter batch number"
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="course">Course</Label>
                        <Input
                          id="course"
                          value={formData.course}
                          onChange={(e) => handleChange("course", e.target.value)}
                          placeholder="Enter your course"
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="studentId">Student ID (Optional)</Label>
                        <Input
                          id="studentId"
                          value={formData.studentId}
                          onChange={(e) => handleChange("studentId", e.target.value)}
                          placeholder="Enter student ID"
                        />
                      </div>
                    </>
                  )}

                  {/* Staff-specific fields */}
                  {formData.role === "staff" && (
                    <>
                      <div className="space-y-2">
                        <Label htmlFor="category">Category</Label>
                        <Input
                          id="category"
                          value={formData.category}
                          onChange={(e) => handleChange("category", e.target.value)}
                          placeholder="Enter your category/department"
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="specialization">Specialization (Optional)</Label>
                        <Input
                          id="specialization"
                          value={formData.specialization}
                          onChange={(e) => handleChange("specialization", e.target.value)}
                          placeholder="Enter your specialization"
                        />
                      </div>
                    </>
                  )}
                </>
              )}

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading
                  ? "Please wait..."
                  : mode === "login"
                  ? "Sign In"
                  : "Sign Up"}
              </Button>
            </form>

            <div className="mt-4 text-center text-sm">
              {mode === "login" ? (
                <p>
                  Don't have an account?{" "}
                  <button
                    type="button"
                    onClick={() => setMode("signup")}
                    className="text-primary hover:underline"
                  >
                    Sign up
                  </button>
                </p>
              ) : (
                <p>
                  Already have an account?{" "}
                  <button
                    type="button"
                    onClick={() => setMode("login")}
                    className="text-primary hover:underline"
                  >
                    Sign in
                  </button>
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
