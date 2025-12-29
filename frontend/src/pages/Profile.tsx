import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  User, 
  BadgeCheck, 
  Wallet, 
  ChevronRight, 
  FileText, 
  HelpCircle, 
  LogOut,
  Settings,
  Star
} from "lucide-react";
import { BottomNavigation } from "@/components/BottomNavigation";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import axios from "axios";

const menuItems = [
  {
    icon: User,
    label: "Personal Information",
    path: "/profile/personal",
  },
  {
    icon: FileText,
    label: "Completed Bookings",
    path: "/completed",
    badge: "12",
  },
  {
    icon: HelpCircle,
    label: "Help & Support",
    path: "/support",
  },
];

export default function Profile() {
  const navigate = useNavigate();
  const [garage, setGarage] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchGarage = async () => {
      const garageId = localStorage.getItem("garage_id");
      if (!garageId) {
        setIsLoading(false);
        return;
      }

      try {
        const response = await axios.get(`http://localhost:5001/api/garages/${garageId}`);
        setGarage(response.data);
      } catch (error) {
        console.error("Error fetching garage data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchGarage();
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    navigate("/");
  };

  if (isLoading) {
    return (
      <div className="mobile-container flex items-center justify-center min-h-screen">
        <p className="text-muted-foreground">Loading profile...</p>
      </div>
    );
  }

  return (
    <div className="mobile-container pb-24">
      {/* Header */}
      <div className="bg-primary px-5 pt-8 pb-12 rounded-b-3xl">
        <div className="flex items-center justify-between mb-6">
          <h1 className="font-heading font-bold text-xl text-primary-foreground">
            Profile
          </h1>
          <button
            onClick={() => navigate("/wallet")}
            className="w-10 h-10 rounded-full bg-primary-foreground/20 flex items-center justify-center"
          >
            <Wallet className="w-5 h-5 text-primary-foreground" />
          </button>
        </div>

        {/* Profile Card */}
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-primary-foreground/20 rounded-full flex items-center justify-center overflow-hidden">
            {garage?.documents?.profilePhoto ? (
              <img 
                src={`http://localhost:5001${garage.documents.profilePhoto}`} 
                alt="Profile" 
                className="w-full h-full object-cover"
              />
            ) : (
              <User className="w-8 h-8 text-primary-foreground" />
            )}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h2 className="font-heading font-bold text-lg text-primary-foreground">
                {garage?.ownerName || "Mechanic"}
              </h2>
              {garage?.isVerified && <BadgeCheck className="w-5 h-5 text-accent" />}
            </div>
            <p className="text-sm text-primary-foreground/80">{garage?.name || "Garage Name"}</p>
            <div className="flex items-center gap-1 mt-1">
              <Star className="w-4 h-4 text-accent fill-accent" />
              <span className="text-sm font-medium text-primary-foreground">
                {garage?.ratingsSummary?.Customer?.average || "0.0"}
              </span>
              <span className="text-sm text-primary-foreground/60">
                ({garage?.ratingsSummary?.Customer?.totalReviews || "0"} reviews)
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="px-5 -mt-6">
        <div className="bg-card rounded-2xl p-4 card-shadow border border-border/50 grid grid-cols-3 gap-4">
          <div className="text-center">
            <p className="font-heading font-bold text-xl text-foreground">
              {garage?.servicesCompleted || "0"}
            </p>
            <p className="text-xs text-muted-foreground">Completed</p>
          </div>
          <div className="text-center border-x border-border">
            <p className="font-heading font-bold text-xl text-foreground">
              {garage?.experience || "0"}
            </p>
            <p className="text-xs text-muted-foreground">Years Exp</p>
          </div>
          <div className="text-center">
            <p className="font-heading font-bold text-xl text-success">₹0</p>
            <p className="text-xs text-muted-foreground">Earnings</p>
          </div>
        </div>
      </div>

      {/* Menu Items */}
      <div className="px-5 mt-6">
        <div className="bg-card rounded-2xl card-shadow border border-border/50 overflow-hidden">
          {menuItems.map((item, index) => (
            <div key={item.path}>
              <button
                onClick={() => navigate(item.path)}
                className="w-full flex items-center gap-4 px-4 py-4 hover:bg-secondary/50 transition-colors"
              >
                <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                  <item.icon className="w-5 h-5 text-primary" />
                </div>
                <span className="flex-1 text-left font-medium text-foreground">
                  {item.label}
                </span>
                {item.badge && (
                  <span className="px-2 py-0.5 bg-primary/10 text-primary text-xs font-semibold rounded-full">
                    {item.badge}
                  </span>
                )}
                <ChevronRight className="w-5 h-5 text-muted-foreground" />
              </button>
              {index < menuItems.length - 1 && <Separator />}
            </div>
          ))}
        </div>

        {/* Logout Button */}
        <Button
          variant="destructive"
          size="lg"
          className="w-full mt-6"
          onClick={handleLogout}
        >
          <LogOut className="w-5 h-5 mr-2" />
          Logout
        </Button>
      </div>

      <BottomNavigation />
    </div>
  );
}
