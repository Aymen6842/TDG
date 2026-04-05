"use client";
import React, { useEffect } from "react";
import { useTranslations } from "next-intl";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Zap } from "lucide-react";
import { ServiceType } from "@/modules/infrastructure/types/services";
import ServiceUploadForm from "./form";

interface Props {
  service?: ServiceType
  onClose?: () => void
  triggerOpenning?: boolean
  triggerButtonIsUsed?: boolean
}

export default function UploadServiceDialog({
  service,
  onClose,
  triggerOpenning = false,
  triggerButtonIsUsed = true,
}: Props) {
  const [open, setOpen] = React.useState(false)
  const t = useTranslations(
    service
      ? "modules.infrastructure.services.upload.updateService"
      : "modules.infrastructure.services.upload.createService",
  )

  useEffect(() => {
    if (triggerOpenning) setOpen(true)
  }, [triggerOpenning])

  const closePopUp = () => {
    setOpen(false)
    onClose?.()
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(open) => {
        if (open) setOpen(true)
        else closePopUp()
      }}
    >
      <DialogTrigger asChild>
        {triggerButtonIsUsed && (
          <Button>
            <Zap />
            <span className="hidden sm:inline">{t("button")}</span>
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-3xl max-w-3xl">
        <ScrollArea className="max-h-[80vh] pr-3 rtl:pr-0 rtl:pl-3">
          <DialogHeader>
            <DialogTitle>{t("title")}</DialogTitle>
            <DialogDescription>{t("description")}</DialogDescription>
          </DialogHeader>
          <div className="pt-5">
            <ServiceUploadForm onFinish={closePopUp} service={service} />
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}
