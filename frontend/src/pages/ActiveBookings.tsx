
import { useState, useEffect } from "react";
=======
import { useState, useEffect, useCallback } from "react";

import { useNavigate } from "react-router-dom";
import { TopBar } from "@/components/TopBar";
import { BottomNavigation } from "@/components/BottomNavigation";
import { Wrench, User, Car, MapPin, Calendar, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import axios from "axios";

=======
import { toast } from "sonner";


interface ActiveBooking {
  _id: string;
  customer: {
    name: string;
    phone: string;
  };
  car: {
    make: string;
    model: string;
    year: number;
    licensePlate: string;
  };
  serviceLocation: {
    address: string;
  };
  createdAt: string;
  scheduledAt: string;
  status: "pending" | "accepted" | "in-progress" | "completed" | "cancelled";
}


export default function ActiveBookings() {
  const navigate = useNavigate();
  const [activeBookings, setActiveBookings] = useState<ActiveBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchActiveBookings = async () => {
      const garageId = localStorage.getItem("garage_id");
      if (!garageId) {
        navigate("/auth");
        return;
      }

      try {
        setLoading(true);
        // Fetch bookings with status in (accepted, in-progress, pending)
        const response = await axios.get(`http://localhost:5001/api/orders/garage/${garageId}?status=accepted`);
        const pendingResponse = await axios.get(`http://localhost:5001/api/orders/garage/${garageId}?status=pending`);
        const inProgressResponse = await axios.get(`http://localhost:5001/api/orders/garage/${garageId}?status=in-progress`);
        
        let allActiveBookings: ActiveBooking[] = [];
        if (response.data.orders) allActiveBookings = [...allActiveBookings, ...response.data.orders];
        if (pendingResponse.data.orders) allActiveBookings = [...allActiveBookings, ...pendingResponse.data.orders];
        if (inProgressResponse.data.orders) allActiveBookings = [...allActiveBookings, ...inProgressResponse.data.orders];
        
        // Sort by createdAt in descending order
        allActiveBookings.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        
        setActiveBookings(allActiveBookings);
        setError(null);
      } catch (err: any) {
        console.error("Error fetching active bookings:", err);
        setError("Failed to load active bookings. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchActiveBookings();
  }, [navigate]);
=======
interface BackendGarage {
  _id: string;
  name: string;
}

interface BackendOrder {
  _id: string;
  status: string;
  customer?: {
    name?: string;
    phone?: string;
  };
  car?: {
    make?: string;
    model?: string;
  };
  scheduledAt?: string | Date;
  serviceLocation?: {
    address?: string;
  };
}

export default function ActiveBookings() {
  const navigate = useNavigate();
  const [activeBookings, setActiveBookings] = useState<ActiveBooking[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const garageId = localStorage.getItem("garage_id");

  const fetchActiveBookings = useCallback(async () => {
    let currentGarageId = garageId;
    
    // Fallback for development/testing if no garage_id in localStorage
    if (!currentGarageId) {
      console.log("No garage_id found in localStorage, attempting to fetch a fallback garage");
      try {
        // Try HSR Layout first (Haha Garage)
        const hsrRes = await axios.get("http://localhost:5001/api/garages/nearbygarages?lng=77.6387&lat=12.9141");
        let fallback = hsrRes.data.find((g: BackendGarage) => g.name.includes("Haha"));
        
        // If not found, try Koramangala (Vedakshari)
        if (!fallback) {
          const koramangalaRes = await axios.get("http://localhost:5001/api/garages/nearbygarages?lng=77.6245&lat=12.9345");
          fallback = koramangalaRes.data.find((g: BackendGarage) => g.name.includes("Vedakshari"));
        }

        if (fallback) {
          currentGarageId = fallback._id;
          localStorage.setItem("garage_id", currentGarageId || "");
          localStorage.setItem("mechanic_verified", "true");
          console.log(`Using fallback garage: ${fallback.name} (${currentGarageId})`);
        }
      } catch (e) {
        console.error("Failed to fetch fallback garage:", e);
      }
    }

    if (!currentGarageId) {
      toast.error("Garage ID not found");
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      console.log(`Fetching active bookings for garage ID: ${currentGarageId}`);
      const response = await axios.get(`http://localhost:5001/api/orders/garage/${currentGarageId}`);
      console.log("Active Bookings Response:", response.data);
      const orders: BackendOrder[] = response.data.orders || response.data; // Handle different response formats
      
      const mappedBookings: ActiveBooking[] = orders
        .filter((order: BackendOrder) => ["accepted", "in-progress"].includes(order.status))
        .map((order: BackendOrder) => ({
          id: order._id,
          customerName: order.customer?.name || "Customer",
          vehicleDetails: order.car ? `${order.car.make} ${order.car.model}` : "Vehicle Info",
          bookedOn: order.scheduledAt ? new Date(order.scheduledAt).toLocaleString() : "Today",
          bookedBy: "App Booking",
          location: order.serviceLocation?.address || "Location N/A",
          status: order.status === "in-progress" ? "in-progress" : "scheduled",
          phone: order.customer?.phone || "N/A",
        }));
      setActiveBookings(mappedBookings);
    } catch (error) {
      console.error("Error fetching active bookings:", error);
      toast.error("Failed to fetch active bookings");
    } finally {
      setIsLoading(false);
    }
  }, [garageId]);

  useEffect(() => {
    fetchActiveBookings();
  }, [fetchActiveBookings]);


  const handleBookingClick = (id: string) => {
    navigate(`/booking/${id}`);
  };

  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
        </div>
      );
    }

    if (error) {
      return (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="w-16 h-16 bg-secondary rounded-full flex items-center justify-center mb-4">
            <Wrench className="w-8 h-8 text-muted-foreground" />
          </div>
          <h3 className="font-heading font-semibold text-lg text-foreground mb-2">
            Failed to Load Bookings
          </h3>
          <p className="text-sm text-muted-foreground max-w-[200px]">
            {error}
          </p>
          <button 
            onClick={() => window.location.reload()}
            className="mt-4 text-primary text-sm font-medium"
          >
            Try Again
          </button>
        </div>
      );
    }

    if (activeBookings.length > 0) {
      return (
        <div className="space-y-4">
          {activeBookings.map((booking) => (
            <div
              key={booking._id}
              onClick={() => handleBookingClick(booking._id)}
              className="bg-card rounded-2xl p-4 card-shadow border border-border/50 cursor-pointer hover:border-primary/30 transition-all duration-200 animate-fade-in"
            >
              {/* Status Badge */}
              <div className="mb-3">
                <span
                  className={cn(
                    "px-3 py-1 text-xs font-semibold rounded-full",
                    booking.status === "in-progress"
                      ? "bg-warning/10 text-warning"
                      : booking.status === "pending"
                      ? "bg-muted/10 text-muted"
                      : "bg-primary/10 text-primary"
                  )}
                >
                  {booking.status.charAt(0).toUpperCase() + booking.status.slice(1).replace('-', ' ')}
                </span>
              </div>

              {/* Customer & Vehicle */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <User className="w-4 h-4 text-muted-foreground" />
                    <span className="font-heading font-semibold text-foreground">
                      {booking.customer?.name || "Unknown Customer"}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Car className="w-4 h-4" />
                    <span className="text-sm">
                      {booking.car?.make || "Unknown"} {booking.car?.model || "Vehicle"} {booking.car?.year || ""}
                      {booking.car?.licensePlate ? ` - ${booking.car.licensePlate}` : ""}
                    </span>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-muted-foreground" />
              </div>

              {/* Details */}
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Calendar className="w-4 h-4 text-primary" />
                  <span>
                    <span className="text-foreground font-medium">Booked on:</span>{
                      " "
                    }
                    {new Date(booking.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <MapPin className="w-4 h-4 text-primary" />
                  <span className="truncate">
                    {booking.serviceLocation?.address || "Unknown Location"}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      );
    }

    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="w-16 h-16 bg-secondary rounded-full flex items-center justify-center mb-4">
          <Wrench className="w-8 h-8 text-muted-foreground" />
        </div>
        <h3 className="font-heading font-semibold text-lg text-foreground mb-2">
          No Active Bookings
        </h3>
        <p className="text-sm text-muted-foreground max-w-[200px]">
          Accepted bookings will appear here for you to manage
        </p>
      </div>
    );
  };

  return (
    <div className="mobile-container pb-24">
      <TopBar />

      <div className="page-padding">
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <h1 className="font-heading font-bold text-xl text-foreground">
            Active Bookings
          </h1>
          <span className="px-3 py-1 bg-success/10 text-success text-sm font-semibold rounded-full">
            {activeBookings.length} active
          </span>
        </div>

        {renderContent()}
=======
        {/* Bookings List */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-16">
            <Loader2 className="w-8 h-8 text-primary animate-spin mb-2" />
            <p className="text-sm text-muted-foreground">Loading active bookings...</p>
          </div>
        ) : activeBookings.length > 0 ? (
          <div className="space-y-4">
            {activeBookings.map((booking) => (
              <div
                key={booking.id}
                onClick={() => handleBookingClick(booking.id)}
                className="bg-card rounded-2xl p-4 card-shadow border border-border/50 cursor-pointer hover:border-primary/30 transition-all duration-200 animate-fade-in"
              >
                {/* Status Badge */}
                <div className="mb-3">
                  <span
                    className={cn(
                      "px-3 py-1 text-xs font-semibold rounded-full",
                      booking.status === "in-progress"
                        ? "bg-warning/10 text-warning"
                        : "bg-primary/10 text-primary"
                    )}
                  >
                    {booking.status === "in-progress" ? "In Progress" : "Scheduled"}
                  </span>
                </div>

                {/* Customer & Vehicle */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <User className="w-4 h-4 text-muted-foreground" />
                      <span className="font-heading font-semibold text-foreground">
                        {booking.customerName}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Car className="w-4 h-4" />
                      <span className="text-sm">{booking.vehicleDetails}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-2 pt-3 border-t border-border/50">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="w-4 h-4 text-primary" />
                    <span>{booking.bookedOn}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <MapPin className="w-4 h-4 text-primary" />
                    <span className="truncate text-xs">{booking.location}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-16 h-16 bg-secondary rounded-full flex items-center justify-center mb-4">
              <Wrench className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="font-heading font-semibold text-lg text-foreground mb-2">
              No Active Bookings
            </h3>
            <p className="text-sm text-muted-foreground max-w-[200px]">
              Accepted bookings will appear here for you to manage
            </p>
          </div>
        )}

      </div>

      <BottomNavigation />
    </div>
  );
}
