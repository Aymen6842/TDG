"use client";
import { FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { CircleUserRoundIcon, Trash2Icon, UploadIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useFileUpload } from "@/hooks/use-file-upload";
import { useState } from "react";
import { useFormContext } from "react-hook-form";

interface Props {
  inputName?: string;
  defaultImageUrlInputName?: string;
  defaultImageUrl?: string | null;
}

export default function ProfileImageUpload({
  inputName = "image",
  defaultImageUrlInputName = "imageUrl",
  defaultImageUrl = null
}: Props) {
  const { control } = useFormContext();

  const [
    { files, isDragging },
    {
      openFileDialog,
      removeFile,
      getInputProps,
      handleDrop,
      handleDragOver,
      handleDragEnter,
      handleDragLeave
    }
  ] = useFileUpload({
    accept: "image/png,image/jpeg,image/jpg,image/webp",
    multiple: false
  });

  const [defaultImageUrlIsDisplayed, setDefaultImageUrlIsDisplayed] = useState(true);
  const { onChange, ...inputProps } = getInputProps();

  const file = files[0];
  const previewUrl = file?.preview || (defaultImageUrlIsDisplayed ? defaultImageUrl : null);

  return (
    <FormField
      name={inputName}
      control={control}
      render={({ field }) => (
        <FormItem>
          <FormControl>
            <div
              className="inline-flex items-center gap-4 align-top"
              onDragOver={handleDragOver}
              onDragEnter={handleDragEnter}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}>
              {/* Avatar Preview */}
              <Avatar className="h-20 w-20">
                <AvatarImage src={previewUrl || undefined} />
                <AvatarFallback>
                  <CircleUserRoundIcon className="opacity-45" />
                </AvatarFallback>
              </Avatar>

              {/* Action Buttons */}
              <div className="flex flex-col gap-2">
                <div className="flex gap-2">
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
                  />

                  <Button type="button" variant="outline" size="sm" onClick={openFileDialog}>
                    <UploadIcon className="mr-2 h-4 w-4" />
                    {previewUrl ? "Change image" : "Upload image"}
                  </Button>

                  {defaultImageUrlInputName && defaultImageUrl ? (
                    <FormField
                      name={defaultImageUrlInputName}
                      render={({ field: defaultField }) => (
                        <div className="flex flex-col gap-3">
                          {defaultImageUrl !== null && (
                            <input type="hidden" {...defaultField} value={defaultImageUrl} />
                          )}
                          {previewUrl && (
                            <Button
                              type="button"
                              size="icon"
                              variant="destructive"
                              className="h-9 w-9"
                              onClick={() => {
                                defaultField.onChange("");
                                setDefaultImageUrlIsDisplayed(false);
                              }}>
                              <Trash2Icon className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      )}
                    />
                  ) : (
                    previewUrl && (
                      <Button
                        type="button"
                        size="icon"
                        variant="destructive"
                        className="h-9 w-9"
                        onClick={() => {
                          removeFile(file.id);
                          field.onChange(undefined);
                          setDefaultImageUrlIsDisplayed(false);
                        }}>
                        <Trash2Icon className="h-4 w-4" />
                      </Button>
                    )
                  )}
                </div>
              </div>

              {/* Hidden input for the default URL to keep form state in sync */}
              {defaultImageUrl && (
                <input
                  type="hidden"
                  name={defaultImageUrlInputName}
                  value={defaultImageUrlIsDisplayed ? defaultImageUrl : ""}
                />
              )}
            </div>
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
