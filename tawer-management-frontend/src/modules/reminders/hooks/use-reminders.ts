import { useQuery } from "@tanstack/react-query";
import { ReminderType } from "@/modules/reminders/types/reminders";
import { retrieveReminders } from "@/modules/reminders/services/api/reminders";
import { PaginationType } from "@/types/pagination";

export default function useReminders(projectId: string) {
  const { data, isLoading, isError } = useQuery<{
    data: ReminderType[];
    pagination: PaginationType;
  }>({
    queryKey: ["reminders", projectId],
    queryFn: () => retrieveReminders(projectId),
    enabled: !!projectId,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });

  return {
    reminders: data?.data ?? [],
    pagination: data?.pagination,
    remindersAreLoading: isLoading,
    remindersError: isError,
  };
}
