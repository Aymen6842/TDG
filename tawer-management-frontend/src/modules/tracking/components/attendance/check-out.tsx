"use client";;
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useTranslations } from "next-intl";
import useJourneyNotesUpload from "../../hook/use-journey-notes-upload";
import { JourneyNotesPopup } from "../journey-notes-pop-up";
import useAttendance from "../../hook/work-sessions/use-attendance";
import { useViewerModeStore } from "../../store/viewer-mode-store";

export function CheckOutButton() {
  const t = useTranslations("modules.tracking");
  const { checkOut } = useAttendance();
  const { viewerModeIsActive } = useViewerModeStore(store => store)
  const {
    triggerJourneyNotesExtraction,
    onSkip,
    onSubmit,
    onSetUserJourneyNotes,
    onSetUserMood,
    isPending,
    journeyNotesPopupIsOpen,
    journeyNotes
  } = useJourneyNotesUpload({
    onFinished: async () => {
      await checkOut();
    }
  });

  const onClickToCheckout = async () => {
    if (viewerModeIsActive) await checkOut();
    else triggerJourneyNotesExtraction();
  };

  return (
    <>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" onClick={onClickToCheckout}>
              <LogOut className="animate-tada size-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <span>{viewerModeIsActive ? t("viewerExitHint") : t("checkout")}</span>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
      <JourneyNotesPopup
        open={journeyNotesPopupIsOpen}
        onSkip={onSkip}
        onSubmit={onSubmit}
        onSetUserMood={onSetUserMood}
        onSetUserJourneyNotes={onSetUserJourneyNotes}
        userMood={journeyNotes.dailyMood}
        journeyNotes={journeyNotes.workerNotes}
        isPending={isPending}
      />
    </>
  );
}
