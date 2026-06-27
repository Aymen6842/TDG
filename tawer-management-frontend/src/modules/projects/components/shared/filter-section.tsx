import React from "react";

interface FilterSectionProps {
  label: string;
  children: React.ReactNode;
}

export function FilterSection({ label, children }: FilterSectionProps) {
  return (
    <div className="space-y-3">
      <h4 className="text-sm font-medium">{label}</h4>
      {children}
    </div>
  );
}
