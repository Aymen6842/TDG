"use client";
import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import type { CustomError } from "@/utils/custom-error";
import { toast } from "sonner";
import type { ServiceType } from "../../types/services";
import { ServiceFormSchema, getServiceFormSchema } from "../../validations/services.schema";
import cleanServiceDataToUpload from "../../dto/requests/services";
import uploadServiceOnServerSide from "../../services/uploads/service";

interface Params {
  service?: ServiceType
  onSuccess?: () => void
}

export default function useServiceUpload({ service, onSuccess }: Params) {
  const queryClient = useQueryClient()
  const t = useTranslations("modules.infrastructure.services")
  const tValidations = useTranslations("modules.infrastructure.validations.services")
  const tErrors = useTranslations("modules.infrastructure.errors.services")
  const sharedErrors = useTranslations("shared.errors")

  const router = useRouter()

  const schema = getServiceFormSchema({ t: tValidations });

  const form = useForm<ServiceFormSchema>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "",
      status: "Running",
      serverId: "",
    }

  })

  const [isPending, setIsPending] = useState(false)
  const [error, setError] = useState("")

  async function onSubmit(data: ServiceFormSchema) {
    setIsPending(true)
    if (error !== "") setError("")

    try {
      const castedServiceDataToUpload = cleanServiceDataToUpload(data)
      await uploadServiceOnServerSide({
        service: castedServiceDataToUpload,
        id: service ? service.id : "",
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
          case "SERVICE_ALREADY_EXIST":
            toast.error(tErrors("serviceAlreadyExist"))
            setError(tErrors("serviceAlreadyExist"))
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

      toast.error(tErrors("uploadServiceFailed"))
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
