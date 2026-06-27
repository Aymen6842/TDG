import { generateMeta } from "@/lib/utils";
import { Metadata } from "next";

import EventCalendarApp from "@/modules/events/components/calendar/event-calendar-app";

export async function generateMetadata(): Promise<Metadata> {
  return generateMeta({
    title: "Event Calendar",
    description:
      "Plan your events or tasks in an organized way with the Calendar app template. Built with shadcn/ui, Next.js, Tailwind CSS ve React.",
    canonical: "/apps/calendar"
  });
}

export default function Page() {
  return <EventCalendarApp type="personalEvent" />;
}
