import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { 
  ArrowLeft, 
  User, 
  Car, 
  MapPin, 
  Phone, 
  Calendar,
  Check,
  Camera,
  FileText
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { PartsRequiredSection, defaultParts } from "@/components/PartsRequiredSection";

export default function BookingDetail() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [parts, setParts] = useState(defaultParts);
  const [partsRequested, setPartsRequested] = useState(false);
  const [notes, setNotes] = useState("");
  const [images, setImages] = useState<File[]>([]);

  const handleRequestParts = () => {
    setPartsRequested(true);
    toast.success("Parts request sent!");
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setImages([...images, ...Array.from(e.target.files)]);
    }
  };

  const handleComplete = () => {
    const usedParts = parts.filter((p) => p.checked);
    if (usedParts.length === 0 && !notes) {
      toast.error("Please add parts used or notes before completing");
      return;
    }
    toast.success("Repair marked as completed!");
    navigate("/active");
  };

  // Mock data - in real app, fetch based on id
  const booking = {
    customerName: "Rahul Sharma",
    vehicleDetails: "Honda City 2020 - KA 01 AB 1234",
    bookedOn: "Today, 2:00 PM",
    location: "123, 4th Cross, Koramangala",
    phone: "+91 98765 43210",
    problem: "Car AC not cooling properly. Making unusual noise when turned on.",
  };

  return (
    <div className="mobile-container min-h-screen pb-8">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-card border-b border-border">
        <div className="page-padding py-4 flex items-center gap-4">
          <button
            onClick={() => navigate("/active")}
            className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center"
          >
            <ArrowLeft className="w-5 h-5 text-foreground" />
          </button>
          <h1 className="font-heading font-bold text-lg text-foreground">
            Booking Details
          </h1>
        </div>
      </div>

      <div className="page-padding">
        {/* Customer Info Card */}
        <div className="bg-card rounded-2xl p-4 card-shadow border border-border/50 mb-4">
          <div className="flex items-start gap-3 mb-4">
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
              <User className="w-6 h-6 text-primary" />
            </div>
            <div className="flex-1">
              <h3 className="font-heading font-semibold text-foreground">
                {booking.customerName}
              </h3>
              <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                <Car className="w-4 h-4" />
                <span>{booking.vehicleDetails}</span>
              </div>
            </div>
          </div>

          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-primary" />
              <span className="text-muted-foreground">{booking.bookedOn}</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-primary" />
              <span className="text-muted-foreground">{booking.location}</span>
            </div>
            <a
              href={`tel:${booking.phone}`}
              className="flex items-center gap-2 text-primary font-medium"
            >
              <Phone className="w-4 h-4" />
              <span>{booking.phone}</span>
            </a>
          </div>
        </div>

        {/* Problem Description */}
        <div className="mb-6">
          <h3 className="font-heading font-semibold text-foreground mb-2">
            Customer's Issue
          </h3>
          <p className="text-sm bg-secondary/50 text-muted-foreground rounded-xl p-3">
            {booking.problem}
          </p>
        </div>

        {/* Parts Required Section */}
        <div className="mb-6">
          <PartsRequiredSection
            parts={parts}
            onPartsChange={setParts}
            partsRequested={partsRequested}
            onRequestParts={handleRequestParts}
          />
        </div>

        {/* Image Upload */}
        <div className="mb-6">
          <h3 className="font-heading font-semibold text-foreground mb-3">
            Upload Images
          </h3>
          <div className="grid grid-cols-3 gap-2 mb-3">
            {images.map((img, index) => (
              <div
                key={index}
                className="aspect-square rounded-xl bg-secondary overflow-hidden"
              >
                <img
                  src={URL.createObjectURL(img)}
                  alt={`Upload ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              </div>
            ))}
            <label className="aspect-square rounded-xl border-2 border-dashed border-border bg-secondary/30 flex flex-col items-center justify-center cursor-pointer hover:border-primary/50 transition-colors">
              <input
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={handleImageUpload}
              />
              <Camera className="w-6 h-6 text-muted-foreground mb-1" />
              <span className="text-xs text-muted-foreground">Add</span>
            </label>
          </div>
        </div>

        {/* Notes */}
        <div className="mb-6">
          <h3 className="font-heading font-semibold text-foreground mb-3 flex items-center gap-2">
            <FileText className="w-4 h-4 text-primary" />
            Mechanic Notes
          </h3>
          <Textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Add notes about the repair..."
            className="min-h-[100px] rounded-xl border-2"
          />
        </div>

        {/* Complete Button */}
        <Button
          variant="success"
          size="xl"
          className="w-full"
          onClick={handleComplete}
        >
          <Check className="w-5 h-5 mr-2" />
          Mark Repair Completed
        </Button>
      </div>
    </div>
  );
}
