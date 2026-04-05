"use client";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Sparkles, Heart } from "lucide-react";
import { getMoodEmoji } from "@/utils/emojies";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from "@/components/ui/alert-dialog";

interface Props {
  open: boolean;
  onSkip: () => void;
  onSubmit: () => void;
  onSetUserMood: (mood: 0 | 1 | 2 | 3 | 4 | 5) => void;
  onSetUserJourneyNotes: (notes: string) => void;
  userMood?: number;
  journeyNotes?: string;
  isPending?: boolean;
}

export function JourneyNotesPopup(props: Props) {
  const t = useTranslations("modules.tracking.journeyNotes");

  const moodDescriptions = t.raw("moodDescriptions");

  return (
    <AlertDialog
      open={props.open}
      onOpenChange={(open) => {
        if (!open) props.onSkip();
      }}>
      <AlertDialogContent className="border-border bg-card sm:max-w-[500px]">
        <div className="border-border -mx-6 -mt-6 mb-6 rounded-t-lg border-b bg-gradient-to-r px-6 py-3">
          <AlertDialogHeader className="space-y-2">
            <div className="flex items-center gap-2">
              <Sparkles className="text-primary h-5 w-5" />
              <AlertDialogTitle className="text-xl">{t("title")}</AlertDialogTitle>
            </div>
            <AlertDialogDescription className="text-sm leading-relaxed">
              {t("description")}
            </AlertDialogDescription>
          </AlertDialogHeader>
        </div>

        <div className="space-y-6 px-6 pb-4">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-foreground text-sm font-semibold">{t("moodLabel")}</label>
              {props.userMood !== undefined && (
                <div className="flex items-center gap-2">
                  <span className="text-3xl">{getMoodEmoji(props.userMood)}</span>
                  <span className="bg-primary/10 text-primary rounded-full px-3 py-1 text-xs font-medium">
                    {moodDescriptions[props.userMood as keyof typeof moodDescriptions]}
                  </span>
                </div>
              )}
            </div>

            <div className="bg-muted/50 border-border flex gap-2 rounded-lg border p-3">
              {([0, 1, 2, 3, 4, 5] as (0 | 1 | 2 | 3 | 4 | 5)[]).map((emoji, index) => (
                <button
                  key={index}
                  onClick={() => props.onSetUserMood(emoji)}
                  className={`flex h-12 flex-1 transform items-center justify-center rounded-lg transition-all duration-200 ${
                    props.userMood === emoji
                      ? "bg-primary text-primary-foreground ring-primary scale-110 shadow-lg ring-2 ring-offset-2"
                      : "bg-background hover:bg-muted border-border border hover:scale-105"
                  }`}
                  title={moodDescriptions[emoji as keyof typeof moodDescriptions]}>
                  <span className="text-2xl">{getMoodEmoji(emoji)}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Heart className="text-primary h-4 w-4" />
              <label htmlFor="note" className="text-foreground text-sm font-semibold">
                {t("workNoteLabel")}
                <span className="text-muted-foreground ml-2 font-normal">(optional)</span>
              </label>
            </div>
            <Textarea
              id="note"
              placeholder={t("workNotePlaceholder")}
              value={props.journeyNotes}
              onChange={(e) => props.onSetUserJourneyNotes(e.target.value)}
              className="bg-muted/50 border-border focus:border-primary resize-none rounded-lg"
              rows={3}
            />
          </div>
        </div>

        <AlertDialogFooter className="bg-muted/30 border-border -mx-6 -mb-6 gap-3 rounded-b-lg border-t px-6 py-4">
          <Button
            type="button"
            variant="outline"
            onClick={props.onSkip}
            disabled={props.isPending}
            className="border-border hover:bg-muted">
            {t("skipButton")}
          </Button>
          <Button
            disabled={props.isPending}
            type="button"
            onClick={props.onSubmit}
            className="bg-primary hover:bg-primary/90">
            {t("submitButton")}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
