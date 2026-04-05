"use client";
import { ChevronLeft, FolderKanban, Hourglass, Clock, Smile, CircleGauge } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useLanguages } from "@/hooks/use-languages";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import type { UserType } from "../../types/users";
import useUserRoles from "@/modules/auth/hooks/users/roles";
import { castRoleFromBackendToFrontend } from "@/modules/auth/utils/user-roles";
import { useTranslations } from "next-intl";
import StarRating from "@/components/star-rating/input";
import { Badge } from "@/components/ui/badge";
import { formatTimeSpentFromMinutesToHours } from "@/utils/format-time";
import { getMoodEmoji } from "@/utils/emojies";

interface Props {
  user: UserType;
}

export function ProfileHeader({ user }: Props) {
  const router = useRouter();
  const { currentLanguage } = useLanguages();
  const { roles } = useUserRoles();
  const t = useTranslations("modules.users.profile");

  const metrics = [
    {
      id: "timeWorked",
      icon: Hourglass,
      label: t("totalTimeWorked"),
      value: formatTimeSpentFromMinutesToHours(user.timeWorkedInMinutes || 0)
    },
    {
      id: "projects",
      icon: FolderKanban,
      label: t("workedOnProjects"),
      value: t("projectsNumber", { count: user.workedProjects || 0 })
    },
    {
      id: "avgSession",
      icon: Clock,
      label: t("averageSession"),
      value: formatTimeSpentFromMinutesToHours(user.averageSessionTimeInMinutes || 0)
    },
    {
      id: "mood",
      icon: Smile,
      label: t("avgDailyMood"),
      value: user.averageDailyMood
        ? `${getMoodEmoji(user.averageDailyMood)} ${user.averageDailyMood}/5`
        : "N/A"
    },
    {
      id: "performance",
      icon: CircleGauge,
      label: t("avgRatedPerformance"),
      customRender: user.averagePerformanceRating ? (
        <StarRating rating={user.averagePerformanceRating} />
      ) : (
        "N/A"
      )
    }
  ];

  return (
    <div className="border-border bg-card relative border-b shadow-sm">
      <div className="bg-muted relative h-48 w-full overflow-hidden lg:h-64">
        <div className="absolute inset-0 bg-gradient-to-bl from-[#160a33] to-[#201744]" />
        <div className="text-primary-foreground absolute top-5 right-5 font-black">TDG</div>
        <Button
          onClick={() => router.back()}
          variant="secondary"
          size="icon"
          className="absolute top-4 left-4 h-8 w-8 rounded-full shadow-lg">
          <ChevronLeft className="h-4 w-4" />
        </Button>
      </div>

      <div className="mx-auto max-w-7xl px-4 pb-8 sm:px-6 lg:px-8">
        <div className="relative -mt-12 flex flex-col items-center gap-6 md:-mt-16 md:flex-row md:items-end">
          <Avatar className="border-background h-24 w-24 border-4 shadow-xl md:h-32 md:w-32">
            <AvatarImage src={user.image || "/placeholder.svg"} />
            <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
          </Avatar>

          <div className="flex-1 space-y-1 text-center md:text-left">
            <h1 className="text-foreground text-2xl font-bold tracking-tight md:text-3xl">
              {user.name}
            </h1>
            <div className="flex flex-wrap justify-center gap-2 md:justify-start">
              {user.roles.map((role) => (
                <Badge key={role} variant="outline" className="bg-primary/5 font-medium">
                  {roles
                    ? roles.find((r) => castRoleFromBackendToFrontend(r.value) === role)?.label
                    : role}
                </Badge>
              ))}
            </div>
          </div>
        </div>

        <div className="border-border mt-8 grid grid-cols-2 gap-4 border-t pt-8 sm:grid-cols-3 lg:grid-cols-5">
          {metrics.map((metric) => (
            <div key={metric.id} className="space-y-1.5">
              <div className="text-muted-foreground flex items-center gap-2 text-xs font-medium">
                <metric.icon className="h-3.5 w-3.5" />
                <span className="truncate">{metric.label}</span>
              </div>
              <div className="text-foreground text-sm font-semibold tracking-tight">
                {metric.customRender || metric.value}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
