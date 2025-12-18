import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";

interface Part {
  id: string;
  name: string;
  checked: boolean;
}

interface PartsRequiredSectionProps {
  parts: Part[];
  onPartsChange: (parts: Part[]) => void;
  partsRequested: boolean;
  onRequestParts: () => void;
}

const defaultParts: Part[] = [
  { id: "1", name: "Engine Oil", checked: false },
  { id: "2", name: "Oil Filter", checked: false },
  { id: "3", name: "Air Filter", checked: false },
  { id: "4", name: "Brake Pads", checked: false },
  { id: "5", name: "Spark Plugs", checked: false },
];

export { defaultParts };

export function PartsRequiredSection({
  parts,
  onPartsChange,
  partsRequested,
  onRequestParts,
}: PartsRequiredSectionProps) {
  const [newPart, setNewPart] = useState("");

  const togglePart = (partId: string) => {
    onPartsChange(
      parts.map((p) => (p.id === partId ? { ...p, checked: !p.checked } : p))
    );
  };

  const addPart = () => {
    if (newPart.trim()) {
      onPartsChange([
        ...parts,
        { id: Date.now().toString(), name: newPart.trim(), checked: true },
      ]);
      setNewPart("");
    }
  };

  const removePart = (partId: string) => {
    onPartsChange(parts.filter((p) => p.id !== partId));
  };

  const selectedCount = parts.filter((p) => p.checked).length;

  return (
    <div>
      <h3 className="font-heading font-semibold text-foreground mb-3">
        Parts Required
      </h3>
      <div className="space-y-2 mb-3">
        {parts.map((part) => (
          <div
            key={part.id}
            className="flex items-center justify-between bg-card rounded-xl p-3 border border-border/50"
          >
            <div className="flex items-center gap-3">
              <Checkbox
                id={part.id}
                checked={part.checked}
                onCheckedChange={() => togglePart(part.id)}
                disabled={partsRequested}
              />
              <label
                htmlFor={part.id}
                className="text-sm text-foreground cursor-pointer"
              >
                {part.name}
              </label>
            </div>
            {!partsRequested && (
              <button
                onClick={() => removePart(part.id)}
                className="text-muted-foreground hover:text-destructive transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        ))}
      </div>

      {/* Add Part */}
      {!partsRequested && (
        <div className="flex gap-2 mb-3">
          <Input
            placeholder="Add new part..."
            value={newPart}
            onChange={(e) => setNewPart(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addPart()}
            className="flex-1"
          />
          <Button variant="secondary" size="icon" onClick={addPart}>
            <Plus className="w-5 h-5" />
          </Button>
        </div>
      )}

      {/* Request Parts Button */}
      {selectedCount > 0 && (
        <Button
          variant={partsRequested ? "secondary" : "default"}
          size="lg"
          className="w-full"
          onClick={onRequestParts}
          disabled={partsRequested}
        >
          {partsRequested ? (
            <>
              <span className="text-success">✓</span>
              <span className="ml-2">Parts Requested ({selectedCount})</span>
            </>
          ) : (
            `Request Parts (${selectedCount})`
          )}
        </Button>
      )}
    </div>
  );
}
