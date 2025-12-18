import { Clock, CheckCircle2, HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

export default function VerificationPending() {
  const navigate = useNavigate();

  const handleDemoLogin = () => {
    localStorage.setItem("mechanic_verified", "true");
    navigate("/bookings");
  };

  return (
    <div className="mobile-container flex flex-col min-h-screen items-center justify-center page-padding text-center">
      {/* Icon */}
      <div className="w-24 h-24 bg-warning/10 rounded-full flex items-center justify-center mb-6 animate-pulse-subtle">
        <Clock className="w-12 h-12 text-warning" />
      </div>

      {/* Content */}
      <h1 className="font-heading font-bold text-2xl text-foreground mb-3">
        Verification in Progress
      </h1>
      <p className="text-muted-foreground mb-8 max-w-[280px]">
        Your profile is under review. We'll notify you once your account is verified.
      </p>

      {/* Status Card */}
      <div className="w-full bg-card rounded-2xl p-4 card-shadow border border-border/50 mb-8">
        <div className="flex items-center gap-3 mb-3 pb-3 border-b border-border">
          <div className="w-8 h-8 bg-success/10 rounded-full flex items-center justify-center">
            <CheckCircle2 className="w-4 h-4 text-success" />
          </div>
          <span className="text-sm text-foreground">Documents Submitted</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-warning/10 rounded-full flex items-center justify-center">
            <Clock className="w-4 h-4 text-warning" />
          </div>
          <span className="text-sm text-muted-foreground">Under Review (24-48 hrs)</span>
        </div>
      </div>

      {/* Help */}
      <button className="flex items-center gap-2 text-primary text-sm font-medium mb-8">
        <HelpCircle className="w-4 h-4" />
        Need help? Contact support
      </button>

      {/* Demo Button */}
      <Button variant="accent" size="lg" onClick={handleDemoLogin}>
        Demo: Skip Verification
      </Button>
    </div>
  );
}
