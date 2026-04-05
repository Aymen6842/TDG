import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import useUser from "@/modules/auth/hooks/users/use-user";
import retreiveWorkedDays from "../services/worked-days-tracking";
import { formatDateToBackendFormat } from "@/utils/date";
import { WorkedDayTrackingType } from "../types";

interface Params {
  userId: string;
  isMyProfile?: boolean;
}

export default function useWorkedDaysTracking({ userId, isMyProfile = false }: Params) {
  const { user } = useUser();

  const [year, setYear] = useState(new Date().getFullYear())

  const { data, isLoading, isError } = useQuery<WorkedDayTrackingType[]>({
    queryKey: ["activity", userId, year],
    queryFn: () =>
      retreiveWorkedDays({
        userId,
        from: formatDateToBackendFormat(new Date(year, 1, 1)),
        to: formatDateToBackendFormat(new Date(year, 12, 31)),

        //if user is not seeing his own activity he's considered as manager to check his permession on server side
        isManager: !isMyProfile
        //optionnal from period
        //optionnal to period
      }),
    enabled: user !== null
  });

  return {
    workedDays: data ? data : undefined,
    isLoading: isLoading || data === undefined,
    isError: data === null || isError, //isError || data === null,
    onChangeYear: setYear,
    activeYear: year,
  };
}
