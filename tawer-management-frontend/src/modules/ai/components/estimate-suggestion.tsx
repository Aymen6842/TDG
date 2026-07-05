"use client";
import React from "react";
import { Loader2, Sparkles } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import useTaskEstimate from "@/modules/ai/hooks/use-task-estimate";

interface Props {
  projectId: string;
  title: string;
  description?: string | null;
  /** Whether the host form is agile (story points make sense). */
  isAgile: boolean;
  /** Fill the form's estimate fields from the suggestion. */
  onApply: (values: { estimatedHours?: number; storyPoints?: number }) => void;
  /** Turn the estimator off (e.g. while the sheet is closed). */
  enabled?: boolean;
}

/**
 * Retrieval-grounded estimate shown inline in the create/edit task form (§5). As
 * the user types the title/description (debounced in the hook), it calls
 * `/ai/estimate` and renders "≈ Xh (low–high) · N pts — based on TASK-a, …" with
 * a one-click apply. Empty / insufficient-history states are shown honestly
 * rather than inventing a number.
 */
export default function EstimateSuggestion({
  projectId,
  title,
  description,
  isAgile,
  onApply,
  enabled = true,
}: Props) {
  const t = useTranslations("modules.ai.estimate");
  const { estimate, estimateIsLoading, estimateError, isActive } =
    useTaskEstimate({ projectId, title, description, enabled });

  const [applied, setApplied] = React.useState(false);

  // A fresh estimate re-enables the apply button.
  React.useEffect(() => {
    setApplied(false);
  }, [
    estimate?.predictedHours,
    estimate?.suggestedPoints,
    estimate?.sampleSize,
  ]);

  // Nothing to show until the user has typed enough of a title.
  if (!isActive) return null;

  const hasEstimate =
    !!estimate && estimate.predictedHours != null && estimate.sampleSize > 0;

  return (
    <div className="rounded-md border border-dashed bg-muted/40 px-3 py-2.5 text-sm">
      <div className="mb-1 flex items-center gap-1.5 font-medium text-foreground">
        <Sparkles className="h-3.5 w-3.5 text-primary" />
        {t("title")}
      </div>

      {estimateIsLoading ? (
        <span className="flex items-center gap-2 text-muted-foreground">
          <Loader2 className="h-3.5 w-3.5 animate-spin" /> {t("loading")}
        </span>
      ) : estimateError ? (
        <span className="text-muted-foreground">{t("error")}</span>
      ) : !hasEstimate ? (
        <span className="text-muted-foreground">{t("noHistory")}</span>
      ) : (
        <EstimateBody
          estimate={estimate!}
          isAgile={isAgile}
          applied={applied}
          onApply={() => {
            onApply({
              estimatedHours: estimate!.predictedHours ?? undefined,
              storyPoints:
                isAgile && estimate!.suggestedPoints != null
                  ? estimate!.suggestedPoints
                  : undefined,
            });
            setApplied(true);
          }}
          t={t}
        />
      )}
    </div>
  );
}

function EstimateBody({
  estimate,
  isAgile,
  applied,
  onApply,
  t,
}: {
  estimate: NonNullable<ReturnType<typeof useTaskEstimate>["estimate"]>;
  isAgile: boolean;
  applied: boolean;
  onApply: () => void;
  t: ReturnType<typeof useTranslations>;
}) {
  const showPoints = isAgile && estimate.suggestedPoints != null;
  const evidence = estimate.neighbors.slice(0, 3).map((n) => n.key);

  return (
    <div className="space-y-1.5">
      <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
        <span className="font-semibold text-foreground">
          ≈ {estimate.predictedHours}
          {t("hoursSuffix")}
        </span>
        {estimate.rangeLow != null && estimate.rangeHigh != null && (
          <span className="text-muted-foreground">
            ({estimate.rangeLow}–{estimate.rangeHigh}
            {t("hoursSuffix")})
          </span>
        )}
        {showPoints && (
          <span className="text-muted-foreground">
            · {estimate.suggestedPoints} {t("points")}
          </span>
        )}
        <Button
          type="button"
          size="sm"
          variant="secondary"
          className="ml-auto h-7 px-2"
          disabled={applied}
          onClick={onApply}
        >
          {applied ? t("applied") : t("apply")}
        </Button>
      </div>

      {evidence.length > 0 && (
        <p className="text-xs text-muted-foreground">
          {t("basedOn")} {evidence.join(", ")}
        </p>
      )}

      {estimate.scope === "BUSINESS_UNIT" && (
        <p className="text-xs text-muted-foreground italic">
          {t("businessUnitScope")}
        </p>
      )}
    </div>
  );
}
