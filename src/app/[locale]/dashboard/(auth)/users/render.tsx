"use client";
import UsersList from "@/modules/users/components/users-list";
import UploadUserDialog from "@/modules/users/components/upload";
import { useTranslations } from "next-intl";
import useCurrentUser from "@/modules/auth/hooks/users/use-user";
import Loading from "@/components/page-loader";
import { hasPermissions } from "@/modules/auth/utils/users-permissions";
import AccessDenied from "@/components/error/access-denied";

export default function UsersPageRender() {
  const t = useTranslations("modules.users");
  const { user, isLoading } = useCurrentUser();

  if (isLoading) return <Loading />;

  if (user && !hasPermissions(user.roles, "usersManagement", "view")) return <AccessDenied />;

  return (
    <>
      <div className="flex items-center justify-between space-y-2">
        <h1 className="text-2xl font-bold tracking-tight">{t("title")}</h1>
        {user && hasPermissions(user.roles, "usersManagement", "add") && <UploadUserDialog />}
      </div>
      <div className="pt-5">
        <UsersList />
      </div>
    </>
  );
}
