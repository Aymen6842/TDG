"use client";

import { BadgeCheck, Bell, LogOut, Settings } from "lucide-react";
import { useTranslations } from "next-intl";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import Link from "next/link";
import useUser from "@/modules/auth/hooks/users/use-user";
import { logout } from "@/modules/auth/utils/log-out";
import { useRouter } from "next/navigation";
import UserProfileImage from "@/modules/users/components/profile-image";
import useAttendance from "@/modules/tracking/hook/work-sessions/use-attendance";

export default function UserMenu() {
  const t = useTranslations("shared.header.userMenu");
  const router = useRouter();

  const { user, isLoading } = useUser();
  const { checkOut } = useAttendance();

  const onClickLogout = async () => {
    await checkOut();
    logout();
    router.push("/login");
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        {user && (
          <div className="cursor-pointer">
            <UserProfileImage name={user.name} image={user.image} isOnline size="sm" />
          </div>
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-(--radix-dropdown-menu-trigger-width) min-w-60" align="end">
        <DropdownMenuLabel className="p-0">
          <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
            <Avatar>
              <AvatarImage
                src={user && user.image ? user.image : undefined}
                alt={user?.name || "User"}
              />
              <AvatarFallback className="rounded-lg">
                {isLoading
                  ? "..."
                  : user && user.image
                    ? user.image
                    : user && user.name
                      ? user.name.charAt(0)?.toLocaleUpperCase()
                      : ""}
              </AvatarFallback>
            </Avatar>
            <div className="grid flex-1 text-left text-sm leading-tight">
              <span className="truncate font-semibold">{user?.name || t("defaultName")}</span>
              <span className="text-muted-foreground truncate text-xs">
                {user?.email || t("defaultEmail")}
              </span>
            </div>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem asChild>
            <Link href="/dashboard/users/profile/me">
              <BadgeCheck />
              {t("myAccount")}
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href="/dashboard/account-settings/account">
              <Settings />
              {t("accountSettings")}
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href="/dashboard/account-settings/notifications">
              <Bell />
              {t("notifications")}
            </Link>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={onClickLogout}>
          <LogOut />
          {t("logout")}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
