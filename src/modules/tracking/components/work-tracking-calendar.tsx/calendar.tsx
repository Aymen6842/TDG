"use client";;
import { ResponsiveCalendar } from "@nivo/calendar";
import { WorkedDayTrackingType } from "../../types";
import { useLocale, useTranslations } from "next-intl";
import { WORK_MODE_COLORS } from "../../utils/colors";

interface Props {
  data: WorkedDayTrackingType[];
  from: Date;
  to: Date;
}

export function WorkedDaysCalendar({ data, from, to }: Props) {
  const t = useTranslations("modules.tracking.workedDaysTracking.calendar");
  const locale = useLocale(); // get current locale from next-intl

  const nivoColorScale = [
    WORK_MODE_COLORS.empty,
    WORK_MODE_COLORS.office,
    WORK_MODE_COLORS.remote,
    WORK_MODE_COLORS.mixed,
  ];

  const chartData = data.map((item) => {
    // 2. Map the workMode to the index of our color array
    let colorIndex = 0;
    if (item.workMode === "Office") colorIndex = 1
    if (item.workMode === "Remote") colorIndex = 2;
    if (item.workMode === "Mixed") colorIndex = 3;

    return {
      // Nivo uses 'value' to pick the color from the array.
      // We pass the index so Nivo picks exactly the right color.
      value: colorIndex,
      ...item, // Keep original data for the tooltip
      day: item.day.split("T")[0]
    };
  });

  return (
    <div className="space-y-4">
      {/* Nivo Responsive components require a container with a defined height.
          Adjust 'h-[200px]' based on your layout needs.
      */}
      <div className="h-[200px] w-full rounded-md border bg-muted/20 p-4">
        <ResponsiveCalendar
          data={chartData}
          from={from}
          to={to}
          emptyColor={WORK_MODE_COLORS.empty}
          colors={nivoColorScale}
          minValue={0} // 0 maps to WORK_MODE_COLORS.empty
          maxValue={3} // 3 maps to WORK_MODE_COLORS.mixed
          margin={{ top: 20, right: 0, bottom: 0, left: 20 }}
          yearSpacing={40}
          monthBorderColor="#ffffff"
          dayBorderWidth={2}
          dayBorderColor="#ffffff"
          tooltip={(props: any) => {
            const details = props.data as WorkedDayTrackingType;

            if (!details || props.value === undefined) return null;

            const formattedDay = new Date(details.day).toLocaleDateString(locale, {
              weekday: "short",  // Mon, Tue, etc.
              day: "2-digit",    // 01, 13, etc.
              month: "short"     // Jan, Feb, etc.
            });

            return (
              <div className="inline-block rounded-md border bg-popover px-3 py-2 text-xs min-w-25">
                <p className="font-semibold">{formattedDay}</p>
                <p className="text-muted-foreground">
                  {t("office")}: <span className="font-medium text-foreground">{details.officeHours} {t("hours")}</span>
                </p>
                <p className="text-muted-foreground">
                  {t("remote")}: <span className="font-medium text-foreground">{details.remoteHours} {t("hours")}</span>
                </p>
                <div className="mt-1 border-t pt-1">
                  <p className="font-bold text-foreground">
                    {t("total")}: {details.totalHours} {t("hours")}
                  </p>
                </div>
              </div>
            );
          }}
        />
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
        <Legend color={WORK_MODE_COLORS.office} label={t("legend.office")} />
        <Legend color={WORK_MODE_COLORS.remote} label={t("legend.remote")} />
        <Legend color={WORK_MODE_COLORS.mixed} label={t("legend.mixed")} />
        <Legend color={WORK_MODE_COLORS.empty} label={t("legend.none")} />
      </div>
    </div>
  );
}

function Legend({ color, label }: { color: string; label: string }) {
  return (
    <div className="flex items-center gap-2">
      <div
        className="h-3 w-3 rounded-sm border"
        style={{ backgroundColor: color }}
      />
      <span>{label}</span>
    </div>
  );
}