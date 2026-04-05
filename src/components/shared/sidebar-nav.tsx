"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";
import { usePathname } from "next/navigation";
import {
  Building2Icon,
  PaletteIcon,
  FileTextIcon,
  UsersIcon,
  UserIcon,
  CreditCardIcon,
  BellIcon,
  ShieldIcon,
  LucideIcon,
  Settings
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

type NavItem = {
  title: string;
  href: string;
  icon?: string;
  disabled?: boolean;
};

const iconMap: Record<string, LucideIcon> = {
  Building2Icon,
  PaletteIcon,
  FileTextIcon,
  UsersIcon,
  UserIcon,
  CreditCardIcon,
  BellIcon,
  ShieldIcon,
  Settings
};

interface SidebarNavProps {
  navItems: NavItem[];
}

export function SidebarNav({ navItems }: SidebarNavProps) {
  const pathname = usePathname();

  return (
    <Card className="py-0">
      <CardContent className="p-2">
        <nav className="flex flex-col space-y-0.5 space-x-2 lg:space-x-0">
          {navItems.map((item) => {
            const Icon = item.icon ? iconMap[item.icon] : null;
            return (
              <Button
                key={item.href}
                variant="ghost"
                disabled={item.disabled}
                className={cn(
                  "hover:bg-muted justify-start",
                  pathname.endsWith(item.href) ? "bg-muted hover:bg-muted" : "",
                  item.disabled ? "pointer-events-none cursor-not-allowed opacity-50" : ""
                )}
                asChild={!item.disabled}>
                {item.disabled ? (
                  <div className="flex gap-2  -ms-1">
                    {Icon && <Icon />}
                    {item.title}
                  </div>
                ) : (
                  <Link href={item.href}>
                    {Icon && <Icon />}
                    {item.title}
                  </Link>
                )}
              </Button>
            );
          })}
        </nav>
      </CardContent>
    </Card>
  );
}
