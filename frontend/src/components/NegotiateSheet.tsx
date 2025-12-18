import { useState } from "react";
import { X, Calendar, Clock, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

interface NegotiateSheetProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { date: string; time: string; note: string }) => void;
  customerName: string;
}

export function NegotiateSheet({
  isOpen,
  onClose,
  onSubmit,
  customerName,
}: NegotiateSheetProps) {
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [note, setNote] = useState("");

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-foreground/30 backdrop-blur-sm z-50"
        onClick={onClose}
      />

      {/* Sheet */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-card rounded-t-3xl animate-slide-up safe-bottom">
        <div className="max-w-md mx-auto p-5">
          {/* Handle */}
          <div className="w-12 h-1.5 bg-border rounded-full mx-auto mb-4" />

          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-heading font-bold text-xl text-foreground">
              Negotiate Time
            </h3>
            <button
              onClick={onClose}
              className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center"
            >
              <X className="w-5 h-5 text-muted-foreground" />
            </button>
          </div>

          <p className="text-sm text-muted-foreground mb-6">
            Propose a new time slot for <span className="font-semibold text-foreground">{customerName}</span>
          </p>

          {/* Form */}
          <div className="space-y-4">
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-foreground mb-2">
                <Calendar className="w-4 h-4 text-primary" />
                Preferred Date
              </label>
              <Input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full"
              />
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-foreground mb-2">
                <Clock className="w-4 h-4 text-primary" />
                Preferred Time
              </label>
              <Input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full"
              />
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-foreground mb-2">
                <MessageSquare className="w-4 h-4 text-primary" />
                Note (Optional)
              </label>
              <Textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Add a message for the customer..."
                className="min-h-[80px] rounded-xl border-2 border-input focus:border-primary"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 mt-6">
            <Button variant="outline" className="flex-1" onClick={onClose}>
              Cancel
            </Button>
            <Button
              variant="default"
              className="flex-1"
              onClick={() => {
                onSubmit({ date, time, note });
                onClose();
              }}
              disabled={!date || !time}
            >
              Send Proposal
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
