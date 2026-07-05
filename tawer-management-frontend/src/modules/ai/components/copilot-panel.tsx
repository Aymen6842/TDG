"use client";
import React from "react";
import { Loader2, Sparkles, Send, Info } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import useCopilot from "@/modules/ai/hooks/use-copilot";
import { CopilotCitation } from "@/modules/ai/services/api/copilot";
import CitationChip from "./citation-chip";

interface Props {
  projectId: string;
}

/**
 * Permission-scoped RAG copilot panel (§5), mounted as a project-detail tab. The
 * user asks a natural-language question; the answer is grounded ONLY in
 * retrieved project content and comes back with clickable citation chips that
 * deep-link to the exact task/comment used. Weak-retrieval / refusal answers are
 * rendered honestly (no citation list, an explicit "not found" note) rather than
 * dressed up as confident answers.
 */
export default function CopilotPanel({ projectId }: Props) {
  const t = useTranslations("modules.ai.copilot");
  const { ask, answer, isAsking, isError, reset } = useCopilot();
  const [question, setQuestion] = React.useState("");

  // Clear any previous answer when switching to another project.
  React.useEffect(() => {
    reset();
    setQuestion("");
  }, [projectId, reset]);

  const trimmed = question.trim();
  const canAsk = trimmed.length >= 3 && !isAsking;

  const submit = () => {
    if (!canAsk) return;
    ask({ projectId, question: trimmed });
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      submit();
    }
  };

  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <div className="flex items-start gap-2">
        <Sparkles className="mt-0.5 h-5 w-5 text-primary" />
        <div>
          <h2 className="text-lg font-semibold">{t("title")}</h2>
          <p className="text-sm text-muted-foreground">{t("subtitle")}</p>
        </div>
      </div>

      <div className="space-y-2">
        <Textarea
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={t("placeholder")}
          rows={3}
          className="resize-none"
        />
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">{t("hint")}</span>
          <Button onClick={submit} disabled={!canAsk} size="sm">
            {isAsking ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
            {t("ask")}
          </Button>
        </div>
      </div>

      {isAsking && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" /> {t("thinking")}
        </div>
      )}

      {isError && !isAsking && (
        <div className="rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive">
          {t("error")}
        </div>
      )}

      {answer && !isAsking && (
        <AnswerBlock
          answer={answer.answer}
          citations={answer.citations}
          insufficientContext={answer.insufficientContext}
          sourcesLabel={t("sources")}
          refusalNote={t("refusalNote")}
        />
      )}
    </div>
  );
}

function AnswerBlock({
  answer,
  citations,
  insufficientContext,
  sourcesLabel,
  refusalNote,
}: {
  answer: string;
  citations: CopilotCitation[];
  insufficientContext: boolean;
  sourcesLabel: string;
  refusalNote: string;
}) {
  return (
    <div className="rounded-lg border bg-card p-4 shadow-sm">
      <p className="whitespace-pre-wrap text-sm leading-relaxed text-foreground">
        {answer}
      </p>

      {insufficientContext ? (
        <div className="mt-3 flex items-center gap-1.5 text-xs text-muted-foreground">
          <Info className="h-3.5 w-3.5" />
          {refusalNote}
        </div>
      ) : (
        citations.length > 0 && (
          <div className="mt-4 border-t pt-3">
            <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
              {sourcesLabel}
            </p>
            <div className="flex flex-wrap gap-1.5">
              {citations.map((citation) => (
                <CitationChip
                  key={`${citation.marker}-${citation.entityId}`}
                  citation={citation}
                />
              ))}
            </div>
          </div>
        )
      )}
    </div>
  );
}
