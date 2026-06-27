"use client";;
import Loading from "@/components/page-loader";
import { CheckInScreen } from "./check-in";
import useWorkSession from "../../hook/work-sessions/use-work-session";

export default function AttendanceWrapper({ children }: { children: React.ReactNode }) {
  const { isLoading, workSession } = useWorkSession();

  if (isLoading) return <Loading />;

  return <>
    <CheckInScreen />
    {children}
  </>
}