"use client";
import React from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { CopilotCitation } from "@/modules/ai/services/api/copilot";

/** Which project-detail tab a given citation deep-links into. */
const TAB_BY_ENTITY: Record<CopilotCitation["entityType"], string> = {
  TASK: "tasks",
  TASK_COMMENT: "tasks",
  EPIC: "epics",
  MILESTONE: "milestones",
  SPRINT: "sprints",
};

interface Props {
  citation: CopilotCitation;
}

/**
 * A clickable citation chip (§5). Deep-links to the exact source the copilot
 * used: TASK / TASK_COMMENT citations switch to the Tasks tab and open the
 * referenced task's detail sheet (via a `taskId` URL param the tasks list
 * consumes); epic/milestone/sprint citations switch to their tab. The retrieved
 * snippet is shown on hover so the citation is inspectable, not just a link.
 */
export default function CitationChip({ citation }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const handleClick = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", TAB_BY_ENTITY[citation.entityType] ?? "tasks");
    if (citation.taskId) params.set("taskId", citation.taskId);
    else params.delete("taskId");
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            type="button"
            onClick={handleClick}
            className="inline-flex items-center gap-1 rounded-full border border-primary/30 bg-primary/5 px-2 py-0.5 text-xs font-medium text-primary transition-colors hover:bg-primary/10"
          >
            <span className="tabular-nums opacity-70">[{citation.marker}]</span>
            <span className="max-w-[16rem] truncate">{citation.label}</span>
          </button>
        </TooltipTrigger>
        <TooltipContent side="top" className="max-w-xs">
          <p className="text-xs leading-snug">{citation.snippet}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
