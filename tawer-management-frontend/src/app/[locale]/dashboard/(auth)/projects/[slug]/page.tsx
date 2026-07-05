import { getTranslations } from "next-intl/server";
import { generateMeta } from "@/lib/utils";
import ProjectDetailRender from "./render";

export async function generateMetadata() {
  const t = await getTranslations("metadata.projectDetails");

  return generateMeta({
    title: t("title"),
    description: t("description"),
    canonical: ""
  });
}

export default async function Page({ params }: { params: { slug: string } }) {
  const { slug } = await params;
  return <ProjectDetailRender slug={slug} />;
}
