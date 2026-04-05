"use client";
import React, { useEffect } from "react";
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
import { ScrollArea } from "@/components/ui/scroll-area";
import TeamUploadForm from "./form";
import { UserPlus } from "lucide-react";
import { TeamType } from "@/modules/users/types/teams";

interface Props {
  team?: TeamType;
  onClose?: () => void;
  triggerOpenning?: boolean;
  triggerButtonIsUsed?: boolean;
}

export default function UploadTeamDialog({
  team,
  onClose,
  triggerOpenning = false,
  triggerButtonIsUsed = true
}: Props) {
  const [open, setOpen] = React.useState(false);
  const t = useTranslations(
    team ? "modules.users.teams.upload.updateTeam" : "modules.users.teams.upload.createTeam"
  );

  //dialog should be openned when a new team is passed
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
            <TeamUploadForm onFinish={closePopUp} team={team} />
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
