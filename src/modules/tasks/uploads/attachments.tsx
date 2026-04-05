import { Button } from "@/components/ui/button";
import { FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { useFileUpload } from "@/hooks/use-file-upload";
import { FileIcon, Upload, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { useFormContext } from "react-hook-form";
import AttachementPreview from "../attachement-preview";
import CustomDialog from "@/components/custom-dialog";
import FilePreview from "reactjs-file-preview";
import { useEffect, useState } from "react";


interface Props {
  inputName: string;
  previews?: string[];
  resetTrigger?: number;
}

export default function AttachmentsUpload({ inputName, previews, resetTrigger }: Props) {
  const t = useTranslations("modules.projects.tasks");
  const form = useFormContext();

  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [alreadyCreatedAttachments, setAlreadyCreatedAttachments] = useState<string[]>([]);

  const [fileState, fileActions] = useFileUpload({
    maxFiles: 10,
    maxSize: 10 * 1024 * 1024, // 10MB
    multiple: true,
    initialFiles: [],
    onFilesChange: (files) => {
      // change files from type FileWithPreview to File
      const newFiles = files
        .filter(f => f.file instanceof File)
        .map(f => f.file as File);

      form.setValue('attachments', newFiles);
    }
  });

  const { clearFiles } = fileActions;

  useEffect(() => { if (previews) setAlreadyCreatedAttachments(previews) }, [previews])
  useEffect(() => {
    if (resetTrigger && resetTrigger !== 0) { clearFiles(); setAlreadyCreatedAttachments([]) }

  }, [resetTrigger])

  const removeAlreadyCreatedAttachment = (attachment: string) => {
    if (previews) {
      setAlreadyCreatedAttachments(attachments => attachments.filter(alreadyCreatedAttachment => alreadyCreatedAttachment !== attachment));

      const attachmentPathname = new URL(attachment).pathname;
      const concatenatedDeletedAttachments = form.getValues("deletedAttachments") as string;
      const currentAttachmentsToDelete = concatenatedDeletedAttachments ? concatenatedDeletedAttachments.split(",") : ""

      if (!currentAttachmentsToDelete.includes(attachmentPathname))
        form.setValue('deletedAttachments', [attachmentPathname, ...currentAttachmentsToDelete].join(','));
    }
  }

  const viewAttachment = (attachment: string) => {
    setPreviewUrl(attachment);
    setIsPreviewOpen(true);
  }


  return (<>
    <FormField
      control={form.control}
      name={inputName}
      render={({ field }) => (
        <FormItem>
          <FormControl>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-medium">{t("upload.form.labels.attachments")}</h4>
                {/* Hidden file input */}
                <div>
                  <input {...fileActions.getInputProps()} className="hidden" />

                  {/* Upload button */}
                  <Button
                    type="button"
                    variant="outline"
                    onClick={fileActions.openFileDialog}
                    className="w-full"
                  >
                    <Upload className="mr-2 h-4 w-4" />
                    {t("upload.form.labels.upload")}
                  </Button>
                </div>
              </div>
              {/* Error messages */}
              {fileState.errors.length > 0 && (
                <div className="space-y-1">
                  {fileState.errors.map((error, index) => (
                    <p key={index} className="text-sm text-destructive">
                      {error}
                    </p>
                  ))}
                </div>
              )}

              {fileState.files.length > 0 && (
                <div className="space-y-2">
                  <div className="space-y-2">
                    {fileState.files.map((fileItem) => {
                      const isFile = fileItem.file instanceof File;
                      const fileName = isFile ? fileItem.file.name : (fileItem.file as any).url?.split('/').pop() || 'Unknown file';
                      const fileSize = isFile ? fileItem.file.size : 0;
                      const isImage = isFile && (fileItem.file as File).type.startsWith('image/');

                      return (
                        <div
                          key={fileItem.id}
                          className="flex items-center justify-between bg-muted rounded-lg p-3 hover:bg-muted/80 transition-colors"
                        >
                          <div className="flex items-center gap-3 overflow-hidden flex-1">
                            {fileItem.preview && isImage ? (
                              <div className="relative h-12 w-12 rounded-md overflow-hidden bg-background flex-shrink-0">
                                <img
                                  src={fileItem.preview}
                                  alt={fileName}
                                  className="h-full w-full object-cover"
                                />
                              </div>
                            ) : (
                              <div className="h-12 w-12 rounded-md bg-primary/10 flex items-center justify-center flex-shrink-0">
                                <FileIcon className="h-6 w-6 text-primary" />
                              </div>
                            )}
                            <div className="overflow-hidden flex-1">
                              <p className="text-sm font-medium truncate max-w-[150px]">
                                {fileName}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {fileSize > 0 ? `${(fileSize / 1024).toFixed(2)} KB` : 'Unknown size'}
                              </p>
                            </div>
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => fileActions.removeFile(fileItem.id)}
                            className="text-destructive hover:text-destructive hover:bg-destructive/10 flex-shrink-0"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {alreadyCreatedAttachments && alreadyCreatedAttachments.length > 0 ? (
                <div className="space-y-2">
                  {alreadyCreatedAttachments.map((attachment, idx) => <AttachementPreview key={idx} attachment={attachment} onDeleteAttachment={() => removeAlreadyCreatedAttachment(attachment)} onViewAttachment={() => viewAttachment(attachment)} />)}
                </div>
              ) : (
                <div className="bg-muted text-muted-foreground rounded-md p-4 text-center text-sm">
                  {t("upload.form.labels.noAttachments")}
                </div>
              )}
            </div>
          </FormControl>

          <FormMessage />
        </FormItem>
      )}
    />
    <CustomDialog
      open={isPreviewOpen}
      onOpenChange={setIsPreviewOpen}
      title={t("filePreview")}
      className="max-w-4xl max-h-[90vh] overflow-auto"
    >
      {previewUrl && (
        <div className="mt-4">
          <FilePreview
            preview={previewUrl}
          />
        </div>
      )}
    </CustomDialog>
  </>)
}