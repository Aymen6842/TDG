import { getTranslations } from "next-intl/server";
import { generateMeta } from "@/lib/utils";

import ServersPageRender from "./render";

export async function generateMetadata() {
  const t = await getTranslations("metadata.serversList");

  return generateMeta({
    title: t("title"),
    description: t("description"),
    canonical: "/dashboard/infrastructure/servers"
  });
}

export default function Page() {
  return <ServersPageRender />;
}
