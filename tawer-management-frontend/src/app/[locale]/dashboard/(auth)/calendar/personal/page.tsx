import { generateMeta } from "@/lib/utils";
import { Metadata } from "next";
import { getTranslations } from "next-intl/server";

import EventCalendarApp from "@/modules/events/components/calendar/event-calendar-app";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("metadata.calendarPersonal");

  return generateMeta({
    title: t("title"),
    description: t("description"),
    canonical: "/apps/calendar"
  });
}

export default function Page() {
  return <EventCalendarApp type="personalEvent" />;
}
