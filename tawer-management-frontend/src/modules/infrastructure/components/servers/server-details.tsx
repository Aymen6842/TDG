"use client"

import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useTranslations } from "next-intl"
import { format } from "date-fns"
import type { ServerStatusType, ServerType } from "../../types/servers"
import { ScrollArea } from "@/components/ui/scroll-area"
import DOMPurify from "dompurify"

interface ServerDetailsProps {
  server: ServerType
}

export default function ServerDetails({ server }: ServerDetailsProps) {
  const t = useTranslations("modules.infrastructure.servers")

  const statusMap: Record<
    ServerStatusType,
    "success" | "destructive" | "warning"
  > = {
    Running: "success",
    Stopped: "destructive",
    Maintenance: "warning",
  }

  const statusClass = statusMap[server.status]

  const formatDate = (date: string) =>
    format(new Date(date), "MMM d, yyyy - h:mm a")

  return (
    <ScrollArea className="max-h-[60vh]">
      <div className="space-y-6">
        {/* Basic Information */}
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <p className="text-sm font-medium text-muted-foreground">
              {t("serverDetails.details.name")}
            </p>
            <p className="text-base font-semibold">{server.name}</p>
          </div>

          <div>
            <p className="text-sm font-medium text-muted-foreground">
              {t("serverDetails.details.status")}
            </p>
            <Badge variant={statusClass} className="capitalize mt-1">
              {t(`statuses.${server.status.toLowerCase()}`)}
            </Badge>
          </div>

          <div>
            <p className="text-sm font-medium text-muted-foreground">
              {t("serverDetails.details.description")}
            </p>
            <div dangerouslySetInnerHTML={{
              __html: DOMPurify.sanitize(server.description as string),
            }} className="text-muted-foreground text-sm" />
          </div>
        </div>

        {/* Network Information */}
        <div className="space-y-3">
          <h3 className="font-semibold text-sm">
            {t("serverDetails.details.networkInfo")}
          </h3>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                {t("serverDetails.details.domain")}
              </p>
              <p className="text-sm font-mono">{server.domain}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                {t("serverDetails.details.ip")}
              </p>
              <p className="text-sm font-mono">{server.ip}</p>
            </div>
          </div>
        </div>

        {/* Hardware Information */}
        <div className="space-y-3">
          <h3 className="font-semibold text-sm">
            {t("serverDetails.details.hardwareInfo")}
          </h3>
          <div className="grid sm:grid-cols-4 gap-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                {t("serverDetails.details.cpus")}
              </p>
              <p className="text-sm">{server.cpus}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                {t("serverDetails.details.ram")}
              </p>
              <p className="text-sm">{server.ram}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                {t("serverDetails.details.storage")}
              </p>
              <p className="text-sm">{server.storage}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                {t("serverDetails.details.bandwidth")}
              </p>
              <p className="text-sm">{server.bandwidth}</p>
            </div>
          </div>
        </div>

        {/* Backup */}
        <div>
          <p className="text-sm font-medium text-muted-foreground">
            {t("serverDetails.details.backupCloudProvider")}
          </p>
          <Badge
            variant={server.backupCloudProvider ? "default" : "secondary"}
            className="mt-1"
          >
            {server.backupCloudProvider
              ? t("serverDetails.details.enabled")
              : t("serverDetails.details.disabled")}
          </Badge>
        </div>

        {/* Managers */}
        {server.managers.length > 0 && (
          <div className="space-y-3">
            <h3 className="font-semibold text-sm">
              {t("serverDetails.details.managers")}
            </h3>

            <div className="grid sm:grid-cols-2 gap-3">
              {server.managers.map((manager) => (
                <div
                  key={manager.id}
                  className="flex items-center gap-3 rounded-md border p-3"
                >
                  <Avatar>
                    <AvatarImage src={manager.image} alt={manager.name} />
                    <AvatarFallback>
                      {manager.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex-1">
                    <p className="text-sm font-medium">{manager.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {manager.email}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {manager.phone}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Billing Information */}
        <div className="space-y-3">
          <h3 className="font-semibold text-sm">
            {t("serverDetails.details.billingInfo")}
          </h3>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                {t("serverDetails.details.paymentStatus")}
              </p>
              <Badge
                variant={server.paid ? "success" : "destructive"}
                className="mt-1"
              >
                {server.paid
                  ? t("serverDetails.details.paidStatus")
                  : t("serverDetails.details.unpaidStatus")}
              </Badge>
            </div>

            {server.paidAt && (
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  {t("serverDetails.details.paidAt")}
                </p>
                <p className="text-sm">{formatDate(server.paidAt)}</p>
              </div>
            )}

            {server.expiredAt && (
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  {t("serverDetails.details.expiredAt")}
                </p>
                <p className="text-sm">{formatDate(server.expiredAt)}</p>
              </div>
            )}
          </div>
        </div>

        {/* Metadata */}
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <p className="text-sm font-medium text-muted-foreground">
              {t("serverDetails.details.createdAt")}
            </p>
            <p className="text-sm">{formatDate(server.createdAt)}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">
              {t("serverDetails.details.updatedAt")}
            </p>
            <p className="text-sm">{formatDate(server.updatedAt)}</p>
          </div>
        </div>
      </div>
    </ScrollArea>
  )
}
