import { useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

interface DeclineEmergencySheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirmDecline: (reason: string, notes: string) => void;
}

const declineReasons = [
  { id: "too_far", label: "Location too far" },
  { id: "busy", label: "Currently busy with another job" },
  { id: "no_tools", label: "Don't have required tools/parts" },
  { id: "vehicle_issue", label: "Vehicle/transport issue" },
  { id: "personal", label: "Personal emergency" },
  { id: "other", label: "Other reason" },
];

export function DeclineEmergencySheet({
  open,
  onOpenChange,
  onConfirmDecline,
}: DeclineEmergencySheetProps) {
  const [selectedReason, setSelectedReason] = useState("");
  const [additionalNotes, setAdditionalNotes] = useState("");

  const handleConfirm = () => {
    if (!selectedReason) return;
    const reasonLabel = declineReasons.find((r) => r.id === selectedReason)?.label || "";
    onConfirmDecline(reasonLabel, additionalNotes);
    setSelectedReason("");
    setAdditionalNotes("");
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="rounded-t-3xl">
        <SheetHeader className="text-left mb-4">
          <SheetTitle className="text-destructive">Decline Emergency</SheetTitle>
          <SheetDescription>
            Please select a reason for declining this emergency request.
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-4">
          <RadioGroup value={selectedReason} onValueChange={setSelectedReason}>
            {declineReasons.map((reason) => (
              <div
                key={reason.id}
                className="flex items-center space-x-3 p-3 rounded-xl bg-secondary/50 border border-border/50"
              >
                <RadioGroupItem value={reason.id} id={reason.id} />
                <Label htmlFor={reason.id} className="flex-1 cursor-pointer">
                  {reason.label}
                </Label>
              </div>
            ))}
          </RadioGroup>

          {selectedReason === "other" && (
            <Textarea
              placeholder="Please specify the reason..."
              value={additionalNotes}
              onChange={(e) => setAdditionalNotes(e.target.value)}
              className="min-h-[80px]"
            />
          )}

          <div className="flex gap-3 pt-2">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              className="flex-1"
              onClick={handleConfirm}
              disabled={!selectedReason}
            >
              Confirm Decline
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
