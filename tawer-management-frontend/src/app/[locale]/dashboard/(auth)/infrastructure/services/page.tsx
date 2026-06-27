import { generateMeta } from "@/lib/utils";

import ServicesPageRender from "./render";

export async function generateMetadata() {
  return generateMeta({
    title: "Services List",
    description:
      "A list of services",
    canonical: "/dashboard/infrastructure/services"
  });
}

export default function Page() {
  return <ServicesPageRender />;
}
