import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  ArrowLeft, 
  User, 
  Building2, 
  Briefcase, 
  Settings, 
  Clock, 
  MapPin, 
  FileText, 
  Camera,
  Upload,
  Check
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

type Step = 1 | 2 | 3;

const specializations = [
  "Engine Repair",
  "AC/Heating",
  "Brakes",
  "Transmission",
  "Electrical",
  "Suspension",
  "Body Work",
  "Oil Change",
  "Tire Service",
  "Diagnostics",
];

export default function Register() {
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>(1);
  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState({
    fullName: "",
    garageName: "",
    experience: "",
    specializations: [] as string[],
    workingHoursFrom: "09:00",
    workingHoursTo: "18:00",
    location: "",
    idProof: null as File | null,
    garageLicense: null as File | null,
    profilePhoto: null as File | null,
  });

  const toggleSpecialization = (spec: string) => {
    setFormData((prev) => ({
      ...prev,
      specializations: prev.specializations.includes(spec)
        ? prev.specializations.filter((s) => s !== spec)
        : [...prev.specializations, spec],
    }));
  };

  const handleNext = () => {
    if (step < 3) {
      setStep((step + 1) as Step);
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep((step - 1) as Step);
    } else {
      navigate("/auth");
    }
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    // TODO: Send data to backend to create Garage profile
    // This will be implemented in the next step when connecting to backend
    await new Promise((resolve) => setTimeout(resolve, 1500));
    
    // Store local state for now
    localStorage.setItem("mechanic_registered", "true");
    setIsLoading(false);
    navigate("/verification-pending");
  };

  const renderStep1 = () => (
    <div className="space-y-5 animate-fade-in">
      <div>
        <label className="flex items-center gap-2 text-sm font-medium text-foreground mb-2">
          <User className="w-4 h-4 text-primary" />
          Full Name
        </label>
        <Input
          placeholder="Enter your full name"
          value={formData.fullName}
          onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
        />
      </div>

      <div>
        <label className="flex items-center gap-2 text-sm font-medium text-foreground mb-2">
          <Building2 className="w-4 h-4 text-primary" />
          Garage Name
        </label>
        <Input
          placeholder="Enter garage name"
          value={formData.garageName}
          onChange={(e) => setFormData({ ...formData, garageName: e.target.value })}
        />
      </div>

      <div>
        <label className="flex items-center gap-2 text-sm font-medium text-foreground mb-2">
          <Briefcase className="w-4 h-4 text-primary" />
          Years of Experience
        </label>
        <Input
          type="number"
          placeholder="e.g., 5"
          value={formData.experience}
          onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
        />
      </div>

      <div>
        <label className="flex items-center gap-2 text-sm font-medium text-foreground mb-3">
          <Settings className="w-4 h-4 text-primary" />
          Specializations
        </label>
        <div className="flex flex-wrap gap-2">
          {specializations.map((spec) => (
            <button
              key={spec}
              type="button"
              onClick={() => toggleSpecialization(spec)}
              className={cn(
                "px-3 py-2 rounded-xl text-sm font-medium transition-all duration-200",
                formData.specializations.includes(spec)
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
              )}
            >
              {spec}
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-5 animate-fade-in">
      <div>
        <label className="flex items-center gap-2 text-sm font-medium text-foreground mb-2">
          <Clock className="w-4 h-4 text-primary" />
          Working Hours
        </label>
        <div className="flex items-center gap-3">
          <Input
            type="time"
            value={formData.workingHoursFrom}
            onChange={(e) => setFormData({ ...formData, workingHoursFrom: e.target.value })}
          />
          <span className="text-muted-foreground">to</span>
          <Input
            type="time"
            value={formData.workingHoursTo}
            onChange={(e) => setFormData({ ...formData, workingHoursTo: e.target.value })}
          />
        </div>
      </div>

      <div>
        <label className="flex items-center gap-2 text-sm font-medium text-foreground mb-2">
          <MapPin className="w-4 h-4 text-primary" />
          Garage Location
        </label>
        <Textarea
          placeholder="Enter your complete garage address"
          value={formData.location}
          onChange={(e) => setFormData({ ...formData, location: e.target.value })}
          className="min-h-[100px] rounded-xl border-2 border-input focus:border-primary"
        />
        <button className="mt-2 text-sm text-primary font-medium flex items-center gap-1.5">
          <MapPin className="w-4 h-4" />
          Use Current Location
        </button>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-5 animate-fade-in">
      <p className="text-sm text-muted-foreground mb-4">
        Upload clear photos of your documents for verification
      </p>

      {/* Profile Photo */}
      <div className="flex flex-col items-center mb-6">
        <div className="w-24 h-24 rounded-full bg-secondary border-2 border-dashed border-border flex items-center justify-center mb-3 overflow-hidden">
          {formData.profilePhoto ? (
            <img
              src={URL.createObjectURL(formData.profilePhoto)}
              alt="Profile"
              className="w-full h-full object-cover"
            />
          ) : (
            <Camera className="w-8 h-8 text-muted-foreground" />
          )}
        </div>
        <label className="text-sm text-primary font-medium cursor-pointer">
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              if (e.target.files?.[0]) {
                setFormData({ ...formData, profilePhoto: e.target.files[0] });
              }
            }}
          />
          Upload Profile Photo
        </label>
      </div>

      {/* ID Proof */}
      <div>
        <label className="flex items-center gap-2 text-sm font-medium text-foreground mb-2">
          <FileText className="w-4 h-4 text-primary" />
          ID Proof (Aadhar/PAN)
        </label>
        <label className="flex items-center justify-center gap-3 h-14 rounded-xl border-2 border-dashed border-border bg-secondary/30 cursor-pointer hover:border-primary/50 transition-colors">
          <input
            type="file"
            accept="image/*,.pdf"
            className="hidden"
            onChange={(e) => {
              if (e.target.files?.[0]) {
                setFormData({ ...formData, idProof: e.target.files[0] });
              }
            }}
          />
          {formData.idProof ? (
            <span className="flex items-center gap-2 text-success font-medium">
              <Check className="w-5 h-5" />
              {formData.idProof.name}
            </span>
          ) : (
            <span className="flex items-center gap-2 text-muted-foreground">
              <Upload className="w-5 h-5" />
              Choose file
            </span>
          )}
        </label>
      </div>

      {/* Garage License */}
      <div>
        <label className="flex items-center gap-2 text-sm font-medium text-foreground mb-2">
          <FileText className="w-4 h-4 text-primary" />
          Garage License
        </label>
        <label className="flex items-center justify-center gap-3 h-14 rounded-xl border-2 border-dashed border-border bg-secondary/30 cursor-pointer hover:border-primary/50 transition-colors">
          <input
            type="file"
            accept="image/*,.pdf"
            className="hidden"
            onChange={(e) => {
              if (e.target.files?.[0]) {
                setFormData({ ...formData, garageLicense: e.target.files[0] });
              }
            }}
          />
          {formData.garageLicense ? (
            <span className="flex items-center gap-2 text-success font-medium">
              <Check className="w-5 h-5" />
              {formData.garageLicense.name}
            </span>
          ) : (
            <span className="flex items-center gap-2 text-muted-foreground">
              <Upload className="w-5 h-5" />
              Choose file
            </span>
          )}
        </label>
      </div>
    </div>
  );

  return (
    <div className="mobile-container flex flex-col min-h-screen">
      {/* Header */}
      <div className="page-padding flex items-center gap-4">
        <button
          onClick={handleBack}
          className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center"
        >
          <ArrowLeft className="w-5 h-5 text-foreground" />
        </button>
        <div>
          <h1 className="font-heading font-bold text-xl text-foreground">Registration</h1>
          <p className="text-sm text-muted-foreground">Step {step} of 3</p>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="page-padding pb-0">
        <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
          <div
            className="h-full bg-primary transition-all duration-300"
            style={{ width: `${(step / 3) * 100}%` }}
          />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 page-padding overflow-y-auto hide-scrollbar">
        {step === 1 && renderStep1()}
        {step === 2 && renderStep2()}
        {step === 3 && renderStep3()}
      </div>

      {/* CTA */}
      <div className="page-padding pb-8">
        <Button
          variant="accent"
          size="xl"
          className="w-full"
          onClick={step === 3 ? handleSubmit : handleNext}
          disabled={isLoading}
        >
          {isLoading ? "Submitting..." : step === 3 ? "Submit for Verification" : "Continue"}
        </Button>
      </div>
    </div>
  );
}
