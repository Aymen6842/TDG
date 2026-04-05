import { ForwardRefExoticComponent, RefAttributes } from "react";
import { UsedDevice } from "../types";
import { Smartphone, Monitor, Tablet, HelpCircle, LucideProps } from "lucide-react";

export const deviceConfig: Record<UsedDevice, { label: string, icon: ForwardRefExoticComponent<Omit<LucideProps, "ref"> & RefAttributes<SVGSVGElement>> }> = {
  MOBILE: {
    label: "mobile",
    icon: Smartphone,
  },
  DESKTOP: {
    label: "desktop",
    icon: Monitor,
  },
  TABLET: {
    label: "tablet",
    icon: Tablet,
  },
  OTHER: {
    label: "other",
    icon: HelpCircle,
  },
} as const;


export function getDeviceType(): UsedDevice {
  const ua = navigator.userAgent.toLowerCase();

  if (/mobile|iphone|ipod|android|blackberry|windows phone/.test(ua)) {
    return "MOBILE";
  }

  if (/tablet|ipad|playbook|silk/.test(ua)) {
    return "TABLET";
  }

  return "DESKTOP";
}
