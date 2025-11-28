import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { FileText, Users, TrendingUp, Shield } from "lucide-react";

export default function Landing() {
  const navigate = useNavigate();

  const features = [
    {
      icon: FileText,
      title: "Easy Complaint Submission",
      description: "Submit and track complaints with a simple, intuitive interface",
    },
    {
      icon: Users,
      title: "Role-Based Access",
      description: "Dedicated dashboards for students, staff, and administrators",
    },
    {
      icon: TrendingUp,
      title: "Real-Time Tracking",
      description: "Monitor complaint status and receive instant updates",
    },
    {
      icon: Shield,
      title: "Secure & Reliable",
      description: "Your data is protected with enterprise-grade security",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <h1 className="text-3xl font-bold text-primary">BroDesk</h1>
          <div className="flex gap-3">
            <Button variant="ghost" onClick={() => navigate("/auth?mode=login")}>
              Sign In
            </Button>
            <Button onClick={() => navigate("/auth?mode=signup")}>
              Sign Up
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-6 py-20 text-center">
        <h2 className="text-5xl font-bold text-foreground mb-6">
          Welcome to BroDesk
        </h2>
        <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
          A comprehensive complaint management system designed to streamline
          communication and improve institutional efficiency
        </p>
        <Button size="lg" onClick={() => navigate("/auth?mode=signup")}>
          Get Started
        </Button>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-6 py-16">
        <h3 className="text-3xl font-bold text-center text-foreground mb-12">
          Key Features
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <Card key={index}>
              <CardContent className="pt-6">
                <feature.icon className="h-12 w-12 text-primary mb-4" />
                <h4 className="text-xl font-semibold mb-2">{feature.title}</h4>
                <p className="text-muted-foreground">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border mt-20">
        <div className="container mx-auto px-6 py-6 text-center text-muted-foreground">
          <p>&copy; 2025 BroDesk. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
