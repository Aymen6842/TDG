"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Eye, Trash2 } from "lucide-react";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import DeletionConfirmationDialog from "@/modules/users/components/deletion/deletion-confirmation-dialog";
import { ProjectType } from "../types/projects";
import useElementsDeletion from "@/hooks/use-elements-deletion";
import { getProjectProgress } from "../utils/project-progress";
import getProjectTailwindColor from "../utils/project-colors";
import DOMPurify from "dompurify";
import { formatDateTime, getRelativeTimeFromNow } from "../utils/time";

interface Props {
  project: ProjectType;
}

export default function ProjectContainer({ project }: Props) {
  const locale = useLocale();
  const t = useTranslations("modules.projects.project");

  const {
    isPending: deletionIsPending,
    addElementToDeletionList: addProjectToDeletionList,
    cancelDeletion,
    deleteAllElements,
    alertModalIsOpen,
    warning
  } = useElementsDeletion("user");

  const progress = getProjectProgress(project.startTime, project.endTime)
  const progressColor = getProjectTailwindColor(project.projectColor);

  return (
    <Card className="group relative transition-shadow hover:shadow-md">
      <CardHeader>
        <CardTitle>{project.name}</CardTitle>
        <CardDescription className="line-clamp-3">
          <div
            dangerouslySetInnerHTML={{
              __html: DOMPurify.sanitize(project.description ?? ""),
            }}
            className="text-muted-foreground text-sm"
          />
        </CardDescription>
      </CardHeader>

      {/* Overlay */}
      <div className="absolute inset-0 rounded-xl bg-black/0 transition-colors duration-300 group-hover:bg-black/10" />

      {/* Actions */}
      <div className="absolute top-2 right-2 flex gap-1 transition-opacity duration-300 lg:opacity-0 lg:group-hover:opacity-100">
        <Button
          size="icon"
          variant="secondary"
          className="bg-background/90 hover:bg-background h-8 w-8"
          asChild
        >
          <Link href={`/dashboard/projects/${project.slug}`}>
            <Eye className="h-4 w-4" />
          </Link>
        </Button>

        <Button
          size="icon"
          variant="destructive"
          className="h-8 w-8"
          onClick={() => addProjectToDeletionList(project.id)}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>

      <CardContent>
        <div className="text-muted-foreground text-sm">
          {t("details.period", {
            from: formatDateTime(project.startTime, locale),
            to: formatDateTime(project.endTime, locale)
          })}
        </div>



        <div className="mb-6">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-sm opacity-90">
              {t("details.timeProgressLabel")}
            </span>
            <span className="text-sm font-semibold">{progress}%</span>
          </div>
          <Progress value={progress} indicatorColor={progressColor} />
        </div>

        <div className="flex items-center justify-between">
          <Badge className={`h-7 ${progressColor} text-white`}>
            {getRelativeTimeFromNow(project.startTime, locale)}
          </Badge>
        </div>
      </CardContent>

      <DeletionConfirmationDialog
        isOpen={alertModalIsOpen}
        onOpenChange={(open) => !open && cancelDeletion()}
        title={t("deletionDialog.title")}
        description={t("deletionDialog.description")}
        warning={warning}
        onCancel={cancelDeletion}
        onConfirm={deleteAllElements}
        isPending={deletionIsPending}
        confirmText={t("deletionDialog.confirm")}
        cancelText={t("deletionDialog.cancel")}
      />
    </Card>
  );
}
