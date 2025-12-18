import { cn } from "@/lib/utils";

interface OnboardingSlideProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  isActive: boolean;
}

export function OnboardingSlide({
  icon,
  title,
  description,
  isActive,
}: OnboardingSlideProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center text-center px-8 transition-all duration-500",
        isActive ? "opacity-100 scale-100" : "opacity-0 scale-95"
      )}
    >
      <div className="w-48 h-48 mb-8 flex items-center justify-center text-primary">
        {icon}
      </div>
      <h2 className="font-heading font-bold text-2xl text-foreground mb-4">
        {title}
      </h2>
      <p className="text-muted-foreground text-base max-w-[280px]">
        {description}
      </p>
    </div>
  );
}
