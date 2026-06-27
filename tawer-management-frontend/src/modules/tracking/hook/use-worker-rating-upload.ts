import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { CustomError } from "@/utils/custom-error";
import { toast } from "sonner";
import { WorkerRatingRequestType } from "../types/journey-notes";
import uploadWorkerRatingToServerSide from "../services/worker-rating-upload";

interface Params {
  workDayId: string;
  onFinished: () => void;
}

/**
 * This hook will be responsible for uploading the worker rating from the manager
 * @param onFinished this function will be executed once this hook has finished its work
 * @param workDayId is the day id that the manger want to rate based on it.
 */
export default function useWorkerRating({ onFinished, workDayId }: Params) {
  const queryClient = useQueryClient();
  const t = useTranslations("modules.tracking.workerRating");
  const tErrors = useTranslations("modules.tracking.errors");
  const sharedErrors = useTranslations("shared.errors");
  const router = useRouter();

  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState("");
  const [workerRating, setWorkerRating] = useState<WorkerRatingRequestType>({});

  const onSetRating = (rate: 0 | 1 | 2 | 3 | 4 | 5) => {
    setWorkerRating({
      ...workerRating,
      performanceRating: rate
    });
  };

  const onSetManagerNotes = (notes: string) => {
    setWorkerRating({
      ...workerRating,
      managerNotes: notes
    });
  };

  /**
   * This function will be used to validate the user data make sure that all data provided by user is valid and submit the data to the backend side if it is valid
   */
  async function onSubmit() {
    if (workerRating.performanceRating === undefined && workerRating.managerNotes === undefined) {
      return;
    }

    setIsPending(true);

    try {
      await uploadWorkerRatingToServerSide({ workDayId, workerRating });

      queryClient.invalidateQueries({ queryKey: ["activity"], exact: false });
      toast.success(t("success.upload"));
      onFinished();
    } catch (thrownError) {
      const error = thrownError as CustomError;
      if (error.status === 401) {
        router.push("/login");
        return;
      } else if (error.status === 403) {
        toast.error(sharedErrors("permissionDenied"));
        setError(sharedErrors("permissionDenied"));
        return;
      }

      toast.error(tErrors("failedToUploadWorkerRating"));
      setError(tErrors("failedToUploadWorkerRating"));
      return;
    } finally {
      setIsPending(false);
    }
  }

  return {
    error,
    isPending,
    onSubmit,
    onSetManagerNotes,
    onSetRating,
    workerRating
  };
}
