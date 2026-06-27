"use client"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { useTranslations } from "next-intl"
import type { ServerType } from "../../types/servers"
import ServerDetails from "./server-details"

interface ServerDetailsModalProps {
  server: ServerType | null
  isOpen: boolean
  onOpenChange: (open: boolean) => void
}

export default function ServerDetailsModal({ server, isOpen, onOpenChange }: ServerDetailsModalProps) {
  const t = useTranslations("modules.infrastructure.servers.serverDetails")

  if (!server) return null

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{t("modal.title")}</DialogTitle>
          <DialogDescription>{t("modal.description")}</DialogDescription>
        </DialogHeader>

        <ServerDetails server={server} />

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {t("modal.close")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
