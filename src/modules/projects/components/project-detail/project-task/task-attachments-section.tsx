import AttachementPreview from "./attachement-preview";

interface TaskAttachmentsSectionProps {
  attachments: string[] | undefined;
  onViewAttachment: (url: string) => void;
}

export function TaskAttachmentsSection({ attachments, onViewAttachment }: TaskAttachmentsSectionProps) {
  return (
    <div className="space-y-2 p-4">
      <h4 className="text-sm font-medium">Attachments</h4>
      {attachments && attachments.length > 0 ? (
        <div className="space-y-2">
          {attachments.map((attachment, idx) => (
            <AttachementPreview
              key={idx}
              attachment={attachment}
              onViewAttachment={() => onViewAttachment(attachment)}
            />
          ))}
        </div>
      ) : (
        <div className="bg-muted text-muted-foreground rounded-md p-4 text-center text-sm">No attachments yet</div>
      )}
    </div>
  );
}
