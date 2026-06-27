import { PATCH, POST } from "@/lib/http-methods"
import type { AxiosError } from "axios"
import { CustomError } from "@/utils/custom-error"
import type { ErrorDataResponse } from "@/types"
import extractJWTokens from "@/modules/auth/utils/jwt/extract-tokens"
import { refreshToken } from "@/modules/auth/services/refresh-token"
import { UploadedServiceType } from "../../types/services"

interface Params {
  service: UploadedServiceType
  id?: string
}

export default async function uploadServiceOnServerSide({ service, id = "" }: Params) {
  const { access } = extractJWTokens()
  const headers = {
    Authorization: `Bearer ${access}`,
  }

  try {
    const response =
      id === ""
        ? await POST(`/servers/services`, headers, service)
        : await PATCH(`/servers/services/${id}`, headers, service)

    return response.data
  } catch (error) {
    const axiosError = error as AxiosError<ErrorDataResponse>

    if (axiosError.response?.status === 401) {
      const res = await refreshToken(() => uploadServiceOnServerSide({ service, id }))

      if (!res) throw new CustomError("Unauthorized", 401)
      return res
    } else if (axiosError.response?.status === 400) {
      if (axiosError.response?.data.code === "P2000") {
        throw new CustomError("Service already exist!", 400, "SERVICE_ALREADY_EXIST")
      } else throw new CustomError("Invalid format!", 400)
    } else
      throw new CustomError(
        axiosError.response?.data?.message || "Failed to upload",
        axiosError.response?.status || 500,
      )
  }
}
