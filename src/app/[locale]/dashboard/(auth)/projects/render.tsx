"use client";;
import { useTranslations } from "next-intl";
import useCurrentUser from "@/modules/auth/hooks/users/use-user";
import Loading from "@/components/page-loader";
import { hasPermissions } from "@/modules/auth/utils/users-permissions";
import AccessDenied from "@/components/error/access-denied";
import ProjectsList from "@/modules/projects/components/projects-list";

export default function ProjectsPageRender() {
  const t = useTranslations("modules.projects");
  const { user, isLoading } = useCurrentUser();

  if (isLoading) return <Loading />;

  if (user && !hasPermissions(user.roles, "projectsManagement", "view")) return <AccessDenied />;

  return (
    <div className="space-y-4">
      <header className="mb-4">
        <h1 className="text-2xl font-bold tracking-tight">{t("title")}</h1>
      </header>
      <ProjectsList />
    </div>
  );
}
