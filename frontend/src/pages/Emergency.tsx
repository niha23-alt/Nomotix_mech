import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { TopBar } from "@/components/TopBar";
import { BottomNavigation } from "@/components/BottomNavigation";
import { BookingCard, BookingData } from "@/components/BookingCard";
import { toast } from "sonner";
import { AlertTriangle, Loader2 } from "lucide-react";
import axios from "axios";

interface BackendService {
  name: string;
  [key: string]: unknown;
}

interface BackendGarage {
  _id: string;
  name: string;
}

interface BackendOrder {
  _id: string;
  customer?: {
    name?: string;
  };
  car?: {
    make?: string;
    model?: string;
    licensePlate?: string;
  };
  scheduledAt?: string | Date;
  services: (string | BackendService)[];
  serviceType: string;
}

export default function Emergency() {
  const navigate = useNavigate();
  const [emergencies, setEmergencies] = useState<BookingData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const garageId = localStorage.getItem("garage_id");

  const fetchEmergencyRequests = useCallback(async () => {
    let currentGarageId = garageId;

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
      toast.error("Garage ID not found. Please login again.");
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      console.log(`Fetching emergency requests for garage ID: ${currentGarageId}`);
      const response = await axios.get(`http://localhost:5001/api/orders/nearby/${currentGarageId}?radius=20`); // Larger radius for emergencies
      console.log("Emergency Requests Response:", response.data);
      // Filter for breakdown serviceType and map to BookingData
      const mappedEmergencies: BookingData[] = response.data
        .filter((order: BackendOrder) => order.serviceType === 'breakdown')
        .map((order: BackendOrder) => ({
          id: order._id,
          customerName: order.customer?.name || "Unknown Customer",
          vehicleDetails: order.car ? `${order.car.make} ${order.car.model} - ${order.car.licensePlate}` : "Vehicle Info N/A",
          distance: "Nearby",
          timeSlot: "NOW",
          problemDescription: order.services.map((s) => (typeof s === 'string' ? s : s.name)).join(", ") || "Emergency breakdown",
          isEmergency: true,
        }));
      setEmergencies(mappedEmergencies);
    } catch (error) {
      console.error("Error fetching emergencies:", error);
      toast.error("Failed to fetch emergency requests");
    } finally {
      setIsLoading(false);
    }
  }, [garageId]);

  useEffect(() => {
    fetchEmergencyRequests();
  }, [fetchEmergencyRequests]);

  const handleAccept = async (id: string) => {
    try {
      const response = await axios.put(`http://localhost:5001/api/orders/accept/${id}`, { garageId });
      const order = response.data;
      
      // Map to BookingData for navigation
      const acceptedEmergency: BookingData = {
        id: order._id,
        customerName: order.customer?.name || "Customer",
        vehicleDetails: order.car ? `${order.car.make} ${order.car.model}` : "Vehicle",
        distance: "Nearby",
        timeSlot: "NOW",
        problemDescription: order.services.join(", "),
        isEmergency: true,
      };

      // Store in localStorage for demo purposes (as expected by EmergencyDetail)
      localStorage.setItem("active_emergency", JSON.stringify(acceptedEmergency));
      setEmergencies(emergencies.filter((e) => e.id !== id));
      toast.success("Emergency accepted! Navigate to customer location.");
      navigate(`/emergency/${id}`);
    } catch (error) {
      console.error("Error accepting emergency:", error);
      toast.error("Failed to accept emergency");
    }
  };

  const handleDecline = (id: string) => {
    setEmergencies(emergencies.filter((e) => e.id !== id));
    toast("Emergency request declined");
  };

  return (
    <div className="mobile-container pb-24">
      <TopBar />

      <div className="page-padding">
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <h1 className="font-heading font-bold text-xl text-foreground">
            Emergency Requests
          </h1>
          <span className="px-3 py-1 bg-emergency/10 text-emergency text-sm font-semibold rounded-full animate-pulse">
            {emergencies.length} active
          </span>
        </div>

        {/* Emergency List */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-16">
            <Loader2 className="w-8 h-8 text-emergency animate-spin mb-2" />
            <p className="text-sm text-muted-foreground">Scanning for emergencies...</p>
          </div>
        ) : emergencies.length > 0 ? (
          <div className="space-y-4">
            {emergencies.map((emergency) => (
              <BookingCard
                key={emergency.id}
                booking={emergency}
                onAccept={() => handleAccept(emergency.id)}
                onDecline={() => handleDecline(emergency.id)}
                showNegotiate={false}
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-16 h-16 bg-secondary rounded-full flex items-center justify-center mb-4">
              <AlertTriangle className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="font-heading font-semibold text-lg text-foreground mb-2">
              No Emergency Requests
            </h3>
            <p className="text-sm text-muted-foreground max-w-[200px]">
              You'll be notified immediately when someone nearby needs help
            </p>
          </div>
        )}
      </div>

      <BottomNavigation />
    </div>
  );
}
