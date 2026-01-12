import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, User, Car, Calendar, FileText, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import axios from "axios";

interface CompletedBooking {
  _id: string;
  customer: {
    name: string;
  };
  car: {
    make: string;
    model: string;
    year: number;
  };
  completedAt: string;
  createdAt: string;
  bill: {
    total: number;
  };
  status: string;
}

export default function CompletedBookings() {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState<CompletedBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Mock data for demonstration - 12 completed bookings as requested
  const mockCompletedBookings: CompletedBooking[] = [
    {
      _id: "1",
      customer: { name: "John Doe" },
      car: { make: "Toyota", model: "Camry", year: 2020 },
      completedAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(),
      bill: { total: 2500 },
      status: "completed"
    },
    {
      _id: "2",
      customer: { name: "Jane Smith" },
      car: { make: "Honda", model: "Civic", year: 2018 },
      completedAt: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(),
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
      bill: { total: 1800 },
      status: "completed"
    },
    {
      _id: "3",
      customer: { name: "Mike Johnson" },
      car: { make: "Ford", model: "Mustang", year: 2022 },
      completedAt: new Date(Date.now() - 1000 * 60 * 60 * 8).toISOString(),
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 9).toISOString(),
      bill: { total: 3200 },
      status: "completed"
    },
    {
      _id: "4",
      customer: { name: "Sarah Williams" },
      car: { make: "Maruti", model: "Swift", year: 2021 },
      completedAt: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(),
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 13).toISOString(),
      bill: { total: 1500 },
      status: "completed"
    },
    {
      _id: "5",
      customer: { name: "David Brown" },
      car: { make: "Hyundai", model: "i20", year: 2019 },
      completedAt: new Date(Date.now() - 1000 * 60 * 60 * 16).toISOString(),
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 17).toISOString(),
      bill: { total: 2200 },
      status: "completed"
    },
    {
      _id: "6",
      customer: { name: "Lisa Davis" },
      car: { make: "Tata", model: "Nexon", year: 2023 },
      completedAt: new Date(Date.now() - 1000 * 60 * 60 * 20).toISOString(),
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 21).toISOString(),
      bill: { total: 2800 },
      status: "completed"
    },
    {
      _id: "7",
      customer: { name: "Robert Wilson" },
      car: { make: "Honda", model: "City", year: 2020 },
      completedAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 25).toISOString(),
      bill: { total: 3000 },
      status: "completed"
    },
    {
      _id: "8",
      customer: { name: "Emma Moore" },
      car: { make: "Toyota", model: "Innova", year: 2018 },
      completedAt: new Date(Date.now() - 1000 * 60 * 60 * 28).toISOString(),
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 29).toISOString(),
      bill: { total: 3500 },
      status: "completed"
    },
    {
      _id: "9",
      customer: { name: "Michael Taylor" },
      car: { make: "Ford", model: "Ecosport", year: 2021 },
      completedAt: new Date(Date.now() - 1000 * 60 * 60 * 32).toISOString(),
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 33).toISOString(),
      bill: { total: 2100 },
      status: "completed"
    },
    {
      _id: "10",
      customer: { name: "Olivia Anderson" },
      car: { make: "Maruti", model: "Baleno", year: 2022 },
      completedAt: new Date(Date.now() - 1000 * 60 * 60 * 36).toISOString(),
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 37).toISOString(),
      bill: { total: 1900 },
      status: "completed"
    },
    {
      _id: "11",
      customer: { name: "James Thomas" },
      car: { make: "Hyundai", model: "Creta", year: 2020 },
      completedAt: new Date(Date.now() - 1000 * 60 * 60 * 40).toISOString(),
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 41).toISOString(),
      bill: { total: 3300 },
      status: "completed"
    },
    {
      _id: "12",
      customer: { name: "Sophia Jackson" },
      car: { make: "Tata", model: "Harrier", year: 2023 },
      completedAt: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 49).toISOString(),
      bill: { total: 4000 },
      status: "completed"
    }
  ];

  useEffect(() => {
    const fetchCompletedBookings = async () => {
      const garageId = localStorage.getItem("garage_id");
      if (!garageId) {
        navigate("/auth");
        return;
      }

      try {
        setLoading(true);
        console.log(`Fetching completed bookings for garage ID: ${garageId}`);
        const response = await axios.get(`http://localhost:5001/api/orders/garage/${garageId}?status=completed`);
        
        console.log('Completed bookings response:', response.data);
        
        let fetchedBookings: CompletedBooking[] = [];
        
        if (response.data.orders && Array.isArray(response.data.orders)) {
          fetchedBookings = response.data.orders;
          console.log(`Found ${fetchedBookings.length} completed bookings from API`);
        } else if (Array.isArray(response.data)) {
          fetchedBookings = response.data;
          console.log(`Found ${fetchedBookings.length} completed bookings from API (direct array)`);
        } else {
          console.error('Unexpected API response format:', response.data);
        }
        
        // Use mock data if API returns no data, as requested by user
        if (fetchedBookings.length === 0) {
          console.log('No real completed bookings found, using mock data with 12 entries as requested');
          fetchedBookings = mockCompletedBookings;
        }
        
        // Sort by completedAt in descending order (most recent first)
        fetchedBookings.sort((a, b) => {
          const dateA = new Date(a.completedAt || a.createdAt).getTime();
          const dateB = new Date(b.completedAt || b.createdAt).getTime();
          return dateB - dateA;
        });
        
        setBookings(fetchedBookings);
        setError(null);
      } catch (err: any) {
        console.error("Error fetching completed bookings:", err);
        setBookings([]);
        setError("Failed to load completed bookings. Please check your connection and try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchCompletedBookings();
  }, [navigate]);

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
        <div className="text-center py-12 text-muted-foreground">
          <p>{error}</p>
          <Button 
            variant="default" 
            className="mt-4"
            onClick={() => window.location.reload()}
          >
            Try Again
          </Button>
        </div>
      );
    }

    if (bookings.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="w-16 h-16 bg-secondary rounded-full flex items-center justify-center mb-4">
            <FileText className="w-8 h-8 text-muted-foreground" />
          </div>
          <h3 className="font-heading font-semibold text-lg text-foreground mb-2">
            No Completed Bookings
          </h3>
          <p className="text-sm text-muted-foreground max-w-[250px] mb-4">
            Completed bookings will appear here after you finish providing services to customers
          </p>
          <Button 
            variant="default" 
            onClick={() => window.location.reload()}
          >
            Refresh
          </Button>
        </div>
      );
    }

    return (
      <div className="space-y-3">
        {bookings.map((booking) => (
          <div
            key={booking._id}
            className="bg-card rounded-2xl p-4 card-shadow border border-border/50 animate-fade-in"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-success/10 rounded-full flex items-center justify-center">
                  <User className="w-5 h-5 text-success" />
                </div>
                <div>
                  <h3 className="font-heading font-semibold text-foreground">
                    {booking.customer?.name || "Unknown Customer"}
                  </h3>
                  <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                    <Car className="w-4 h-4" />
                    <span>
                      {booking.car?.make || "Unknown"} {booking.car?.model || "Vehicle"} {booking.car?.year || ""}
                    </span>
                  </div>
                </div>
              </div>
              <p className="font-heading font-bold text-success">
                ₹{(booking.bill?.total || 0).toLocaleString()}
              </p>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                <Calendar className="w-4 h-4 text-primary" />
                <span>
                  {new Date(booking.completedAt || booking.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric'
                  })}
                </span>
              </div>

              <Button variant="ghost" size="sm" className="text-primary">
                <Eye className="w-4 h-4 mr-1" />
                View Invoice
              </Button>
            </div>
          </div>
        ))}
      </div>
    );
  };

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
        {renderContent()}
      </div>
    </div>
  );
}
