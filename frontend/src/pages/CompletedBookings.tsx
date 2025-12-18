import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, User, Car, Calendar, FileText, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CompletedBooking {
  id: string;
  customerName: string;
  vehicleDetails: string;
  completedOn: string;
  amount: number;
}

const mockCompletedBookings: CompletedBooking[] = [
  {
    id: "c1",
    customerName: "Rahul Sharma",
    vehicleDetails: "Honda City 2020",
    completedOn: "Dec 8, 2024",
    amount: 2500,
  },
  {
    id: "c2",
    customerName: "Priya Patel",
    vehicleDetails: "Maruti Swift",
    completedOn: "Dec 7, 2024",
    amount: 1800,
  },
  {
    id: "c3",
    customerName: "Amit Kumar",
    vehicleDetails: "Hyundai Creta",
    completedOn: "Dec 6, 2024",
    amount: 3200,
  },
  {
    id: "c4",
    customerName: "Vikram Singh",
    vehicleDetails: "Toyota Fortuner",
    completedOn: "Dec 5, 2024",
    amount: 4500,
  },
  {
    id: "c5",
    customerName: "Neha Gupta",
    vehicleDetails: "Tata Nexon",
    completedOn: "Dec 4, 2024",
    amount: 1200,
  },
];

export default function CompletedBookings() {
  const navigate = useNavigate();
  const [bookings] = useState<CompletedBooking[]>(mockCompletedBookings);

  return (
    <div className="mobile-container min-h-screen pb-8">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-card border-b border-border">
        <div className="page-padding py-4 flex items-center gap-4">
          <button
            onClick={() => navigate("/profile")}
            className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center"
          >
            <ArrowLeft className="w-5 h-5 text-foreground" />
          </button>
          <div>
            <h1 className="font-heading font-bold text-lg text-foreground">
              Completed Bookings
            </h1>
            <p className="text-sm text-muted-foreground">{bookings.length} total</p>
          </div>
        </div>
      </div>

      <div className="page-padding">
        {/* Bookings List */}
        <div className="space-y-3">
          {bookings.map((booking) => (
            <div
              key={booking.id}
              className="bg-card rounded-2xl p-4 card-shadow border border-border/50 animate-fade-in"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-success/10 rounded-full flex items-center justify-center">
                    <User className="w-5 h-5 text-success" />
                  </div>
                  <div>
                    <h3 className="font-heading font-semibold text-foreground">
                      {booking.customerName}
                    </h3>
                    <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                      <Car className="w-4 h-4" />
                      <span>{booking.vehicleDetails}</span>
                    </div>
                  </div>
                </div>
                <p className="font-heading font-bold text-success">
                  ₹{booking.amount.toLocaleString()}
                </p>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                  <Calendar className="w-4 h-4 text-primary" />
                  <span>{booking.completedOn}</span>
                </div>

                <Button variant="ghost" size="sm" className="text-primary">
                  <Eye className="w-4 h-4 mr-1" />
                  View Invoice
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
