import { MapPin, Wrench } from "lucide-react";

interface TopBarProps {
  location?: string;
}

export function TopBar({ location = "Koramangala, Bangalore" }: TopBarProps) {
  return (
    <header className="sticky top-0 z-40 bg-card/95 backdrop-blur-sm border-b border-border">
      <div className="page-padding flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
            <Wrench className="w-5 h-5 text-primary-foreground" />
          </div>
          <span className="font-heading font-bold text-lg text-foreground">MechPro</span>
        </div>
        
        <div className="flex items-center gap-1.5 text-muted-foreground">
          <MapPin className="w-4 h-4 text-primary" />
          <span className="text-sm font-medium truncate max-w-[140px]">{location}</span>
        </div>
      </div>
    </header>
  );
}
