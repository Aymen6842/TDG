"use client";
import useCurrentUser from "@/modules/auth/hooks/users/use-user";
import { ProfilePage } from "@/modules/users/components/user-profile";

export default function CurrentUserProfilePageRender() {
  const { user, isLoading } = useCurrentUser();

  return <ProfilePage user={user} isLoading={isLoading} isMyProfile />;
}
