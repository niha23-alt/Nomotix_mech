import { useState } from "react";
import { TopBar } from "@/components/TopBar";
import { BottomNavigation } from "@/components/BottomNavigation";
import { BookingCard, BookingData } from "@/components/BookingCard";
import { NegotiateSheet } from "@/components/NegotiateSheet";
import { toast } from "sonner";
import { Calendar } from "lucide-react";

type FilterType = "all" | "today";

const mockBookings: BookingData[] = [
  {
    id: "1",
    customerName: "Rahul Sharma",
    vehicleDetails: "Honda City 2020 - KA 01 AB 1234",
    distance: "0.3 km",
    timeSlot: "Today, 2:00 PM",
    problemDescription: "Car AC not cooling properly. Making unusual noise when turned on.",
    isNew: true,
  },
  {
    id: "2",
    customerName: "Priya Patel",
    vehicleDetails: "Maruti Swift - KA 05 CD 5678",
    distance: "1.2 km",
    timeSlot: "Tomorrow, 10:00 AM",
    problemDescription: "Regular service due. Oil change and brake check needed.",
    isNew: true,
  },
  {
    id: "3",
    customerName: "Amit Kumar",
    vehicleDetails: "Hyundai Creta 2022 - KA 03 EF 9012",
    distance: "2.5 km",
    timeSlot: "Tomorrow, 4:00 PM",
    problemDescription: "Engine light is on. Need diagnostic check.",
  },
];

export default function BookingRequests() {
  const [bookings, setBookings] = useState<BookingData[]>(mockBookings);
  const [negotiateOpen, setNegotiateOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<BookingData | null>(null);
  const [filter, setFilter] = useState<FilterType>("all");

  const filteredBookings = filter === "today" 
    ? bookings.filter(b => b.timeSlot.toLowerCase().includes("today"))
    : bookings;

  const handleAccept = (id: string) => {
    setBookings(bookings.filter((b) => b.id !== id));
    toast.success("Booking accepted! Added to Active Bookings.");
  };

  const handleDecline = (id: string) => {
    setBookings(bookings.filter((b) => b.id !== id));
    toast("Booking declined");
  };

  const handleNegotiate = (booking: BookingData) => {
    setSelectedBooking(booking);
    setNegotiateOpen(true);
  };

  const handleNegotiateSubmit = (data: { date: string; time: string; note: string }) => {
    toast.success("Negotiation proposal sent to customer");
  };

  return (
    <div className="mobile-container pb-24">
      <TopBar />

      <div className="page-padding">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h1 className="font-heading font-bold text-xl text-foreground">
            Booking Requests
          </h1>
          <span className="px-3 py-1 bg-primary/10 text-primary text-sm font-semibold rounded-full">
            {filteredBookings.length} new
          </span>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 mb-5">
          <button
            onClick={() => setFilter("all")}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              filter === "all"
                ? "bg-primary text-primary-foreground"
                : "bg-secondary text-muted-foreground hover:bg-secondary/80"
            }`}
          >
            All
          </button>
          <button
            onClick={() => setFilter("today")}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              filter === "today"
                ? "bg-primary text-primary-foreground"
                : "bg-secondary text-muted-foreground hover:bg-secondary/80"
            }`}
          >
            Today
          </button>
        </div>

        {/* Bookings List */}
        {filteredBookings.length > 0 ? (
          <div className="space-y-4">
            {filteredBookings.map((booking) => (
              <BookingCard
                key={booking.id}
                booking={booking}
                onAccept={() => handleAccept(booking.id)}
                onDecline={() => handleDecline(booking.id)}
                onNegotiate={() => handleNegotiate(booking)}
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-16 h-16 bg-secondary rounded-full flex items-center justify-center mb-4">
              <Calendar className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="font-heading font-semibold text-lg text-foreground mb-2">
              No Pending Requests
            </h3>
            <p className="text-sm text-muted-foreground max-w-[200px]">
              New booking requests will appear here
            </p>
          </div>
        )}
      </div>

      <NegotiateSheet
        isOpen={negotiateOpen}
        onClose={() => setNegotiateOpen(false)}
        onSubmit={handleNegotiateSubmit}
        customerName={selectedBooking?.customerName || ""}
      />

      <BottomNavigation />
    </div>
  );
}
