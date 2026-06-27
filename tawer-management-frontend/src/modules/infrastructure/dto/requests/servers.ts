import { formatDateToBackendFormat } from "@/utils/date";
import { UploadedServerType } from "../../types/servers";
import { ServerFormSchema } from "../../validations/servers.schema";



export function cleanServerDataToUpload(data: ServerFormSchema): UploadedServerType {
  return {
    name: data.name,
    domain: data.domain,
    description: data.description,
    ip: data.ip,
    cpus: data.cpus,
    ram: data.ram,
    storage: data.storage,
    bandwidth: data.bandwidth,
    status: data.status || "Running",
    backupCloudProvider: data.backupCloudProvider ? true : false,
    paid: data.paid ? true : false,
    paidAt: data.paidAt ? formatDateToBackendFormat(new Date(data.paidAt)) : undefined,
    expiredAt: data.expiredAt ? formatDateToBackendFormat(new Date(data.expiredAt)) : undefined,
    managersIds: data.managers,
  }
}
