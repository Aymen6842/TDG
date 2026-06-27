import { Metadata } from "next";
import { generateMeta } from "@/lib/utils";
import CurrentUserProfilePageRender from "./render";

export async function generateMetadata(): Promise<Metadata> {
  return generateMeta({
    title: "User Profile",
    description:
      "A page within a dashboard that shows detailed user information, profile settings, and recent activity. Built with shadcn/ui, Tailwind CSS, Next.js and React. Typescript is included.",
    canonical: "/pages/profile-v2"
  });
}

export default async function Page() {
  return <CurrentUserProfilePageRender />;
}
