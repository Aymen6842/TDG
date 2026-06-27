"use client";
import AccessDenied from "@/components/error/access-denied";
import Loading from "@/components/page-loader";
import useCurrentUser from "@/modules/auth/hooks/users/use-user";
import { hasPermissions } from "@/modules/auth/utils/users-permissions";
import { ProfilePage } from "@/modules/users/components/user-profile";
import useUserInfo from "@/modules/users/hooks/extraction/use-user";

interface Props {
  id: string;
}

export default function UserProfilePageRender({ id }: Props) {
  const { user: currentUser, isLoading: currentUserIsLoading } = useCurrentUser();
  const { user, userIsLoading } = useUserInfo({
    id
  });

  if (currentUserIsLoading) return <Loading />;

  if (currentUser && !hasPermissions(currentUser.roles, "usersManagement", "view"))
    return <AccessDenied />;

  return <ProfilePage user={user} isLoading={userIsLoading} />;
}
