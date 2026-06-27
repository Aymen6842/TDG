"use client";
import React, { useEffect } from "react";
import { UserPlus } from "lucide-react";
import { useTranslations } from "next-intl";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog";

import { Button } from "@/components/ui/button";
import { UserType } from "../../types/users";
import { ScrollArea } from "@/components/ui/scroll-area";
import UserUploadForm from "./form";

interface Props {
  user?: UserType;
  onClose?: () => void;
  triggerOpenning?: boolean;
  triggerButtonIsUsed?: boolean;
}

export default function UploadUserDialog({
  user,
  onClose,
  triggerOpenning = false,
  triggerButtonIsUsed = true
}: Props) {
  const [open, setOpen] = React.useState(false);
  const t = useTranslations(
    user ? "modules.users.upload.updateUser" : "modules.users.upload.createUser"
  );

  //dialog should be openned when a new user is passed
  useEffect(() => {
    if (triggerOpenning) setOpen(true);
  }, [triggerOpenning]);

  const closePopUp = () => {
    setOpen(false);
    onClose?.();
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(open) => {
        if (open) setOpen(true);
        else closePopUp();
      }}>
      <DialogTrigger asChild>
        {triggerButtonIsUsed && (
          <Button>
            <UserPlus />
            <span className="hidden sm:inline">{t("button")}</span>
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <ScrollArea className="max-h-[80vh] pr-3 rtl:pr-0 rtl:pl-3">
          <DialogHeader>
            <DialogTitle>{t("title")}</DialogTitle>
            <DialogDescription>{t("description")}</DialogDescription>
          </DialogHeader>
          <div className="pt-5">
            <UserUploadForm onFinish={closePopUp} user={user} />
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
