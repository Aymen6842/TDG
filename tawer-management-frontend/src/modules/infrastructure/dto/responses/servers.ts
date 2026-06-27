import { formatDateToFrontendFormat } from "@/utils/date"
import type { ServerInResponseType, ServerType } from "../../types/servers"

export function castToServerType(serverInResponse: ServerInResponseType): ServerType {
  return {
    id: serverInResponse.id,
    name: serverInResponse.name,
    domain: serverInResponse.domain,
    description: serverInResponse.description,
    ip: serverInResponse.ip,
    cpus: serverInResponse.cpus,
    ram: serverInResponse.ram,
    storage: serverInResponse.storage,
    bandwidth: serverInResponse.bandwidth,
    backupCloudProvider: serverInResponse.backupCloudProvider,
    paid: serverInResponse.paid,
    status: serverInResponse.status,
    paidAt: serverInResponse.paidAt ? formatDateToFrontendFormat(new Date(serverInResponse.paidAt)) : undefined,
    expiredAt: serverInResponse.expiredAt ? formatDateToFrontendFormat(new Date(serverInResponse.expiredAt)) : undefined,
    managers: serverInResponse.managers,
    createdAt: serverInResponse.createdAt,
    updatedAt: serverInResponse.updatedAt,
  }
}
