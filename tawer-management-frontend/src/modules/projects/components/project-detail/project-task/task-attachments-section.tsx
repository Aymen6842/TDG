import { useTranslations } from "next-intl";
import AttachementPreview from "./attachement-preview";

interface TaskAttachmentsSectionProps {
  attachments: string[] | undefined;
  onViewAttachment: (url: string) => void;
}

export function TaskAttachmentsSection({ attachments, onViewAttachment }: TaskAttachmentsSectionProps) {
  const t = useTranslations("modules.projects.taskSections.attachments");

  return (
    <div className="space-y-2 p-4">
      <h4 className="text-sm font-medium">{t("title")}</h4>
      {attachments && attachments.length > 0 ? (
        <div className="space-y-2">
          {attachments.map((attachment, idx) => (
            <AttachementPreview
              key={idx}
              attachment={attachment}
              onViewAttachment={onViewAttachment}
            />
          ))}
        </div>
      ) : (
        <div className="bg-muted text-muted-foreground rounded-md p-4 text-center text-sm">{t("empty")}</div>
      )}
    </div>
  );
}
