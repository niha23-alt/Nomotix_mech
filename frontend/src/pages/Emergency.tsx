import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { TopBar } from "@/components/TopBar";
import { BottomNavigation } from "@/components/BottomNavigation";
import { BookingCard, BookingData } from "@/components/BookingCard";
import { toast } from "sonner";
import { AlertTriangle } from "lucide-react";

const mockEmergencies: BookingData[] = [
  {
    id: "e1",
    customerName: "Vikram Singh",
    vehicleDetails: "Toyota Fortuner - KA 01 MN 4567",
    distance: "0.8 km",
    timeSlot: "NOW",
    problemDescription: "Car broke down on road. Engine not starting. Need immediate help!",
    isEmergency: true,
  },
  {
    id: "e2",
    customerName: "Neha Gupta",
    vehicleDetails: "Tata Nexon - KA 02 PQ 7890",
    distance: "1.5 km",
    timeSlot: "NOW",
    problemDescription: "Flat tire on highway. Spare tire needs to be installed.",
    isEmergency: true,
  },
];

export default function Emergency() {
  const navigate = useNavigate();
  const [emergencies, setEmergencies] = useState<BookingData[]>(mockEmergencies);

  const handleAccept = (id: string) => {
    const emergency = emergencies.find((e) => e.id === id);
    if (emergency) {
      // Store in localStorage for demo purposes
      localStorage.setItem("active_emergency", JSON.stringify(emergency));
      setEmergencies(emergencies.filter((e) => e.id !== id));
      toast.success("Emergency accepted! Navigate to customer location.");
      navigate(`/emergency/${id}`);
    }
  };

  const handleDecline = (id: string) => {
    setEmergencies(emergencies.filter((e) => e.id !== id));
    toast("Emergency declined. Notifying next available mechanic.");
  };

  return (
    <div className="mobile-container pb-24">
      <TopBar />

      <div className="page-padding">
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <h1 className="font-heading font-bold text-xl text-foreground">
              Emergency Calls
            </h1>
            <span className="animate-pulse-subtle">🚨</span>
          </div>
          {emergencies.length > 0 && (
            <span className="px-3 py-1 bg-emergency/10 text-emergency text-sm font-semibold rounded-full animate-pulse-subtle">
              {emergencies.length} active
            </span>
          )}
        </div>

        {/* Emergency Alert Banner */}
        {emergencies.length > 0 && (
          <div className="bg-emergency/10 border border-emergency/20 rounded-xl p-4 mb-5 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-emergency mt-0.5" />
            <div>
              <p className="font-semibold text-emergency text-sm mb-1">
                Urgent Assistance Needed
              </p>
              <p className="text-xs text-foreground/70">
                Nearby customers need immediate help. Accept to navigate to their location.
              </p>
            </div>
          </div>
        )}

        {/* Emergency List */}
        {emergencies.length > 0 ? (
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
            <div className="w-16 h-16 bg-success/10 rounded-full flex items-center justify-center mb-4">
              <AlertTriangle className="w-8 h-8 text-success" />
            </div>
            <h3 className="font-heading font-semibold text-lg text-foreground mb-2">
              No Active Emergencies
            </h3>
            <p className="text-sm text-muted-foreground max-w-[200px]">
              Emergency calls will appear here when customers need immediate help
            </p>
          </div>
        )}
      </div>

      <BottomNavigation />
    </div>
  );
}
