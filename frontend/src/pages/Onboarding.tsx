import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Calendar, AlertTriangle, BarChart3, BadgeCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { OnboardingSlide } from "@/components/OnboardingSlide";
import { cn } from "@/lib/utils";

const slides = [
  {
    icon: <Calendar className="w-32 h-32" strokeWidth={1.5} />,
    title: "Get Instant Bookings",
    description: "Receive booking requests from nearby car owners looking for your expertise.",
  },
  {
    icon: <AlertTriangle className="w-32 h-32" strokeWidth={1.5} />,
    title: "Handle Emergencies",
    description: "Be the hero for stranded drivers with quick emergency breakdown assistance.",
  },
  {
    icon: <BarChart3 className="w-32 h-32" strokeWidth={1.5} />,
    title: "Track All Bookings",
    description: "Manage your appointments, track earnings, and grow your business smoothly.",
  },
  {
    icon: <BadgeCheck className="w-32 h-32" strokeWidth={1.5} />,
    title: "Verified Profile",
    description: "Build trust with customers through your verified mechanic profile.",
  },
];

export default function Onboarding() {
  const navigate = useNavigate();
  const [currentSlide, setCurrentSlide] = useState(0);

  const handleNext = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(currentSlide + 1);
    } else {
      navigate("/auth");
    }
  };

  const handleSkip = () => {
    navigate("/auth");
  };

  return (
    <div className="mobile-container flex flex-col min-h-screen">
      {/* Skip Button */}
      <div className="flex justify-end p-5">
        <button
          onClick={handleSkip}
          className="text-muted-foreground text-sm font-medium hover:text-primary transition-colors"
        >
          Skip
        </button>
      </div>

      {/* Slides */}
      <div className="flex-1 flex items-center justify-center">
        <div className="relative w-full h-[400px]">
          {slides.map((slide, index) => (
            <div
              key={index}
              className={cn(
                "absolute inset-0 flex items-center justify-center",
                index === currentSlide ? "pointer-events-auto" : "pointer-events-none"
              )}
            >
              <OnboardingSlide
                icon={slide.icon}
                title={slide.title}
                description={slide.description}
                isActive={index === currentSlide}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Indicators & CTA */}
      <div className="p-8 space-y-6">
        {/* Dots */}
        <div className="flex items-center justify-center gap-2">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={cn(
                "w-2 h-2 rounded-full transition-all duration-300",
                index === currentSlide
                  ? "w-8 bg-primary"
                  : "bg-border hover:bg-muted-foreground"
              )}
            />
          ))}
        </div>

        {/* CTA Button */}
        <Button
          variant="accent"
          size="xl"
          className="w-full"
          onClick={handleNext}
        >
          {currentSlide === slides.length - 1 ? "Get Started" : "Next"}
        </Button>
      </div>
    </div>
  );
}
