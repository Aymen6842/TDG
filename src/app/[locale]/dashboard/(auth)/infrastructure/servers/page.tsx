import { generateMeta } from "@/lib/utils";

import ServersPageRender from "./render";

export async function generateMetadata() {
  return generateMeta({
    title: "Servers List",
    description:
      "A list of servers",
    canonical: "/dashboard/infrastructure/servers"
  });
}

export default function Page() {
  return <ServersPageRender />;
}
