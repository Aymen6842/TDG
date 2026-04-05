
import { useEffect, useRef, useState } from "react";
import { WorkSessionType } from "../../types/work-sessions";
import useCurrentWorkDay from "../use-current-work-day";

export default function useWorkSession() {
  const { workDay: data, isLoading, isError } = useCurrentWorkDay();
  const sessionSetupIsLoading = useRef(true);
  const [workSession, setWorkSession] = useState<WorkSessionType>({
    id: "",
    status: "out",
    moodIsSubmitted: false,
  });

  useEffect(() => {
    setWorkSession(
      data === null ? {
        id: "",
        status: "out",
        moodIsSubmitted: false
      } : {
        id: data ? data.id : "",
        status: data?.sessions && data.sessions.length > 0 && data.sessions[0].endTime === undefined ? "in" : "out",
        moodIsSubmitted: data && data.dailyMood !== undefined
      }
    )

    sessionSetupIsLoading.current = false;
  }, [data])


  return {
    workSession: workSession,
    isLoading: data === undefined || isLoading || sessionSetupIsLoading.current,
    isError: isError || data === null
  };
}
