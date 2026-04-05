import { z } from "zod";

export const ServiceStatusEnum = z.enum(["Running", "Stopped", "Maintenance"], {
  message: "Invalid Status"
});
export type ServiceStatusType = z.infer<typeof ServiceStatusEnum>

export interface ServiceType {
  id: string
  name: string
  domain?: string
  description?: string
  server: {
    id: string;
    name: string;
    ip: string;
    domain: string;
  }
  sslCertificate: boolean
  sslCertificateByCloudProvider: boolean
  hasBackup: boolean
  backupDestination?: string
  paid: boolean;
  status: ServiceStatusType
  paidAt?: string
  expiredAt?: string
  createdAt: string
  updatedAt: string
}

export interface ServiceInResponseType {
  id: string
  name: string
  domain: string
  description: string | null
  server: {
    id: string;
    name: string;
    ip: string;
    domain: string;
  }
  sslCertificate: boolean
  sslCertificateByCloudProvider: boolean
  hasBackup: boolean
  backupDestination: string | null
  paid: boolean
  status: ServiceStatusType
  paidAt?: string
  expiredAt?: string
  createdAt: string
  updatedAt: string
}

export interface UploadedServiceType {
  name: string
  domain?: string
  description?: string
  sslCertificate: boolean
  sslCertificateByCloudProvider: boolean
  hasBackup: boolean
  backupDestination?: string
  status: ServiceStatusType
  paid: boolean
  paidAt?: string
  expiredAt?: string
  serverId: string
}