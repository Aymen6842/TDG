"use client";

import { FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircleIcon, ImageIcon, UploadIcon, XIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useFileUpload } from "@/hooks/use-file-upload";
import { useEffect, useState } from "react";
import { useFormContext, useWatch } from "react-hook-form";
import { useTranslations } from "next-intl";

interface Props {
  inputName?: string;
  label: string;
  defaultImagesUrl?: string[];
  defaultImagesInputName?: string;
  formatDefaultImageUrlOnUpload?: (url: string) => string;
}

/**
 * @param inputName - used to add images input to the form data
 * @param
 * @returns
 */

export default function ImagesUpload({
  inputName = "images",
  defaultImagesInputName = "defaultImagesUrl",
  label,
  defaultImagesUrl = [],
  formatDefaultImageUrlOnUpload = (url: string) => new URL(url).pathname
}: Props) {
  const t = useTranslations("shared.filesUpload");
  const form = useFormContext();
  const imagesInputInForm = useWatch({
    control: form.control,
    name: inputName
  });

  const [defaultImages, setDefaultImages] = useState<string[]>([]);
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
    multiple: true
  });

  const { onChange, ...inputProps } = getInputProps();

  useEffect(() => {
    setDefaultImages(defaultImagesUrl);
  }, [defaultImagesUrl]);

  useEffect(() => {
    if (!imagesInputInForm || imagesInputInForm.length === 0)
      files.forEach((file) => removeFile(file.id));
  }, [imagesInputInForm]);

  const removeDefaultImage = (imageToRemoveUrl: string) => {
    const updatedImages = defaultImages.filter((imageUrl) => imageUrl !== imageToRemoveUrl);
    setDefaultImages(updatedImages);

    if (updatedImages.length === 0) form.setValue(defaultImagesInputName, []);
    else
      updatedImages.forEach((image, idx) => {
        form.setValue(`${defaultImagesInputName}.${idx}`, formatDefaultImageUrlOnUpload(image));
      });
  };

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
                    data-files={files.length > 0 || undefined}
                    className="border-input data-[dragging=true]:bg-accent/50 has-[input:focus]:border-ring has-[input:focus]:ring-ring/50 relative flex min-h-52 flex-col items-center overflow-hidden rounded-xl border border-dashed p-4 transition-colors not-data-[files]:justify-center has-[input:focus]:ring-[3px]">
                    <input
                      {...inputProps}
                      onChange={(e) => {
                        const files = e.target.files;
                        if (files) {
                          field.onChange(Array.from(files));
                          onChange?.(e);
                        }
                      }}
                      className="sr-only"
                      aria-label={t("uploadAriaLabel")}
                    />

                    {files.length > 0 || defaultImages.length > 0 ? (
                      <div className="flex flex-col gap-3">
                        <div className="flex items-center justify-between gap-2">
                          <h3 className="truncate text-sm font-medium">
                            {t("uploadedFiles", { count: files.length })}
                          </h3>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={openFileDialog}
                            disabled={files.length >= 5}>
                            <UploadIcon
                              className="-ms-0.5 size-3.5 opacity-60"
                              aria-hidden="true"
                            />
                            {t("addMore")}
                          </Button>
                        </div>

                        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                          {defaultImages.map((imageUrl, idx) => (
                            <div
                              key={imageUrl}
                              className="bg-accent relative aspect-square rounded-md border">
                              <img
                                src={imageUrl}
                                alt={t("imageAlt", { index: idx + 1 })}
                                className="size-full rounded-[inherit] object-contain"
                              />
                              <Button
                                type="button"
                                onClick={() => removeDefaultImage(imageUrl)}
                                size="icon"
                                className="border-background focus-visible:border-background absolute -top-2 -right-2 size-6 rounded-full border-2 shadow-none">
                                <XIcon className="size-3.5" />
                              </Button>
                            </div>
                          ))}
                          {files.map((file) => (
                            <div
                              key={file.id}
                              className="bg-accent relative aspect-square rounded-md border">
                              <img
                                src={file.preview}
                                alt={file.file.name}
                                className="size-full rounded-[inherit] object-contain"
                              />
                              <Button
                                type="button"
                                onClick={() => removeFile(file.id)}
                                size="icon"
                                className="border-background focus-visible:border-background absolute -top-2 -right-2 size-6 rounded-full border-2 shadow-none">
                                <XIcon className="size-3.5" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      </div>
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
                          {t("selectImages")}
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
