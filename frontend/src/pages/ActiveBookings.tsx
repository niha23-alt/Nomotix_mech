import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { TopBar } from "@/components/TopBar";
import { BottomNavigation } from "@/components/BottomNavigation";
import { Wrench, User, Car, MapPin, Calendar, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface ActiveBooking {
  id: string;
  customerName: string;
  vehicleDetails: string;
  bookedOn: string;
  bookedBy: string;
  location: string;
  status: "scheduled" | "in-progress";
  phone: string;
}

const mockActiveBookings: ActiveBooking[] = [
  {
    id: "a1",
    customerName: "Rahul Sharma",
    vehicleDetails: "Honda City 2020 - KA 01 AB 1234",
    bookedOn: "Today, 2:00 PM",
    bookedBy: "App Booking",
    location: "123, 4th Cross, Koramangala",
    status: "scheduled",
    phone: "+91 98765 43210",
  },
  {
    id: "a2",
    customerName: "Priya Patel",
    vehicleDetails: "Maruti Swift - KA 05 CD 5678",
    bookedOn: "Tomorrow, 10:00 AM",
    bookedBy: "Phone Call",
    location: "456, Main Road, Indiranagar",
    status: "scheduled",
    phone: "+91 98765 12345",
  },
];

export default function ActiveBookings() {
  const navigate = useNavigate();
  const [activeBookings] = useState<ActiveBooking[]>(mockActiveBookings);

  const handleBookingClick = (id: string) => {
    navigate(`/booking/${id}`);
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

        {/* Bookings List */}
        {activeBookings.length > 0 ? (
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
                  <ChevronRight className="w-5 h-5 text-muted-foreground" />
                </div>

                {/* Details */}
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Calendar className="w-4 h-4 text-primary" />
                    <span>
                      <span className="text-foreground font-medium">Booked on:</span>{" "}
                      {booking.bookedOn}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <MapPin className="w-4 h-4 text-primary" />
                    <span className="truncate">{booking.location}</span>
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
