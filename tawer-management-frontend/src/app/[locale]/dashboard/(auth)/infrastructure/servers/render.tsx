"use client";;
import { useTranslations } from "next-intl";
import useCurrentUser from "@/modules/auth/hooks/users/use-user";
import Loading from "@/components/page-loader";
import { hasPermissions } from "@/modules/auth/utils/users-permissions";
import AccessDenied from "@/components/error/access-denied";
import ServersList from "@/modules/infrastructure/components/servers/servers-list";
import UploadServerDialog from "@/modules/infrastructure/components/servers/upload";

export default function ServersPageRender() {
  const t = useTranslations("modules.infrastructure.servers");
  const { user, isLoading } = useCurrentUser();

  if (isLoading) return <Loading />;

  if (user && !hasPermissions(user.roles, "serversManagement", "view")) return <AccessDenied />;

  return (
    <>
      <div className="flex items-center justify-between space-y-2">
        <h1 className="text-2xl font-bold tracking-tight">{t("title")}</h1>
        {user && hasPermissions(user.roles, "serversManagement", "add") && <UploadServerDialog />}
      </div>
      <div className="pt-5">
        <ServersList />
      </div>
    </>
  );
}
