import { z } from "zod"

interface Params {
  t: (key: string) => string
}

export const getServiceFormSchema = ({ t }: Params) =>
  z.object({
    name: z.string({
      required_error: t("name.required")

    }).min(1, t("name.required")),
    domain: z.string().optional(),
    description: z.string().optional(),
    sslCertificate: z.boolean().optional(),
    sslCertificateByCloudProvider: z.boolean().optional(),
    hasBackup: z.boolean().optional(),
    backupDestination: z.string().optional(),
    status: z.enum(["Running", "Stopped", "Maintenance"], {
      message: t("status.invalid"),
      required_error: t("status.required")
    }),
    paid: z.boolean().optional(),
    paidAt: z.string().optional(),
    expiredAt: z.string().optional(),
    serverId: z.string({
      required_error: t("serverId.required")
    }).min(1, t("serverId.required")),
  })

export type ServiceFormSchema = z.infer<ReturnType<typeof getServiceFormSchema>>
