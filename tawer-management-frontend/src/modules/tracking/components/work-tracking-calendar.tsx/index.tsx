"use client";

import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "lucide-react";
import { useTranslations } from "next-intl";
import useWorkedDaysTracking from "../../hook/use-worked-days-tracking";
import { WorkedDaysCalendar } from "./calendar";

interface Props {
  userId: string;
  isMyProfile?: boolean;
}

export default function WorkedDaysTracking({
  userId,
  isMyProfile = false,
}: Props) {
  const t = useTranslations("modules.tracking.workedDaysTracking");

  const years = [2025, 2026, 2027, 2028];
  const { workedDays, isLoading, isError, activeYear, onChangeYear } =
    useWorkedDaysTracking({
      userId,
      isMyProfile,
    });

  // Function to get first and last day of a year
  const getYearRange = (year: number) => {
    const from = new Date(year, 0, 1); // Jan 1
    const to = new Date(year, 11, 31); // Dec 31
    return { from, to };
  };

  const { from, to } = getYearRange(activeYear);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between px-1">
        <h2 className="text-xl font-semibold tracking-tight">
          {t("overviewTitle")}
        </h2>

        <Select
          value={String(activeYear)}
          onValueChange={(v) => onChangeYear(Number(v))}
        >
          <SelectTrigger className="w-[110px] h-8 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {years.map((y) => (
              <SelectItem key={y} value={String(y)}>
                {y}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {
        isLoading ? <Card className="border-border/50">
          <CardContent className="text-muted-foreground flex items-center justify-center p-16">
            <div className="flex flex-col items-center gap-6">
              <div className="relative inline-flex h-12 w-12">
                <div className="border-muted-foreground/10 border-t-primary absolute inset-0 animate-spin rounded-full border-3" />
                <div className="bg-primary/20 absolute inset-2 animate-pulse rounded-full" />
              </div>
              <div className="text-center">
                <p className="text-foreground text-base font-semibold">
                  {t("loadingTitle")}
                </p>
                <p className="text-muted-foreground mt-2 text-sm">
                  {t("loadingSubtitle")}
                </p>
              </div>
            </div>
          </CardContent>
        </Card> : isError || workedDays?.length === 0 ? <Card className="border-border/50">
          <CardContent className="text-muted-foreground flex items-center justify-center p-16">
            <div className="flex flex-col items-center gap-4 text-center">
              <div className="bg-muted/60 rounded-full p-4">
                <Calendar className="text-muted-foreground/70 size-8" />
              </div>
              <div>
                <p className="text-foreground text-lg font-semibold">
                  {t("noWorkedDaysTitle")}
                </p>
                <p className="text-muted-foreground mt-1 text-sm">
                  {t("noWorkedDaysSubtitle")}
                </p>
              </div>
            </div>
          </CardContent>
        </Card> : <WorkedDaysCalendar data={workedDays || []} from={from} to={to} />
      }

    </div>
  );
}
