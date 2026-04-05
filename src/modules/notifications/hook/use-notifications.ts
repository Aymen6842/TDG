import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { PaginationType } from "@/types/pagination";
import usePagination from "@/hooks/use-pagination";
import { NotificationType } from "../types";
import retreiveNotifications from "@/modules/notifications/services/notifications-extractions";
import useUser from "@/modules/auth/hooks/users/use-user";
import markNotificationsAsSeenOnServerSide from "@/modules/notifications/services/notifications-update";

interface Params {
  limit?: number;
  status?: "seen" | "unseen";
}

export default function useNotifications({ limit = 30, status }: Params) {
  const { user } = useUser();
  const queryClient = useQueryClient();

  const { page, setPage, pagesNumber, setPagesNumber, records, setRecords } = usePagination();

  const { data, isLoading, isError } = useQuery<{
    data: NotificationType[];
    pagination: PaginationType;
  }>({
    queryKey: ["notifications", user, limit, status],
    queryFn: () => retreiveNotifications({ page, limit, status }),
    enabled: user !== null
  });

  useEffect(() => {
    if (data?.pagination) {
      setPagesNumber(data.pagination.totalPages);
      setRecords(data.pagination.records);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data]);

  /**
   * This function is used to mark notifications fetched as seen
   * @returns boolean value indicates the status of the operation
   */

  const markNotificationsAsSeen = async () => {
    if (!data || data.data.length == 0 || !data.data.some(not => not.unread) || status === "seen")
      return false;

    const res = await markNotificationsAsSeenOnServerSide({
      ids: data.data.filter(not => not.unread).map((not) => not.id)
    });

    queryClient.invalidateQueries({
      queryKey: ["notifications"],
      exact: false
    })

    if (res) return res !== null;
  };

  return {
    notifications: data === null ? null : data?.data,
    notificationsAreLoading: isLoading || data === undefined,
    notificationsError: isError || data === null,
    setPage,
    page,
    pagesNumber,
    records,
    markNotificationsAsSeen
  };
}
