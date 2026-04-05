"use client";

import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface ColorPickerProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  foregroundValue?: string;
  onForegroundChange?: (value: string) => void;
  showForeground?: boolean;
  className?: string;
  placeholder?: string;
  foregroundPlaceholder?: string;
}

export function ColorPicker({
  label,
  value,
  onChange,
  foregroundValue,
  onForegroundChange,
  showForeground = false,
  className,
  placeholder = "#000000",
  foregroundPlaceholder = "#ffffff"
}: ColorPickerProps) {
  return (
    <div className={cn("space-y-3", className)}>
      <Label className="text-sm font-medium">{label}</Label>

      {/* Main Color */}
      <div className="space-y-2">
        <Label htmlFor={`${label}-main`} className="text-muted-foreground text-xs">
          Main Color
        </Label>
        <div className="flex gap-2">
          <Input
            id={`${label}-main`}
            type="color"
            value={value || placeholder}
            onChange={(e) => onChange(e.target.value)}
            className="h-10 w-10 cursor-pointer border-none p-0"
          />
          <Input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="h-9 flex-1 font-mono text-xs"
            placeholder={placeholder}
          />
        </div>
      </div>

      {/* Foreground Color */}
      {showForeground && onForegroundChange && (
        <div className="space-y-2">
          <Label htmlFor={`${label}-foreground`} className="text-muted-foreground text-xs">
            Foreground Color (Text on {label})
          </Label>
          <div className="flex gap-2">
            <Input
              id={`${label}-foreground`}
              type="color"
              value={foregroundValue || foregroundPlaceholder}
              onChange={(e) => onForegroundChange(e.target.value)}
              className="h-10 w-10 cursor-pointer border-none p-0"
            />
            <Input
              type="text"
              value={foregroundValue}
              onChange={(e) => onForegroundChange(e.target.value)}
              className="flex-1 font-mono text-xs"
              placeholder={foregroundPlaceholder}
            />
          </div>
        </div>
      )}

      {/* Preview */}
      <div
        className="rounded-md border p-3"
        style={{
          backgroundColor: value || placeholder,
          color: foregroundValue || foregroundPlaceholder
        }}>
        <p className="text-sm font-medium">Preview</p>
        <p className="text-xs opacity-90">Text appearance on this background</p>
      </div>
    </div>
  );
}
