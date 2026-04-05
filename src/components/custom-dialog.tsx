"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog";

interface CustomDialogProps {
  trigger?: React.ReactNode;
  title?: string;
  description?: string;
  header?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  open?: boolean;
  previewUrl?: string;
  onOpenChange?: (open: boolean) => void;
}

export default function CustomDialog({
  trigger,
  title,
  description,
  header,
  children,
  className = "max-w-md",
  open: controlledOpen,
  onOpenChange
}: CustomDialogProps) {
  const [internalOpen, setInternalOpen] = useState(false);

  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen : internalOpen;
  const setOpen = isControlled ? onOpenChange || (() => { }) : setInternalOpen;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
      <DialogContent className={className}>
        {header ? (
          <>
            <DialogTitle className="sr-only">Dialog</DialogTitle>
            {header}
          </>
        ) : (
          (title || description) && (
            <DialogHeader>
              {title && <DialogTitle>{title}</DialogTitle>}
              {description && <DialogDescription>{description}</DialogDescription>}
            </DialogHeader>
          )
        )}
        {children}
      </DialogContent>
    </Dialog>
  );
}
