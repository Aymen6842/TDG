"use client";
import { BellIcon, BellOff, ClockIcon } from "lucide-react";
import Link from "next/link";
import { useIsMobile } from "@/hooks/use-mobile";
import { useTranslations } from "next-intl";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";

import useNotifications from "@/modules/notifications/hook/use-notifications";
import { useLanguages } from "@/hooks/use-languages";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatRelativeDate } from "@/utils/format-period";

const NavbarNotificationsDropdown = () => {
  const isMobile = useIsMobile();
  const t = useTranslations("shared.header.notifications");
  const { currentLanguage } = useLanguages();

  const { notifications, notificationsAreLoading, markNotificationsAsSeen } = useNotifications({});
  const unseenNotificationsNumber = notifications ? notifications.filter(not => not.unread).length : 0

  return (
    <DropdownMenu
      onOpenChange={(open) => {
        if (open) markNotificationsAsSeen();
      }}>
      <DropdownMenuTrigger asChild>
        <Button size="icon" variant="ghost" className="relative">
          <>
            <BellIcon className="animate-tada" />
            {unseenNotificationsNumber > 0 && (
              <span className="bg-destructive absolute end-0 top-0 block size-2 shrink-0 rounded-full"></span>
            )}
          </>
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align={isMobile ? "center" : "end"} className="ms-4 max-w-80 p-0">
        <DropdownMenuLabel className="bg-background dark:bg-muted sticky top-0 z-10 p-0">
          <div className="flex justify-between border-b px-6 py-4">
            <div className="font-medium">{t("title")}</div>
            <Button variant="link" className="h-auto p-0 text-xs" size="sm" asChild>
              <Link href="/dashboard/notifications">{t("viewAll")}</Link>
            </Button>
          </div>
        </DropdownMenuLabel>

        <ScrollArea className="h-[350px] w-80">
          {!notifications || notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <BellOff className="text-muted-foreground mb-3 h-8 w-8" />
              <p className="text-muted-foreground text-sm">{t("empty")}</p>
            </div>
          ) : (
            <>
              {notifications.map((item, key) => (
                <DropdownMenuItem
                  key={key}
                  className="w-full group flex cursor-pointer items-start gap-9 rounded-none border-b px-4 py-3">
                  <div className="flex flex-1 items-start gap-2">
                    <div className="flex-none">
                      <Avatar className="size-8">
                        <AvatarImage src={item.image} />
                        <AvatarFallback> {item.title.charAt(0)}</AvatarFallback>
                      </Avatar>
                    </div>
                    <div className="flex flex-1 flex-col gap-1">
                      <div className="dark:group-hover:text-default-800 max-w-60 truncate text-sm font-medium">
                        {item.title}
                      </div>
                      <div className="dark:group-hover:text-default-700 text-muted-foreground line-clamp-1 text-xs">
                        {item.description}
                      </div>

                      <div className="dark:group-hover:text-default-500 text-muted-foreground flex items-center gap-1 text-xs">
                        <ClockIcon className="size-3!" />
                        {formatRelativeDate(item.createdAt, currentLanguage.code)}
                      </div>
                    </div>
                  </div>
                  {item.unread && (
                    <div className="flex-0">
                      <span className="bg-destructive/80 block size-2 rounded-full border" />
                    </div>
                  )}
                </DropdownMenuItem>
              ))}
            </>
          )}
        </ScrollArea>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default NavbarNotificationsDropdown;
