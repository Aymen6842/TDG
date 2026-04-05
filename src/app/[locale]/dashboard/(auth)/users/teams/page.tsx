import { generateMeta } from "@/lib/utils";

import TeamsPageRender from "./render";

export async function generateMetadata() {
  return generateMeta({
    title: "Teams List",
    description: "The Company teams",
    canonical: "/pages/users/teams"
  });
}

export default function Page() {
  return <TeamsPageRender />;
}
