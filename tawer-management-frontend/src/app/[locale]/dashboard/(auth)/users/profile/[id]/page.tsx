import { Metadata } from "next";
import { generateMeta } from "@/lib/utils";
import UserProfilePageRender from "./render";

export async function generateMetadata(): Promise<Metadata> {
  return generateMeta({
    title: "User Profile",
    description:
      "A page within a dashboard that shows detailed user information, profile settings, and recent activity. Built with shadcn/ui, Tailwind CSS, Next.js and React. Typescript is included.",
    canonical: "/pages/profile-v2"
  });
}

interface Props {
  params: Promise<{ id: string }>;
}

export default async function Page({ params }: Props) {
  const { id } = await params;

  return <UserProfilePageRender id={id} />;
}
