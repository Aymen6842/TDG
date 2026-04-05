import { useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { CustomError } from "@/utils/custom-error";
import { toast } from "sonner";
import { JourneyNotesRequestType } from "../types/journey-notes";
import uploadUserJourneyNotesToServerSide from "../services/journey-notes-upload";
import useWorkSession from "./work-sessions/use-work-session";

interface Params {
  onFinished: () => void;
}

/**
 * This hook will be responsible for asking users to provide their journey notes to upload it to server side
 * This journey notes are optionnal
 * @param onFinished this function will be executed once this hook has finished its work
 */
export default function useJourneyNotesUpload({ onFinished }: Params) {
  const t = useTranslations("modules.tracking.journeyNotes");
  const tErrors = useTranslations("modules.tracking.errors");
  const router = useRouter();

  const { workSession } = useWorkSession();

  const [journeyNotesPopupIsOpen, setJourneyNotesPopupIsOpen] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState("");
  const [journeyNotes, setJourneyNotes] = useState<JourneyNotesRequestType>({});

  /**
   * This function will be responsible on closing the pop and running the onFinished func passed from params
   */
  const onFinishedSubmission = () => {
    setJourneyNotesPopupIsOpen(false);
    onFinished();
  };

  /**
   * This func will trigger the journey notes extraction process by opening the pop up if there is no work session and if there is a work session it will directly run the onFinished func because the user will not be able to provide journey notes without having a work session
   */
  const triggerJourneyNotesExtraction = () => {
    if (workSession) setJourneyNotesPopupIsOpen(true);
    else onFinishedSubmission();
  };

  function onSkip() {
    onFinishedSubmission();
  }

  const onSetUserMood = (mood: 0 | 1 | 2 | 3 | 4 | 5) => {
    setJourneyNotes({
      ...journeyNotes,
      dailyMood: mood
    });
  };

  const onSetUserJourneyNotes = (notes: string) => {
    setJourneyNotes({
      ...journeyNotes,
      workerNotes: notes
    });
  };

  /**
   * This function will be used to validate the user data make sure that all data provided by user is valid and submit the data to the backend side if it is valid
   */
  async function onSubmit() {
    if (journeyNotes.dailyMood === undefined && journeyNotes.workerNotes === undefined || !workSession) {
      onFinishedSubmission();
      return;
    }

    setIsPending(true);

    try {
      await uploadUserJourneyNotesToServerSide({ sessionId: workSession.id, journeyNotes });

      toast.success(t("success.upload"));
      onFinishedSubmission();
    } catch (thrownError) {
      const error = thrownError as CustomError;
      if (error.status === 401) {
        router.push("/login");
        return;
      }

      toast.error(tErrors("failedToSubmitJourneyNotes"));
      setError(tErrors("failedToSubmitJourneyNotes"));
      return;
    } finally {
      setIsPending(false);
    }
  }

  return {
    error,
    isPending,
    onSubmit,
    onSkip,
    triggerJourneyNotesExtraction,
    onSetUserJourneyNotes,
    onSetUserMood,
    journeyNotesPopupIsOpen,
    journeyNotes
  };
}
