"use client";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { StarRating } from "@/components/star-rating";
import { Sparkles, Zap } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import useWorkerRating from "@/modules/tracking/hook/use-worker-rating-upload";
import { useEffect, useState } from "react";

interface Props {
  workDayId: string;
  triggerOpenning: boolean;
  onClose: () => void;
}

export function WorkerRatingPopup(props: Props) {
  const t = useTranslations("modules.tracking.workerRating");
  const { error, isPending, onSubmit, onSetManagerNotes, onSetRating, workerRating } =
    useWorkerRating({
      onFinished: props.onClose,
      workDayId: props.workDayId
    });

  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (props.triggerOpenning) setOpen(true);
  }, [props.triggerOpenning]);

  const onClose = () => {
    setOpen(false);
    props.onClose?.();
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(open) => {
        if (!open) onClose();
        else setOpen(true);
      }}>
      <DialogContent className="border-border bg-card sm:max-w-[500px]">
        <div className="border-border -mx-6 -mt-6 mb-6 rounded-t-lg border-b bg-gradient-to-r px-6 py-3">
          <DialogHeader className="space-y-2">
            <div className="flex items-center gap-2">
              <Sparkles className="text-primary h-5 w-5" />
              <DialogTitle className="text-xl">{t("title")}</DialogTitle>
            </div>
            <DialogDescription className="text-sm leading-relaxed">
              {t("description")}
            </DialogDescription>
          </DialogHeader>
        </div>

        <div className="space-y-6 px-6 pb-4">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Zap className="text-primary h-4 w-4" />
              <label className="text-foreground text-sm font-semibold">
                {t("performanceRating")}
              </label>
              {workerRating.performanceRating !== undefined && (
                <span className="text-primary ml-auto text-xs font-medium">
                  {workerRating.performanceRating} / 5
                </span>
              )}
            </div>
            <StarRating
              rate={workerRating.performanceRating || 0}
              setRate={onSetRating as (rate: number) => void}
              maxRating={5}
              size={28}
            />
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <label htmlFor="note" className="text-foreground text-sm font-semibold">
                {t("managerNotes")}
                <span className="text-muted-foreground ml-2 font-normal">(optional)</span>
              </label>
            </div>
            <Textarea
              id="note"
              placeholder={t("managerNotesPlaceholder")}
              value={workerRating.managerNotes}
              onChange={(e) => onSetManagerNotes(e.target.value)}
              className="bg-muted/50 border-border focus:border-primary resize-none rounded-lg"
              rows={3}
            />
          </div>
        </div>

        <DialogFooter className="bg-muted/30 border-border -mx-6 -mb-6 gap-3 rounded-b-lg border-t px-6 py-4">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isPending}
            className="border-border hover:bg-muted bg-transparent">
            {t("closeButton")}
          </Button>
          <Button
            disabled={isPending}
            type="button"
            onClick={onSubmit}
            className="bg-primary hover:bg-primary/90">
            {t("submitButton")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
