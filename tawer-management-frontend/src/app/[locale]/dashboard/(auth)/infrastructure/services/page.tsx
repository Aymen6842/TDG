import { getTranslations } from "next-intl/server";
import { generateMeta } from "@/lib/utils";

import ServicesPageRender from "./render";

export async function generateMetadata() {
  const t = await getTranslations("metadata.servicesList");

  return generateMeta({
    title: t("title"),
    description: t("description"),
    canonical: "/dashboard/infrastructure/services"
  });
}

export default function Page() {
  return <ServicesPageRender />;
}
