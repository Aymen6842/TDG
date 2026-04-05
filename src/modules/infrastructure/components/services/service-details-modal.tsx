"use client";
import { useTranslations } from "next-intl";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ServiceType } from "../../types/services";
import ServiceDetails from "./service-details";

interface ServiceDetailsModalProps {
  service: ServiceType | null;
  isOpen: boolean
  onOpenChange: (open: boolean) => void
}

export default function ServiceDetailsModal({ service, isOpen, onOpenChange }: ServiceDetailsModalProps) {
  const t = useTranslations("modules.infrastructure.services.serviceDetails")

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{t("modal.title")}</DialogTitle>
          <DialogDescription>{t("modal.description")}</DialogDescription>
        </DialogHeader>

        {service && <ServiceDetails service={service} />}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {t("modal.close")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>

  )
}
