import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { PaginationType } from "@/types/pagination";
import usePagination from "@/hooks/use-pagination";
import useUser from "@/modules/auth/hooks/users/use-user";
import retreiveUserActivity from "../services/user-activity-tracking";
import { ActivityTrackingType } from "../types";

interface Params {
  userId: string;
  limit?: number;
  isMyProfile?: boolean;
}

export default function useUserActivity({ limit = 100, userId, isMyProfile = false }: Params) {
  const { user } = useUser();

  const { page, setPage, pagesNumber, setPagesNumber, records, setRecords } = usePagination();

  const { data, isLoading, isError } = useQuery<{
    data: ActivityTrackingType[];
    pagination: PaginationType;
  }>({
    queryKey: ["activity", userId, page],
    queryFn: () =>
      retreiveUserActivity({
        userId,
        page,

        //if user is not seeing his own activity he's considered as manager to check his permession on server side
        isManager: !isMyProfile
        //optionnal from period
        //optionnal to period
      }),
    enabled: user !== null
  });

  useEffect(() => {
    if (data?.pagination) {
      setPagesNumber(data.pagination.totalPages);
      setRecords(data.pagination.records);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data]);

  return {
    activity: data ? data.data : undefined,
    activityIsLoading: isLoading || data === undefined,
    activityError: data === null || isError, //isError || data === null,
    setPage,
    page,
    pagesNumber,
    records
  };
}
