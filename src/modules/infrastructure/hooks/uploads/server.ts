"use client"

import { useQueryClient } from "@tanstack/react-query"
import { useState } from "react"
import { SubmitHandler, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useTranslations } from "next-intl"
import { useRouter } from "next/navigation"
import type { CustomError } from "@/utils/custom-error"
import { toast } from "sonner"
import { ServerType } from "../../types/servers"
import { ServerFormSchema, getServerFormSchema } from "../../validations/servers.schema"
import { cleanServerDataToUpload } from "../../dto/requests/servers"
import uploadServerOnServerSide from "../../services/uploads/server"
interface Params {
  server?: ServerType
  onSuccess?: () => void
}

export default function useServerUpload({ server, onSuccess }: Params) {
  const queryClient = useQueryClient()
  const t = useTranslations("modules.infrastructure.servers")
  const tValidations = useTranslations("modules.infrastructure.validations.servers")
  const tErrors = useTranslations("modules.infrastructure.errors.servers")
  const sharedErrors = useTranslations("shared.errors")

  const router = useRouter()

  const schema = getServerFormSchema({ t: tValidations })

  const form = useForm<ServerFormSchema>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "",
      domain: "",
      description: "",
      ip: "",
      cpus: "",
      ram: "",
      storage: "",
      bandwidth: "",
      status: "Running",
      managers: [],
    },
  })

  const [isPending, setIsPending] = useState(false)
  const [error, setError] = useState("")

  const onSubmit: SubmitHandler<ServerFormSchema> = async (data: ServerFormSchema) => {
    setIsPending(true)
    if (error !== "") setError("")

    try {
      const castedServerDataToUpload = cleanServerDataToUpload(data)
      await uploadServerOnServerSide({
        server: castedServerDataToUpload,
        id: server ? server.id : "",
      })

      toast.success(t("upload.success"))
      onSuccess?.()

      form.reset()

      queryClient.invalidateQueries({ queryKey: ["infrastructure"] })
    } catch (thrownError) {
      const error = thrownError as CustomError

      if (error.status === 401) {
        router.push("/login")
        return
      }

      if (error.status === 400) {
        switch (error.code) {
          case "SERVER_ALREADY_EXIST":
            toast.error(tErrors("serverAlreadyExist"))
            setError(tErrors("serverAlreadyExist"))
            return

          case "INVALID_FORMAT":
            toast.error(tErrors("invalidFormat"))
            setError(tErrors("invalidFormat"))
            return

          default:
            toast.error(tErrors("invalidFormat"))
            setError(tErrors("invalidFormat"))
            return
        }
      }

      if (error.status === 403) {
        toast.error(sharedErrors("permissionDenied"))
        setError(sharedErrors("permissionDenied"))
        return
      }

      if (error.status === 500) {
        toast.error(tErrors("serverError"))
        setError(tErrors("serverError"))
        return
      }

      toast.error(tErrors("uploadServerFailed"))
    } finally {
      setIsPending(false)
    }
  }

  return {
    form,
    error,
    isPending,
    onSubmit,
  }
}
