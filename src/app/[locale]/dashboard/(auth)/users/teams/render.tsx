"use client";
import { useTranslations } from "next-intl";
import UploadTeamDialog from "@/modules/users/components/teams/upload";
import TeamsList from "@/modules/users/components/teams/list";
import useCurrentUser from "@/modules/auth/hooks/users/use-user";
import Loading from "@/components/page-loader";
import { hasPermissions } from "@/modules/auth/utils/users-permissions";
import AccessDenied from "@/components/error/access-denied";

export default function TeamsPageRender() {
  const t = useTranslations("modules.users.teams");
  const { user, isLoading } = useCurrentUser();

  if (isLoading) return <Loading />;

  if (user && !hasPermissions(user.roles, "teamsManagement", "view")) return <AccessDenied />;

  return (
    <>
      <div className="flex items-center justify-between space-y-2">
        <h1 className="text-2xl font-bold tracking-tight">{t("title")}</h1>
        {user && hasPermissions(user.roles, "teamsManagement", "add") && <UploadTeamDialog />}
      </div>
      <div className="pt-5">
        <TeamsList />
      </div>
    </>
  );
}
