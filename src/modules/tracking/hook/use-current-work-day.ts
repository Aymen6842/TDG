import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { retreiveCurrentWorkDayFromServerSide } from "../services/current-work-day-extraction";

export default function useCurrentWorkDay() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["work-sessions", "work-day"],
    queryFn: retreiveCurrentWorkDayFromServerSide,
    placeholderData: keepPreviousData,
  });


  return {
    workDay: data,
    isLoading: data === undefined || isLoading,
    isError: isError || data === null
  };
}
