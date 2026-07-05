import { getTranslations } from "next-intl/server";
import { generateMeta } from "@/lib/utils";

import UsersPageRender from "./render";

export async function generateMetadata() {
  const t = await getTranslations("metadata.usersList");

  return generateMeta({
    title: t("title"),
    description: t("description"),
    canonical: "/pages/users"
  });
}

export default function Page() {
  return <UsersPageRender />;
}
