import { formatDateToBackendFormat } from "@/utils/date";
import { UploadedServiceType } from "../../types/services";
import { ServiceFormSchema } from "../../validations/services.schema";

export default function cleanServiceDataToUpload(data: ServiceFormSchema): UploadedServiceType {
  return {
    name: data.name,
    domain: data.domain,
    description: data.description,
    sslCertificate: data.sslCertificate ? true : false,
    sslCertificateByCloudProvider: data.sslCertificateByCloudProvider ? true : false,
    hasBackup: data.hasBackup ? true : false,
    backupDestination: data.backupDestination,
    status: data.status || "Running",
    paid: data.paid ? true : false,
    paidAt: data.paidAt ? formatDateToBackendFormat(new Date(data.paidAt)) : undefined,
    expiredAt: data.expiredAt ? formatDateToBackendFormat(new Date(data.expiredAt)) : undefined,
    serverId: data.serverId,
  }
}
