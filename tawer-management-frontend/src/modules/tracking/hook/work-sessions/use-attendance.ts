import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { CustomError } from "@/utils/custom-error";
import { toast } from "sonner";
import { useState } from "react";
import { getDeviceType } from "../../utils/devices";
import { useQueryClient } from "@tanstack/react-query";
import { createWorkSessionOnServerSide } from "../../services/work-sessions/creation";
import { WorkSessionStatus } from "../../types/work-sessions";
import closeWorkSessionOnServerSide from "../../services/work-sessions/closure";
import useWorkSession from "./use-work-session";
import { useViewerModeStore } from "../../store/viewer-mode-store";

/**
 * This hook used to manage your work session
 */
export default function useAttendance() {
  const t = useTranslations("modules.tracking")
  const tErrors = useTranslations("modules.tracking.errors");
  const router = useRouter();
  const queryClient = useQueryClient();

  const [isPending, setIsPending] = useState(false);
  const { viewerModeIsActive, setViewerModeIsActive } = useViewerModeStore(store => store)

  const { workSession } = useWorkSession()

  /**
   * this function used to let employee check in or checkout on server side and update the status in the store and handle errors
   * @returns it returns boolean value indicating success or failure of the operation
   */
  const updateWorkSessionStatus = async (status: WorkSessionStatus, workMode?: "remote" | "onSite") => {
    setIsPending(true);
    try {
      // Here you would call your service to track the work session status
      if (status === "in" && workMode) {
        await createWorkSessionOnServerSide({ workMode: workMode === "remote" ? "REMOTE" : "ONSITE", device: getDeviceType() });

        await queryClient.invalidateQueries({
          queryKey: ["work-sessions"],
          exact: false
        })
        await queryClient.invalidateQueries({
          queryKey: ["notifications"],
          exact: false
        })
      } else if (status === "out" && workSession) {
        await closeWorkSessionOnServerSide({ id: workSession.id });

        await queryClient.invalidateQueries({
          queryKey: ["work-sessions"],
          exact: false
        })
        await queryClient.invalidateQueries({
          queryKey: ["notifications"],
          exact: false
        })
        toast.success(t("success.checkout"))
      }
      return true;
    } catch (error) {
      const customError = error as CustomError;

      if (customError.status === 401) router.push("/login");
      else if (customError.status === 400) {
        updateWorkSessionStatus("out");
      } else {
        if (status === "in") toast.error(tErrors("checkInFailed"));
        else toast.error(tErrors("checkOutFailed"));
      }
      return false;
    } finally {
      setIsPending(false);
    }
  };

  /**
   * this function used to let employee check in
   * @returns it returns boolean value indicating success or failure of the operation
   */
  const checkIn = async (workMode: "onSite" | "remote") => {
    return await updateWorkSessionStatus("in", workMode);
  };

  /**
   * this function used to let employee check out
   */
  const joinPlatformAsViewer = async () => {
    setViewerModeIsActive(true);
    toast.warning(t("warnings.joinedViewerMode"))
  };

  /**
   * this function used to let employee join platform as viewer
   * @returns it returns boolean value indicating success or failure of the operation
   */
  const checkOut = async () => {
    if (viewerModeIsActive) {
      setViewerModeIsActive(false);
      toast.success(t("success.viewerCheckout"));

      return true;
    }
    else if (workSession.status === "in") return await updateWorkSessionStatus("out");
  };

  return { checkIn, checkOut, isPending, joinPlatformAsViewer };
}
