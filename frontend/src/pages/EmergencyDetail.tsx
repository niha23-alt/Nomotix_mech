import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { 
  ArrowLeft, 
  Navigation, 
  Phone, 
  Camera, 
  FileText, 
  Check,
  MapPin,
  User,
  Car,
  AlertTriangle,
  X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { PartsRequiredSection, defaultParts } from "@/components/PartsRequiredSection";
import { DeclineEmergencySheet } from "@/components/DeclineEmergencySheet";

interface EmergencyData {
  id: string;
  customerName: string;
  vehicleDetails: string;
  distance: string;
  problemDescription: string;
}

export default function EmergencyDetail() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [emergency, setEmergency] = useState<EmergencyData | null>(null);
  const [hasArrived, setHasArrived] = useState(false);
  const [progress, setProgress] = useState(0);
  const [actualIssue, setActualIssue] = useState("");
  const [parts, setParts] = useState(defaultParts);
  const [partsRequested, setPartsRequested] = useState(false);
  const [repairNotes, setRepairNotes] = useState("");
  const [images, setImages] = useState<File[]>([]);
  const [showDeclineSheet, setShowDeclineSheet] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("active_emergency");
    if (stored) {
      setEmergency(JSON.parse(stored));
    }
  }, []);

  const handleArrived = () => {
    setHasArrived(true);
    toast.success("You have arrived at the location!");
  };

  const handleCallCustomer = () => {
    toast("Opening phone dialer...");
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setImages([...images, ...Array.from(e.target.files)]);
    }
  };

  const handleRequestParts = () => {
    setPartsRequested(true);
    toast.success("Parts request sent!");
    if (actualIssue) setProgress(50);
  };

  const handleDecline = (reason: string, notes: string) => {
    setShowDeclineSheet(false);
    toast("Emergency declined. Notifying next available mechanic.", {
      description: `Reason: ${reason}`,
    });
    localStorage.removeItem("active_emergency");
    navigate("/emergency");
  };

  const handleComplete = () => {
    if (!actualIssue) {
      toast.error("Please enter the actual issue found");
      return;
    }
    toast.success("Emergency service completed! Invoice generated.");
    localStorage.removeItem("active_emergency");
    navigate("/active");
  };

  if (!emergency) {
    return (
      <div className="mobile-container flex items-center justify-center min-h-screen">
        <p className="text-muted-foreground">No active emergency</p>
      </div>
    );
  }

  return (
    <div className="mobile-container min-h-screen pb-8">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-emergency">
        <div className="page-padding py-4 flex items-center gap-4">
          <button
            onClick={() => navigate("/emergency")}
            className="w-10 h-10 rounded-full bg-emergency-foreground/20 flex items-center justify-center"
          >
            <ArrowLeft className="w-5 h-5 text-emergency-foreground" />
          </button>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-emergency-foreground" />
              <h1 className="font-heading font-bold text-lg text-emergency-foreground">
                Emergency Service
              </h1>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="px-5 pb-4">
          <div className="flex items-center justify-between text-xs text-emergency-foreground/80 mb-2">
            <span>Progress</span>
            <span>{progress}%</span>
          </div>
          <Progress value={progress} className="h-2 bg-emergency-foreground/20" />
        </div>
      </div>

      <div className="page-padding">
        {/* Customer Info Card */}
        <div className="bg-card rounded-2xl p-4 card-shadow border border-border/50 mb-4">
          <div className="flex items-start gap-3 mb-3">
            <div className="w-12 h-12 bg-secondary rounded-full flex items-center justify-center">
              <User className="w-6 h-6 text-muted-foreground" />
            </div>
            <div className="flex-1">
              <h3 className="font-heading font-semibold text-foreground">
                {emergency.customerName}
              </h3>
              <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                <Car className="w-4 h-4" />
                <span>{emergency.vehicleDetails}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
            <MapPin className="w-4 h-4 text-primary" />
            <span>{emergency.distance} away</span>
          </div>

          <p className="text-sm bg-emergency/5 text-foreground rounded-xl p-3 border border-emergency/10">
            {emergency.problemDescription}
          </p>
        </div>

        {/* Action Buttons - Before Arrival */}
        {!hasArrived && (
          <div className="flex gap-3 mb-6">
            <Button
              variant="accent"
              size="lg"
              className="flex-1"
              onClick={handleArrived}
            >
              <Navigation className="w-5 h-5 mr-2" />
              Arrived
            </Button>

            <Button
              variant="default"
              size="lg"
              className="flex-1"
              onClick={handleCallCustomer}
            >
              <Phone className="w-5 h-5 mr-2" />
              Call Customer
            </Button>
          </div>
        )}

        {/* After Arrival - Show Decline Option and Service Details */}
        {hasArrived && (
          <div className="space-y-5 animate-fade-in">
            {/* Decline Button */}
            <Button
              variant="outline"
              size="lg"
              className="w-full border-destructive text-destructive hover:bg-destructive/10"
              onClick={() => setShowDeclineSheet(true)}
            >
              <X className="w-5 h-5 mr-2" />
              Decline Request
            </Button>

            <h2 className="font-heading font-bold text-lg text-foreground">
              Service Details
            </h2>

            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-foreground mb-2">
                <FileText className="w-4 h-4 text-primary" />
                Actual Issue Found *
              </label>
              <Textarea
                value={actualIssue}
                onChange={(e) => {
                  setActualIssue(e.target.value);
                  setProgress(e.target.value ? 25 : 0);
                }}
                placeholder="Describe the actual problem found..."
                className="min-h-[80px] rounded-xl border-2"
              />
            </div>

            {/* Parts Required Section */}
            <PartsRequiredSection
              parts={parts}
              onPartsChange={setParts}
              partsRequested={partsRequested}
              onRequestParts={handleRequestParts}
            />

            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-foreground mb-2">
                Repair Notes
              </label>
              <Textarea
                value={repairNotes}
                onChange={(e) => {
                  setRepairNotes(e.target.value);
                  if (e.target.value && actualIssue && partsRequested) setProgress(75);
                }}
                placeholder="Additional repair notes..."
                className="min-h-[80px] rounded-xl border-2"
              />
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-foreground mb-2">
                <Camera className="w-4 h-4 text-primary" />
                Upload Images
              </label>
              <label className="flex items-center justify-center gap-3 h-14 rounded-xl border-2 border-dashed border-border bg-secondary/30 cursor-pointer hover:border-primary/50 transition-colors">
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={(e) => {
                    handleImageUpload(e);
                    setProgress(90);
                  }}
                />
                <Camera className="w-5 h-5 text-muted-foreground" />
                <span className="text-muted-foreground">
                  {images.length > 0 ? `${images.length} images selected` : "Add photos"}
                </span>
              </label>
            </div>

            <Button
              variant="success"
              size="xl"
              className="w-full"
              onClick={() => {
                setProgress(100);
                handleComplete();
              }}
            >
              <Check className="w-5 h-5 mr-2" />
              Mark Completed & Generate Invoice
            </Button>
          </div>
        )}
      </div>

      {/* Decline Sheet */}
      <DeclineEmergencySheet
        open={showDeclineSheet}
        onOpenChange={setShowDeclineSheet}
        onConfirmDecline={handleDecline}
      />
    </div>
  );
}
