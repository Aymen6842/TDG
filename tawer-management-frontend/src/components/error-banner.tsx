"use client";

import { useState } from "react";
import { CircleX, XIcon } from "lucide-react";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

interface Props {
  error: string;
  closeButtonIsUsed?: boolean
  onRetry?: () => void;
}

/**
 *
 * @param error - The error message to display in the banner.
 * @param onRetry - Optional callback function to retry the action that caused the error.
 * @param closeButtonIsUsed - Optional boolean to determine if the close button should be displayed (default is true).
 * @returns A React component that displays an error banner with a retry option.
 */
export function ErrorBanner({ error, onRetry, closeButtonIsUsed = true }: Props) {
  const [show, setShow] = useState(true);

  if (!show) return null;

  return (
    error && (
      <Alert className="group relative overflow-hidden border border-destructive/50 bg-gradient-to-r from-destructive/10 via-destructive/5 to-destructive/10 dark:from-destructive/20 dark:via-destructive/10 dark:to-destructive/20 shadow-sm transition-all duration-300 animate-in fade-in slide-in-from-top-2 flex flex-col gap-4 md:flex-row md:items-center md:justify-between p-4 rounded-lg">
        <div className="flex items-start gap-3 md:items-center flex-1">
          <div className="flex-shrink-0 pt-0.5">
            <CircleX className="h-5 w-5 text-destructive dark:text-red-400" />
          </div>
          <AlertDescription className="text-sm font-medium leading-relaxed text-foreground">{error}</AlertDescription>
        </div>
        <div className="flex items-center gap-2 w-full md:w-auto">
          {onRetry && (
            <Button
              onClick={onRetry}
              variant="destructive"
              size="sm"
              className="flex-1 md:flex-none hover:shadow-md transition-all duration-200"
            >
              Retry
            </Button>
          )}
          {closeButtonIsUsed && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShow(false)}
              className="flex-shrink-0 hover:bg-destructive/20 dark:hover:bg-destructive/30 transition-colors duration-200"
              aria-label="Close error message"
            >
              <XIcon className="h-4 w-4" />
            </Button>
          )}
        </div>
      </Alert>
    )
  );
}
