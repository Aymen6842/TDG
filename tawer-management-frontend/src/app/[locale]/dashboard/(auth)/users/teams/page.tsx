import { getTranslations } from "next-intl/server";
import { generateMeta } from "@/lib/utils";

import TeamsPageRender from "./render";

export async function generateMetadata() {
  const t = await getTranslations("metadata.teamsList");

  return generateMeta({
    title: t("title"),
    description: t("description"),
    canonical: "/pages/users/teams"
  });
}

export default function Page() {
  return <TeamsPageRender />;
}
