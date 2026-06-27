import { WorkedDayTrackingInResponseType, WorkedDayTrackingType } from "../../types";

export default function castToWorkedDayTrackingType(
  workedDay: WorkedDayTrackingInResponseType
): WorkedDayTrackingType {
  const remoteHours = Number(workedDay.remoteWorkedHours);
  const onSiteHours = Number(workedDay.officeWorkedHours);
  const totalHours = remoteHours + onSiteHours;
  const workMode = remoteHours != 0 && onSiteHours != 0 ? "Mixed" : onSiteHours != 0 ? "Office" : remoteHours != 0 ? "Remote" : "None";

  return {
    day: workedDay.date,
    remoteHours: remoteHours,
    officeHours: onSiteHours,
    totalHours,
    workMode
  };
}
