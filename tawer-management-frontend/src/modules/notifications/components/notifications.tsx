"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import NotificationContainer from "./notification-container";
import useNotifications from "../hook/use-notifications";
import Loading from "@/components/page-loader";
import { BellOff } from "lucide-react";
import { useEffect } from "react";

export default function UserNotifications() {
  const t = useTranslations("modules.notifications");
  const paginationContent = useTranslations("shared.pagination");

  const {
    setPage,
    page,
    pagesNumber,
    records,
    notifications,
    notificationsAreLoading,
    markNotificationsAsSeen
  } = useNotifications({});

  useEffect(() => {
    if (notifications) markNotificationsAsSeen();
  }, [notifications]);

  if (notificationsAreLoading) {
    return <Loading />;
  }

  return (
    <Card className="mx-auto w-full max-w-2xl">
      <CardHeader>
        <CardTitle className="text-lg font-medium">{t("title")}</CardTitle>
      </CardHeader>

      <CardContent className="space-y-2 p-0 px-4">
        {/* 🔴 Empty state */}
        {!notifications ||
          (notifications.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <BellOff className="text-muted-foreground mb-3 h-8 w-8" />
              <p className="text-muted-foreground text-sm">{t("empty")}</p>
            </div>
          ))}

        {/* 🟢 Notifications list */}
        {notifications?.map((item) => (
          <NotificationContainer notification={item} key={item.id} />
        ))}

        {/* Pagination (only if there are records) */}
        {notifications && notifications.length > 0 && (
          <div className="flex items-center justify-end space-x-2 px-4 pt-3">
            <div className="text-muted-foreground flex-1 text-sm">
              {paginationContent.rich("selected", {
                page,
                pages: pagesNumber,
                records
              })}
            </div>

            <div className="space-x-2">
              <Button
                variant="outline"
                size="sm"
                disabled={page === 1}
                onClick={() => setPage(page - 1)}>
                {paginationContent("previous")}
              </Button>

              <Button
                variant="outline"
                size="sm"
                disabled={page === pagesNumber}
                onClick={() => setPage(page + 1)}>
                {paginationContent("next")}
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
