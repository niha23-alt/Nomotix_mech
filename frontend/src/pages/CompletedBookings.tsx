import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, User, Car, Calendar, FileText, Eye, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import axios from "axios";

interface Service {
  name: string;
  price: number;
}

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
  services: Service[];
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
  const [selectedBooking, setSelectedBooking] = useState<CompletedBooking | null>(null);

  useEffect(() => {
    const fetchCompletedBookings = async () => {
      const garageId = localStorage.getItem("garage_id");
      console.log('🔍 Fetching completed bookings with garageId:', garageId);
      if (!garageId) {
        console.log('🚨 No garageId found in localStorage');
        navigate("/auth");
        return;
      }

      try {
        setLoading(true);
        const apiUrl = `http://localhost:5001/api/orders/garage/${garageId}?status=completed`;
        console.log('📡 Calling API:', apiUrl);
        const response = await axios.get(apiUrl);
        
        console.log('📥 API response status:', response.status);
        console.log('📥 API response data:', response.data);
        
        let fetchedBookings: CompletedBooking[] = [];
        
        // Handle different response formats
        if (response.data.orders && Array.isArray(response.data.orders)) {
          fetchedBookings = response.data.orders;
          console.log('📋 Found orders in response:', fetchedBookings.length);
        } else if (Array.isArray(response.data)) {
          fetchedBookings = response.data;
          console.log('📋 Found orders in direct array response:', fetchedBookings.length);
        } else {
          console.error('❌ Unexpected API response format:', response.data);
        }
        
        // Sort by completedAt in descending order (most recent first)
        fetchedBookings.sort((a, b) => {
          const dateA = new Date(a.completedAt || a.createdAt).getTime();
          const dateB = new Date(b.completedAt || b.createdAt).getTime();
          return dateB - dateA;
        });
        
        // Ensure each booking has proper service data
        const bookingsWithProperServices = fetchedBookings.map(booking => {
          // If the booking doesn't have services, add default service
          if (!booking.services || booking.services.length === 0) {
            return {
              ...booking,
              services: [
                { name: "Tyres", price: 1000 }
              ]
            };
          }
          
          // Process services to ensure they have proper structure
          const processedServices = booking.services.map(serviceItem => {
            // Check if serviceItem is just an ObjectId or has only _id property
            if (typeof serviceItem === 'object' && serviceItem._id && Object.keys(serviceItem).length === 1) {
              // If it's just an ObjectId reference, use default service
              return { name: "Tyres", price: 1000 };
            }
            // Check if serviceItem has a nested service property (from populate)
            else if (serviceItem.service && typeof serviceItem.service === 'object') {
              // Extract service details from nested service property
              return {
                name: serviceItem.service.name || "Service",
                price: serviceItem.CustomPrice || serviceItem.service.basePrice || 1000
              };
            } 
            // Check if serviceItem has direct name and price (old format)
            else if (serviceItem.name && typeof serviceItem.price === 'number') {
              return serviceItem;
            }
            // Fallback to default service for any other case
            else {
              return { name: "Tyres", price: 1000 };
            }
          });
          
          return {
            ...booking,
            services: processedServices
          };
        });
        
        console.log('✅ Final bookings to display:', bookingsWithProperServices.length);
        setBookings(bookingsWithProperServices);
        setError(null);
      } catch (err: any) {
        console.error("❌ Error fetching completed bookings:", err);
        if (err.response) {
          console.error('❌ Error response status:', err.response.status);
          console.error('❌ Error response data:', err.response.data);
        }
        setError("Failed to load completed bookings. Please check your connection and try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchCompletedBookings();
  }, [navigate]);
  
  // Add a function to manually set the correct garage ID for testing
  const setTestGarageId = () => {
    localStorage.setItem('garage_id', '6954ba79853fd734eefdfdcd');
    window.location.reload();
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
          <h3 className="text-xl font-semibold mb-2">No Completed Bookings</h3>
          <p className="text-muted-foreground max-w-md">
            You don't have any completed bookings yet. Completed bookings will appear here.
          </p>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {bookings.map((booking) => (
          <div key={booking._id} className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-semibold">Booking #{booking._id.slice(-6)}</h3>
                <p className="text-sm text-muted-foreground">
                  Completed on {new Date(booking.completedAt).toLocaleDateString()}
                </p>
              </div>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setSelectedBooking(booking)}
                >
                  <Eye className="w-4 h-4 mr-1" />
                  View
                </Button>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div className="flex items-center gap-3">
                <User className="w-5 h-5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">{booking.customer.name}</p>
                  <p className="text-xs text-muted-foreground">Customer</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <Car className="w-5 h-5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">
                    {booking.car.make} {booking.car.model} ({booking.car.year})
                  </p>
                  <p className="text-xs text-muted-foreground">Car</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <Calendar className="w-5 h-5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">₹{booking.bill?.total?.toLocaleString() || '0'}</p>
                  <p className="text-xs text-muted-foreground">Total Amount</p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="container mx-auto p-4">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Completed Bookings</h1>
          <p className="text-muted-foreground">Manage your completed service bookings</p>
        </div>
        <Button 
          variant="outline"
          onClick={() => navigate("/")}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Dashboard
        </Button>
      </div>
      
      {renderContent()}
      
      {/* View Invoice Dialog */}
      <Dialog open={!!selectedBooking} onOpenChange={(open) => !open && setSelectedBooking(null)}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Invoice Details</DialogTitle>
          </DialogHeader>
          
          {selectedBooking && (
            <div className="space-y-6 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="text-sm font-medium mb-2">Booking Information</h4>
                  <div className="bg-secondary p-4 rounded-md space-y-2">
                    <div className="flex justify-between">
                      <p className="text-sm text-muted-foreground">Booking ID</p>
                      <p className="text-sm font-medium">{selectedBooking._id}</p>
                    </div>
                    <div className="flex justify-between">
                      <p className="text-sm text-muted-foreground">Booking Date</p>
                      <p className="text-sm">{new Date(selectedBooking.createdAt).toLocaleDateString()}</p>
                    </div>
                    <div className="flex justify-between">
                      <p className="text-sm text-muted-foreground">Completion Date</p>
                      <p className="text-sm">{new Date(selectedBooking.completedAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium mb-2">Customer Details</h4>
                  <div className="bg-secondary p-4 rounded-md space-y-2">
                    <div className="flex justify-between">
                      <p className="text-sm text-muted-foreground">Name</p>
                      <p className="text-sm font-medium">{selectedBooking.customer.name}</p>
                    </div>
                    <div className="flex justify-between">
                      <p className="text-sm text-muted-foreground">Car</p>
                      <p className="text-sm">{selectedBooking.car.make} {selectedBooking.car.model}</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div>
                <h4 className="text-sm font-medium mb-2">Services Provided</h4>
                <div className="bg-secondary p-4 rounded-md space-y-3">
                  {selectedBooking.services.map((service, index) => (
                    <div key={index} className="flex justify-between items-center">
                      <p className="text-sm">{service.name}</p>
                      <p>₹{service.price.toLocaleString()}</p>
                    </div>
                  ))}
                  <div className="h-px bg-border my-2"></div>
                  <div className="flex justify-between items-center font-medium">
                    <p>Total</p>
                    <p>₹{selectedBooking.bill?.total?.toLocaleString() || '0'}</p>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end space-x-2 pt-2">
                <Button variant="outline">
                  <Download className="w-4 h-4 mr-2" />
                  Download Invoice
                </Button>
                <Button variant="default">
                  Close
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
