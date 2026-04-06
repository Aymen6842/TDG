import { Button } from "@/components/ui/button";
import { Download, Eye, FileIcon, Trash2 } from "lucide-react";

interface Props {
  attachment: string;
  onViewAttachment: () => void;
  onDeleteAttachment?: () => void;
}

export default function AttachementPreview({ attachment, onViewAttachment, onDeleteAttachment }: Props) {
  const fileName = attachment.split('/').pop() || 'Unknown file';
  const isImage = /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(attachment);
  const isPdf = /\.pdf$/i.test(attachment);

  const downloadAttachment = () => {
    const link = document.createElement('a');
    link.href = attachment;
    link.download = decodeURIComponent(fileName);
    link.click();
  }

  return (
    <>
      <div
        className="bg-muted flex items-center justify-between rounded-lg p-3 hover:bg-muted/80 transition-colors group">
        <div className="flex items-center gap-3 overflow-hidden flex-1">
          {isImage ? (
            <div className="relative h-12 w-12 rounded-md overflow-hidden bg-background flex-shrink-0">
              <img
                src={attachment}
                alt={fileName}
                className="h-full w-full object-cover"
              />
            </div>
          ) : (
            <div className="h-12 w-12 rounded-md bg-primary/10 flex items-center justify-center flex-shrink-0">
              <FileIcon className="h-6 w-6 text-primary" />
            </div>
          )}
          <div className="overflow-hidden flex-1 min-w-0">
            <p className="text-sm font-medium truncate">
              {decodeURIComponent(fileName)}
            </p>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span>{isImage ? 'Image' : isPdf ? 'PDF' : 'File'}</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onViewAttachment}
            className="text-primary hover:text-primary hover:bg-primary/10 flex-shrink-0">
            <Eye className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={downloadAttachment}
            className="text-primary hover:text-primary hover:bg-primary/10 flex-shrink-0">
            <Download className="h-4 w-4" />
          </Button>
          {onDeleteAttachment && <Button
            type="button"
            variant="ghost"
            className="text-destructive"
            size="sm"
            onClick={onDeleteAttachment}>
            <Trash2 />
          </Button>}
        </div>
      </div>
    </>
  )
}