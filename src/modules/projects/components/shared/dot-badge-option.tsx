import { cn } from "@/lib/utils";
import { SelectItem } from "@/components/ui/select";
import { Toggle } from "@/components/ui/toggle";

interface DotBadgeSelectItemProps {
  value: string;
  dotColorClass: string;
  label: string;
}

export function DotBadgeSelectItem({ value, dotColorClass, label }: DotBadgeSelectItemProps) {
  return (
    <SelectItem value={value}>
      <div className="flex items-center gap-2">
        <span className={cn("size-2 rounded-full", dotColorClass)} />
        {label}
      </div>
    </SelectItem>
  );
}

interface DotBadgeToggleProps {
  value: string;
  dotColorClass: string;
  label: string;
  pressed: boolean;
  onPressedChange: (pressed: boolean) => void;
}

export function DotBadgeToggle({ value, dotColorClass, label, pressed, onPressedChange }: DotBadgeToggleProps) {
  return (
    <Toggle
      variant="outline"
      pressed={pressed}
      onPressedChange={onPressedChange}
      data-value={value}
    >
      <span className={cn("size-2 rounded-full", dotColorClass)} />
      {label}
    </Toggle>
  );
}
