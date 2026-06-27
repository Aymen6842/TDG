"use client";
import { FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircleIcon, ImageIcon, UploadIcon, XIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useFileUpload } from "@/hooks/use-file-upload";
import { useState } from "react";
import { useTranslations } from "next-intl";

interface Props {
  inputName?: string;
  defaultImageUrlInputName?: string;
  label: string;
  defaultImageUrl?: string | null;
}

export default function ImageUpload({
  inputName = "image",
  defaultImageUrlInputName = "imageUrl",
  label,
  defaultImageUrl = null
}: Props) {
  const t = useTranslations("shared.filesUpload");

  const [
    { files, isDragging, errors },
    {
      handleDragEnter,
      handleDragLeave,
      handleDragOver,
      handleDrop,
      openFileDialog,
      removeFile,
      getInputProps
    }
  ] = useFileUpload({
    accept: "image/png,image/jpeg,image/jpg,image/webp",
    multiple: false
  });

  const [defaultImageUrlIsDisplayed, setDefaultImageUrlIsDisplayed] = useState(true);
  const { onChange, ...inputProps } = getInputProps();
  const file = files[0]; // single file

  return (
    <Card>
      <CardHeader>
        <CardTitle>{label}</CardTitle>
      </CardHeader>
      <CardContent>
        <FormField
          name={inputName}
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <div className="flex flex-col gap-2">
                  <div
                    onDragEnter={handleDragEnter}
                    onDragLeave={handleDragLeave}
                    onDragOver={handleDragOver}
                    onDrop={handleDrop}
                    data-dragging={isDragging || undefined}
                    data-files={file || undefined}
                    className="border-input data-[dragging=true]:bg-accent/50 has-[input:focus]:border-ring has-[input:focus]:ring-ring/50 relative flex min-h-52 flex-col items-center overflow-hidden rounded-xl border border-dashed p-4 transition-colors not-data-[files]:justify-center has-[input:focus]:ring-[3px]">
                    <input
                      {...inputProps}
                      onChange={(e) => {
                        const fileList = e.target.files;
                        if (fileList && fileList.length > 0) {
                          field.onChange(fileList[0]);
                          onChange?.(e);
                        }
                      }}
                      className="sr-only"
                      aria-label={t("uploadAriaLabel")}
                    />

                    {file ? (
                      <div className="flex flex-col gap-3">
                        <div className="relative aspect-square w-full max-w-sm rounded-md border">
                          <img
                            src={file.preview}
                            alt={file.file.name}
                            className="size-full rounded-[inherit] object-contain"
                          />
                          <Button
                            type="button"
                            onClick={() => {
                              field.onChange(undefined);
                              removeFile(file.id);
                            }}
                            size="icon"
                            className="border-background focus-visible:border-background absolute -top-2 -right-2 size-6 rounded-full border-2 shadow-none">
                            <XIcon className="size-3.5" />
                          </Button>
                        </div>
                      </div>
                    ) : defaultImageUrl && defaultImageUrlIsDisplayed ? (
                      <FormField
                        name={defaultImageUrlInputName}
                        render={({ field: defaultField }) => (
                          <div className="flex flex-col gap-3">
                            <input type="hidden" {...defaultField} value={defaultImageUrl} />
                            <div className="relative aspect-square w-full max-w-sm rounded-md border">
                              <img
                                src={defaultImageUrl}
                                alt={t("defaultImageAlt")}
                                className="size-full rounded-[inherit] object-contain"
                              />
                              <Button
                                type="button"
                                onClick={() => {
                                  setDefaultImageUrlIsDisplayed(false);
                                  defaultField.onChange("");
                                }}
                                size="icon"
                                className="border-background focus-visible:border-background absolute -top-2 -right-2 size-6 rounded-full border-2 shadow-none">
                                <XIcon className="size-3.5" />
                              </Button>
                            </div>
                          </div>
                        )}
                      />
                    ) : (
                      <div className="flex flex-col items-center justify-center px-4 py-3 text-center">
                        <div
                          className="bg-background mb-2 flex size-11 shrink-0 items-center justify-center rounded-full border"
                          aria-hidden="true">
                          <ImageIcon className="size-4 opacity-60" />
                        </div>
                        <p className="mb-1.5 text-sm font-medium">{t("dropHere")}</p>
                        <Button
                          type="button"
                          variant="outline"
                          className="mt-4"
                          onClick={openFileDialog}>
                          <UploadIcon className="-ms-1 opacity-60" aria-hidden="true" />
                          {t("selectImage")}
                        </Button>
                      </div>
                    )}
                  </div>

                  {errors.length > 0 && (
                    <div className="text-destructive flex items-center gap-1 text-xs" role="alert">
                      <AlertCircleIcon className="size-3 shrink-0" />
                      <span>{errors[0]}</span>
                    </div>
                  )}
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </CardContent>
    </Card>
  );
}
