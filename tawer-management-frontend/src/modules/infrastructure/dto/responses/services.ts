import { formatDateToFrontendFormat } from "@/utils/date"
import type { ServiceInResponseType, ServiceType } from "../../types/services"

export function castToServiceType(serviceInResponse: ServiceInResponseType): ServiceType {
  return {
    id: serviceInResponse.id,
    name: serviceInResponse.name,
    domain: serviceInResponse.domain ? serviceInResponse.domain : undefined,
    description: serviceInResponse.description ? serviceInResponse.description : undefined,
    server: {
      id: serviceInResponse.server.id,
      name: serviceInResponse.server.name,
      domain: serviceInResponse.server.domain,
      ip: serviceInResponse.server.ip
    },
    sslCertificate: serviceInResponse.sslCertificate,
    sslCertificateByCloudProvider: serviceInResponse.sslCertificateByCloudProvider,
    hasBackup: serviceInResponse.hasBackup,
    backupDestination: serviceInResponse.backupDestination ? serviceInResponse.backupDestination : undefined,
    paid: serviceInResponse.paid,
    status: serviceInResponse.status,
    paidAt: serviceInResponse.paidAt ? formatDateToFrontendFormat(new Date(serviceInResponse.paidAt)) : undefined,
    expiredAt: serviceInResponse.expiredAt ? formatDateToFrontendFormat(new Date(serviceInResponse.expiredAt)) : undefined,
    createdAt: serviceInResponse.createdAt,
    updatedAt: serviceInResponse.updatedAt,
  }
}
