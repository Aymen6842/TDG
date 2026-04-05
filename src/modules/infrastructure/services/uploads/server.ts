import { PATCH, POST } from "@/lib/http-methods"
import type { AxiosError } from "axios"
import { CustomError } from "@/utils/custom-error"
import type { ErrorDataResponse } from "@/types"
import extractJWTokens from "@/modules/auth/utils/jwt/extract-tokens"
import { refreshToken } from "@/modules/auth/services/refresh-token"
import { UploadedServerType } from "../../types/servers"

interface Params {
  server: UploadedServerType
  id?: string
}

export default async function uploadServerOnServerSide({ server, id = "" }: Params) {
  const { access } = extractJWTokens()
  const headers = {
    Authorization: `Bearer ${access}`,
  }

  try {
    const response =
      id === "" ? await POST(`/servers`, headers, server) : await PATCH(`/servers/${id}`, headers, server)

    return response.data
  } catch (error) {
    const axiosError = error as AxiosError<ErrorDataResponse>

    if (axiosError.response?.status === 401) {
      const res = await refreshToken(() => uploadServerOnServerSide({ server }))

      if (!res) throw new CustomError("Unauthorized", 401)
      return res
    } else if (axiosError.response?.status === 400) {
      if (axiosError.response?.data.code === "P2000") {
        throw new CustomError("Server already exist!", 400, "SERVER_ALREADY_EXIST")
      } else throw new CustomError("Invalid format!", 400)
    } else
      throw new CustomError(
        axiosError.response?.data?.message || "Failed to upload",
        axiosError.response?.status || 500,
      )
  }
}
