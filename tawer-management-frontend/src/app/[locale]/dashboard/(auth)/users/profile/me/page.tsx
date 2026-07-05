import { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { generateMeta } from "@/lib/utils";
import CurrentUserProfilePageRender from "./render";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("metadata.userProfile");

  return generateMeta({
    title: t("title"),
    description: t("description"),
    canonical: "/pages/profile-v2"
  });
}

export default async function Page() {
  return <CurrentUserProfilePageRender />;
}
