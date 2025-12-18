import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const Index = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Check auth status and redirect accordingly
    const isRegistered = localStorage.getItem("mechanic_registered");
    const isVerified = localStorage.getItem("mechanic_verified");

    if (isVerified) {
      navigate("/bookings");
    } else if (isRegistered) {
      navigate("/verification-pending");
    } else {
      navigate("/onboarding");
    }
  }, [navigate]);

  return (
    <div className="mobile-container flex min-h-screen items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-muted-foreground">Loading...</p>
      </div>
    </div>
  );
};

export default Index;
