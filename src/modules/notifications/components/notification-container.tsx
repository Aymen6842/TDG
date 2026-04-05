"use client";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ClockIcon } from "lucide-react";
import { NotificationType } from "../types";
import { useLanguages } from "@/hooks/use-languages";
import { formatRelativeDate } from "@/utils/format-period";

interface Props {
  notification: NotificationType;
}

export default function NotificationContainer({ notification }: Props) {
  const { currentLanguage } = useLanguages();
  return notification.href ? (
    <Link
      href={notification.href}
      className="group hover:bg-muted/50 flex cursor-pointer items-start gap-4 rounded-xl border px-4 py-4 transition-colors last:border-0">
      {/* Avatar Section */}
      <div className="flex-none">
        <Avatar className="size-10 border">
          {notification.image && <AvatarImage src={notification.image} alt={notification.title} />}
          <AvatarFallback className="bg-primary/10 text-primary">
            {notification.title.charAt(0)}
          </AvatarFallback>
        </Avatar>
      </div>

      {/* Content Section */}
      <div className="flex flex-1 flex-col gap-1.5">
        <div className="flex items-center justify-between gap-2">
          <div
            className={`truncate text-sm font-semibold ${notification.unread ? "text-foreground" : "text-muted-foreground"}`}>
            {notification.title}
          </div>
          {notification.unread && <span className="bg-destructive h-2 w-2 rounded-full" />}
        </div>

        <div className="text-muted-foreground line-clamp-2 text-xs leading-relaxed">
          {notification.description}
        </div>

        {/* Timestamp */}
        <div className="text-muted-foreground/60 mt-1 flex items-center gap-1 text-[10px] font-medium tracking-wider uppercase">
          <ClockIcon className="size-3" />
          {formatRelativeDate(notification.createdAt, currentLanguage.code)}
        </div>
      </div>
    </Link>
  ) : <div

    className="group hover:bg-muted/50 flex cursor-pointer items-start gap-4 rounded-xl border px-4 py-4 transition-colors last:border-0">
    {/* Avatar Section */}
    <div className="flex-none">
      <Avatar className="size-10 border">
        {notification.image && <AvatarImage src={notification.image} alt={notification.title} />}
        <AvatarFallback className="bg-primary/10 text-primary">
          {notification.title.charAt(0)}
        </AvatarFallback>
      </Avatar>
    </div>

    {/* Content Section */}
    <div className="flex flex-1 flex-col gap-1.5">
      <div className="flex items-center justify-between gap-2">
        <div
          className={`text-sm font-semibold max-w-full  ${notification.unread ? "text-foreground" : "text-muted-foreground"}`}>
          {notification.title}
        </div>
        {notification.unread && <span className="bg-destructive h-2 w-2 rounded-full" />}
      </div>

      <div className="text-muted-foreground text-xs leading-relaxed">
        {notification.description}
      </div>

      {/* Timestamp */}
      <div className="text-muted-foreground/60 mt-1 flex items-center gap-1 text-[10px] font-medium tracking-wider uppercase">
        <ClockIcon className="size-3" />
        {formatRelativeDate(notification.createdAt, currentLanguage.code)}
      </div>
    </div>
  </div>;
}
