"use client"

import { Badge } from "@/components/ui/badge"
import { useTranslations } from "next-intl"
import { ServiceStatusType, ServiceType } from "../../types/services"
import { ScrollArea } from "@/components/ui/scroll-area"
import { format } from "date-fns"
import DOMPurify from "dompurify"

interface ServiceDetailsProps {
  service: ServiceType
}

export default function ServiceDetails({ service }: ServiceDetailsProps) {
  const t = useTranslations("modules.infrastructure.services")

  // Matching the status logic from ServerDetails
  const statusMap: Record<ServiceStatusType, string> = {
    Running: "success",
    Stopped: "destructive",
    Maintenance: "warning",
  }

  const statusVariant = (statusMap[service.status] ?? "default") as any

  return (
    <ScrollArea className="max-h-[60vh] ">
      <div className="flex flex-col space-y-6">
        {/* Basic Information */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">{t("serviceDetails.fields.name")}</p>
            <p className="text-base font-semibold">{service.name}</p>
          </div>
          {service.domain && <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">{t("serviceDetails.fields.serviceDomain")}</p>
            <p className="text-sm font-mono">{service.domain}</p>
          </div>}
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">{t("serviceDetails.fields.status")}</p>
            <Badge variant={statusVariant} className="capitalize w-fit">
              {t(`statuses.${service.status.toLowerCase()}`)}
            </Badge>
          </div>
        </div>

        <div className="space-y-1">
          <p className="text-sm font-medium text-muted-foreground">{t("serviceDetails.fields.description")}</p>
          <div dangerouslySetInnerHTML={{
            __html: DOMPurify.sanitize(service.description as string),
          }} className="text-muted-foreground text-sm" />        </div>

        {/* Server Information */}
        <div className="space-y-3">
          <h3 className="font-semibold text-sm">{t("serviceDetails.sections.server")}</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">{t("serviceDetails.fields.serverName")}</p>
              <p className="text-sm font-mono">{service.server.name}</p>
            </div>

            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">{t("serviceDetails.fields.serverDomain")}</p>
              <p className="text-sm font-mono">{service.server.domain}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">{t("serviceDetails.fields.serverIp")}</p>
              <p className="text-sm font-mono">{service.server.ip}</p>
            </div>
          </div>
        </div>

        {/* Security & Backup */}
        <div className="space-y-3">
          <h3 className="font-semibold text-sm">{t("serviceDetails.sections.sslAndBackup")}</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">{t("serviceDetails.fields.sslCertificate")}</p>
              <Badge variant={service.sslCertificate ? "outline" : "secondary"}>
                {service.sslCertificate ? t("serviceDetails.common.yes") : t("serviceDetails.common.no")}
              </Badge>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">{t("serviceDetails.fields.sslCertificateByCloudProvider")}</p>
              <Badge variant={service.sslCertificateByCloudProvider ? "outline" : "secondary"}>
                {service.sslCertificateByCloudProvider ? t("serviceDetails.common.yes") : t("serviceDetails.common.no")}
              </Badge>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">{t("serviceDetails.fields.hasBackup")}</p>
              <Badge variant={service.hasBackup ? "outline" : "secondary"}>
                {service.hasBackup ? t("serviceDetails.common.yes") : t("serviceDetails.common.no")}
              </Badge>
            </div>
          </div>
        </div>

        {/* Billing Information */}
        <div className="space-y-3">
          <h3 className="font-semibold text-sm">{t("serviceDetails.sections.billing")}</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">{t("serviceDetails.details.paid")}</p>
              <Badge variant={service.paid ? "success" : "secondary"} className="mt-1">
                {service.paid ? t("serviceDetails.details.paidStatus") : t("serviceDetails.details.unpaidStatus")}
              </Badge>
            </div>
            {service.expiredAt && <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">{t("serviceDetails.fields.expiredAt")}</p>
              <p className="text-sm">{format(service.expiredAt, "MMM d, yyyy - h:mm a")}</p>
            </div>}
            {service.paidAt && <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">{t("serviceDetails.fields.paidAt")}</p>
              <p className="text-sm">{format(service.paidAt, "MMM d, yyyy - h:mm a")}</p>
            </div>}
          </div>
        </div>

        {/* Timestamps */}
        <div className="pt-4 border-t grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <p className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground">
              {t("serviceDetails.fields.createdAt")}
            </p>
            <p className="text-xs text-muted-foreground">{format(service.createdAt, "MMM d, yyyy - h:mm a")}</p>
          </div>
          <div className="space-y-1">
            <p className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground">
              {t("serviceDetails.fields.updatedAt")}
            </p>
            <p className="text-xs text-muted-foreground">{format(service.updatedAt, "MMM d, yyyy - h:mm a")}</p>
          </div>
        </div>
      </div>
    </ScrollArea>
  )
}