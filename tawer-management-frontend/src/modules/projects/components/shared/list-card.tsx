import React from "react";

interface ListCardProps {
  avatar: React.ReactNode;
  primary: string;
  secondary: React.ReactNode;
  badge: React.ReactNode;
  actions: React.ReactNode;
}

export function ListCard({ avatar, primary, secondary, badge, actions }: ListCardProps) {
  return (
    <div className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/30 transition-colors">
      <div className="flex items-center gap-3">
        {avatar}
        <div className="flex flex-col">
          <span className="text-sm font-medium leading-none">{primary}</span>
          {secondary}
        </div>
      </div>
      <div className="flex items-center gap-2">
        {badge}
        {actions}
      </div>
    </div>
  );
}
