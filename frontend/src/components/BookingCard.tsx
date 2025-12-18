import { MapPin, Clock, Car, User, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface BookingData {
  id: string;
  customerName: string;
  vehicleDetails: string;
  distance: string;
  timeSlot: string;
  problemDescription: string;
  isNew?: boolean;
  isEmergency?: boolean;
  status?: "pending" | "accepted" | "in-progress" | "completed";
  bookedOn?: string;
  bookedBy?: string;
  location?: string;
}

interface BookingCardProps {
  booking: BookingData;
  onAccept?: () => void;
  onDecline?: () => void;
  onNegotiate?: () => void;
  onClick?: () => void;
  showActions?: boolean;
  showNegotiate?: boolean;
}

export function BookingCard({
  booking,
  onAccept,
  onDecline,
  onNegotiate,
  onClick,
  showActions = true,
  showNegotiate = true,
}: BookingCardProps) {
  return (
    <div
      className={cn(
        "bg-card rounded-2xl p-4 card-shadow border border-border/50 animate-fade-in",
        onClick && "cursor-pointer hover:border-primary/30 transition-all duration-200",
        booking.isEmergency && "border-l-4 border-l-emergency"
      )}
      onClick={onClick}
    >
      {/* Tags */}
      <div className="flex items-center gap-2 mb-3">
        {booking.isNew && (
          <span className="px-3 py-1 bg-primary/10 text-primary text-xs font-semibold rounded-full">
            New Booking
          </span>
        )}
        {booking.isEmergency && (
          <span className="px-3 py-1 bg-emergency/10 text-emergency text-xs font-semibold rounded-full flex items-center gap-1">
            🚨 Emergency
          </span>
        )}
      </div>

      {/* Customer & Vehicle Info */}
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
        {onClick && (
          <ChevronRight className="w-5 h-5 text-muted-foreground" />
        )}
      </div>

      {/* Distance & Time */}
      <div className="flex items-center gap-4 mb-3">
        <div className="flex items-center gap-1.5 text-sm">
          <MapPin className="w-4 h-4 text-primary" />
          <span className="font-medium text-foreground">{booking.distance}</span>
        </div>
        <div className="flex items-center gap-1.5 text-sm">
          <Clock className="w-4 h-4 text-accent" />
          <span className="text-muted-foreground">{booking.timeSlot}</span>
        </div>
      </div>

      {/* Problem Description */}
      <p className="text-sm text-muted-foreground bg-secondary/50 rounded-xl p-3 mb-4">
        {booking.problemDescription}
      </p>

      {/* Actions */}
      {showActions && (
        <div className="flex items-center gap-2">
          <Button
            variant="default"
            size="sm"
            className="flex-1"
            onClick={(e) => {
              e.stopPropagation();
              onAccept?.();
            }}
          >
            Accept
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="flex-1"
            onClick={(e) => {
              e.stopPropagation();
              onDecline?.();
            }}
          >
            Decline
          </Button>
          {showNegotiate && (
            <Button
              variant="secondary"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onNegotiate?.();
              }}
            >
              Negotiate
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
