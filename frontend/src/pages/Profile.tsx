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
import { useToast } from "@/components/ui/use-toast";
import axios from "axios";

export default function Profile() {
  const navigate = useNavigate();
  const [garage, setGarage] = useState<any>(null);
  const [isEmergencyCalling, setIsEmergencyCalling] = useState(false);
  const [completedBookingsCount, setCompletedBookingsCount] = useState<number>(0);
  const [earnings, setEarnings] = useState<number>(0);
  const { toast } = useToast();

  // Menu items with dynamic completed bookings count
  const menuItems = [
    {
      icon: User,
      label: "Garage Information",
      path: "/profile/personal",
    },
    {
      icon: FileText,
      label: "Completed Bookings",
      path: "/completed",
      badge: completedBookingsCount.toString(),
    },
    {
      icon: HelpCircle,
      label: "Help & Support",
      path: "/support",
    },
  ];

  useEffect(() => {
    const fetchGarage = async () => {
      const garageId = localStorage.getItem("garage_id");
      if (!garageId) {
        navigate("/auth");
        return;
      }

      try {
        const response = await axios.get(`http://localhost:5001/api/garages/${garageId}`);
        if (response.data.success) {
          setGarage(response.data.data);
        }
      } catch (error) {
        console.error("Error fetching garage data:", error);
        // If garage not found, clear invalid garage_id and redirect to login
        if (error.response && error.response.status === 404) {
          console.log('Invalid garage_id, clearing localStorage and redirecting to login.');
          localStorage.removeItem('garage_id');
          localStorage.removeItem('mechanic_registered');
          localStorage.removeItem('mechanic_verified');
          navigate("/auth");
        }
      }
    };

    const fetchCompletedBookingsCount = async () => {
      const garageId = localStorage.getItem("garage_id");
      if (!garageId) {
        return;
      }

      try {
        const response = await axios.get(`http://localhost:5001/api/orders/garage/${garageId}?status=completed`);
        
        let count = 0;
        let totalEarnings = 0;
        
        if (response.data.orders && Array.isArray(response.data.orders)) {
          count = response.data.orders.length;
          // Calculate earnings from real data if available
          totalEarnings = response.data.orders.reduce((sum: number, order: any) => {
            return sum + (order.bill?.total || 0);
          }, 0);
        } else if (Array.isArray(response.data)) {
          count = response.data.length;
          // Calculate earnings from direct array response
          totalEarnings = response.data.reduce((sum: number, order: any) => {
            return sum + (order.bill?.total || 0);
          }, 0);
        }
        
        console.log(`Fetched completed bookings count: ${count}, earnings: ₹${totalEarnings}`);
        
        // Use mock data if API returns 0, as requested by user
        if (count === 0) {
          console.log('No real completed bookings found, using mock data');
          count = 12;
          // Calculate mock earnings based on 12 sample bookings
          totalEarnings = 2500 + 1800 + 3200 + 1500 + 2200 + 2800 + 3000 + 3500 + 2100 + 1900 + 3300 + 4000;
        }
        
        setCompletedBookingsCount(count);
        setEarnings(totalEarnings);
      } catch (error) {
        console.error("Error fetching completed bookings count:", error);
        // Use mock data in case of API error
        setCompletedBookingsCount(12);
        setEarnings(2500 + 1800 + 3200 + 1500 + 2200 + 2800 + 3000 + 3500 + 2100 + 1900 + 3300 + 4000);
        console.log('Using mock data due to API error');
      }
    };

    fetchGarage();
    fetchCompletedBookingsCount();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.clear();
    navigate("/");
  };

  const handleEmergencyCall = () => {
    if (!navigator.geolocation) {
      toast({
        title: "Geolocation not supported",
        description: "Your browser does not support geolocation.",
        variant: "destructive",
      });
      return;
    }

    setIsEmergencyCalling(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          const token = localStorage.getItem("token");
          await axios.post(
            "http://localhost:5001/api/emergency/request",
            { latitude, longitude },
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );
          toast({
            title: "Emergency request sent",
            description: "Nearby mechanics have been notified.",
          });
        } catch (error) {
          console.error("Error sending emergency request:", error);
          toast({
            title: "Failed to send emergency request",
            description: "Please try again later.",
            variant: "destructive",
          });
        } finally {
          setIsEmergencyCalling(false);
        }
      },
      (error) => {
        console.error("Geolocation error:", error);
        toast({
          title: "Geolocation error",
          description: "Unable to retrieve your location. Please enable location services.",
          variant: "destructive",
        });
        setIsEmergencyCalling(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

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
              {completedBookingsCount}
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
            <p className="font-heading font-bold text-xl text-success">₹{earnings.toLocaleString()}</p>
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

        {/* Emergency Call Button */}
        <Button
          variant="default"
          size="lg"
          className="w-full mt-4 bg-red-600 hover:bg-red-700 text-white"
          onClick={handleEmergencyCall}
          disabled={isEmergencyCalling}
        >
          {isEmergencyCalling ? "Calling..." : "Emergency Call"}
        </Button>
      </div>



      <BottomNavigation />
    </div>
  );
}
