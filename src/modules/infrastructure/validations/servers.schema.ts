import { z } from "zod"


interface Params {
  t: (key: string) => string
}

export const getServerFormSchema = ({ t }: Params) =>
  z.object({
    name: z.string({
      required_error: t("name.required"),
    }).min(1, t("name.required")),

    domain: z.string({
      required_error: t("domain.required"),
    }).min(1, t("domain.required")),

    description: z.string({
      required_error: t("description.required"),
    }).min(1, t("description.required")),

    ip: z.string({
      required_error: t("ip.required"),
    }).min(1, t("ip.required")),

    cpus: z.string({
      required_error: t("cpus.required"),
    }).min(1, t("cpus.required")),

    ram: z.string({
      required_error: t("ram.required"),
    }).min(1, t("ram.required")),

    storage: z.string({
      required_error: t("storage.required"),
    }).min(1, t("storage.required")),

    bandwidth: z.string({
      required_error: t("bandwidth.required"),
    }).min(1, t("bandwidth.required")),

    status: z.enum(["Running", "Stopped", "Maintenance"], {
      required_error: t("status.required"),
      message: t("status.invalid")
    }),


    backupCloudProvider: z.boolean().optional(),

    paid: z.boolean().optional(),

    paidAt: z.string().optional(),

    expiredAt: z.string().optional(),

    managers: z.array(z.string(), {
      required_error: t("managers.required"),
    }).min(1, {
      message: t("managers.required"),
    }),
  })

export type ServerFormSchema = z.infer<
  ReturnType<typeof getServerFormSchema>
>
