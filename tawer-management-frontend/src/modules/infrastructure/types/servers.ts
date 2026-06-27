import { z } from "zod";

export const ServerStatusEnum = z.enum(["Running", "Stopped", "Maintenance"]);
export type ServerStatusType = z.infer<typeof ServerStatusEnum>

export interface ManagerType {
  id: string
  name: string
  email: string
  phone: string
  image: string
}

export interface ServerType {
  id: string
  name: string
  domain: string
  description: string
  ip: string
  cpus: string
  ram: string
  storage: string
  bandwidth: string
  backupCloudProvider: boolean
  paid: boolean
  status: ServerStatusType
  paidAt?: string
  expiredAt?: string
  managers: ManagerType[]
  createdAt: string
  updatedAt: string
}

export interface ServerInResponseType {
  id: string
  name: string
  domain: string
  description: string
  ip: string
  cpus: string
  ram: string
  storage: string
  bandwidth: string
  backupCloudProvider: boolean
  paid: boolean
  status: ServerStatusType
  paidAt?: string
  expiredAt?: string
  managers: ManagerType[]
  createdAt: string
  updatedAt: string
}

export interface UploadedServerType {
  id?: string
  name: string
  domain: string
  description: string
  ip: string
  cpus: string
  ram: string
  storage: string
  bandwidth: string
  status: ServerStatusType
  backupCloudProvider: boolean
  paid: boolean
  paidAt?: string
  expiredAt?: string
  managersIds: string[]
}