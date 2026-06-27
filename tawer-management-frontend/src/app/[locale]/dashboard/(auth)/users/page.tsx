import { generateMeta } from "@/lib/utils";

import UsersPageRender from "./render";

export async function generateMetadata() {
  return generateMeta({
    title: "Users List",
    description:
      "A list of users in the dashboard, where you can view and manage user accounts, including their details.",
    canonical: "/pages/users"
  });
}

export default function Page() {
  return <UsersPageRender />;
}
