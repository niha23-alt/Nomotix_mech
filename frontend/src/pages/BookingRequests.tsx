
import { useState, useEffect } from "react";
=======
import { useState, useEffect, useCallback } from "react";

import { TopBar } from "@/components/TopBar";
import { BottomNavigation } from "@/components/BottomNavigation";
import { BookingCard, BookingData } from "@/components/BookingCard";
import { NegotiateSheet } from "@/components/NegotiateSheet";
import { toast } from "sonner";

import { Calendar } from "lucide-react";
import axios from "axios"; // Import axios for API calls

type FilterType = "all" | "today";

export default function BookingRequests() {
  const [bookings, setBookings] = useState<BookingData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
=======
import { Calendar, Loader2 } from "lucide-react";
import axios from "axios";

type FilterType = "all" | "today";

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

export default function BookingRequests() {
  const [bookings, setBookings] = useState<BookingData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [negotiateOpen, setNegotiateOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<BookingData | null>(null);
  const [filter, setFilter] = useState<FilterType>("all");


  // Placeholder for garageId - this should come from authentication context in a real app
  const garageId = "65e683a9217316c52676081e"; // Replace with actual garage ID

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`/api/orders/garage/${garageId}?status=pending`);
        console.log("API Response:", response);
        console.log("API Response Data:", response.data);
        const orders = response.data?.orders; // Safely access orders
        if (!orders || !Array.isArray(orders)) {
          console.warn("API response did not contain an array of orders:", response.data);
          setBookings([]);
          setLoading(false);
          return;
        }

        const fetchedBookings: BookingData[] = orders.map((order: any) => ({
            id: order._id,
            customerName: order.customer?.name || "N/A",
            vehicleDetails: order.car ? `${order.car.make} ${order.car.model} - ${order.car.licensePlate}` : "N/A",
            distance: "N/A",
            timeSlot: new Date(order.createdAt).toLocaleString(),
            problemDescription: order.problemDescription || "No description provided.",
            isNew: order.status === "pending",
          }));
        setBookings(fetchedBookings);
      } catch (err) {
        console.error("Failed to fetch bookings:", err);
        setError("Failed to load booking requests.");
        toast.error("Failed to load booking requests.");
      } finally {
        setLoading(false);
      }
    };

    if (garageId) {
      fetchBookings();
    }
  }, [garageId]);


  const garageId = localStorage.getItem("garage_id");

  const fetchNearbyBookings = useCallback(async () => {
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
      console.log(`Fetching nearby bookings for garage ID: ${currentGarageId}`);
      const response = await axios.get(`http://localhost:5001/api/orders/nearby/${currentGarageId}`);
      console.log("Nearby Bookings Response:", response.data);
      // Map API response to BookingData format
      const mappedBookings: BookingData[] = response.data
        .filter((order: BackendOrder) => order.serviceType !== 'breakdown') // Filter out emergency requests
        .map((order: BackendOrder) => ({
        id: order._id,
        customerName: order.customer?.name || "Unknown Customer",
        vehicleDetails: order.car ? `${order.car.make} ${order.car.model} - ${order.car.licensePlate}` : "Vehicle Info N/A",
        distance: "Nearby", // In a real app, you'd calculate this or get it from backend
        timeSlot: order.scheduledAt ? new Date(order.scheduledAt).toLocaleString() : "As soon as possible",
        problemDescription: order.services.map((s) => (typeof s === 'string' ? s : s.name)).join(", ") || "No description",
        isNew: true,
        isEmergency: false,
      }));
      setBookings(mappedBookings);
    } catch (error) {
      console.error("Error fetching bookings:", error);
      toast.error("Failed to fetch booking requests");
    } finally {
      setIsLoading(false);
    }
  }, [garageId]);

  useEffect(() => {
    fetchNearbyBookings();
  }, [fetchNearbyBookings]);


  const filteredBookings = filter === "today" 
    ? bookings.filter(b => b.timeSlot.toLowerCase().includes("today") || b.timeSlot.toLowerCase().includes(new Date().toLocaleDateString()))
    : bookings;

  const handleAccept = async (id: string) => {
    try {
      await axios.put(`http://localhost:5001/api/orders/accept/${id}`, { garageId });
      setBookings(bookings.filter((b) => b.id !== id));
      toast.success("Booking accepted! Added to Active Bookings.");
    } catch (error) {
      console.error("Error accepting booking:", error);
      toast.error("Failed to accept booking");
    }
  };

  const handleDecline = (id: string) => {
    // For now, just filter locally. In real app, you might want to mark it as declined by this garage
    setBookings(bookings.filter((b) => b.id !== id));
    toast("Booking declined");
  };

  const handleNegotiate = (booking: BookingData) => {
    setSelectedBooking(booking);
    setNegotiateOpen(true);
  };

  const handleNegotiateSubmit = (data: { date: string; time: string; note: string }) => {
    console.log("Negotiation data:", data);
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

        {/* Loading and Error States */}
        {loading && <p className="text-center py-8">Loading booking requests...</p>}
        {error && <p className="text-center py-8 text-red-500">{error}</p>}

        {/* Bookings List */}

        {!loading && !error && filteredBookings.length > 0 ? (
=======
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-16">
            <Loader2 className="w-8 h-8 text-primary animate-spin mb-2" />
            <p className="text-sm text-muted-foreground">Finding nearby requests...</p>
          </div>
        ) : filteredBookings.length > 0 ? (

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
        ) : (!loading && !error && (
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
        ))}
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
