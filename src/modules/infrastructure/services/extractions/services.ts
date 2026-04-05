import { GET } from "@/lib/http-methods"
import extractJWTokens from "@/modules/auth/utils/jwt/extract-tokens"
import { refreshToken } from "@/modules/auth/services/refresh-token"
import type { AxiosError } from "axios"
import type { PaginationType } from "@/types/pagination"
import type { BackendLocale } from "@/types/locales"
import { getBackendLocaleOnParams } from "@/utils/backend-locale"
import { ServiceInResponseType, ServiceStatusType } from "../../types/services"
import { castToServiceType } from "../../dto/responses/services"

interface Params {
  page: number
  limit: number
  search?: string
  serversIds?: string[]
  statuses?: ServiceStatusType[]
  locale?: BackendLocale
}

export default async function retrieveServicesFromServerSide({
  page,
  limit,
  search,
  serversIds,
  statuses,
  locale,
}: Params) {
  const { access } = extractJWTokens()
  const headers = {
    Authorization: `Bearer ${access}`,
  }

  const queryParams = []

  if (search && search.trim() !== "") queryParams.push(`name=${encodeURIComponent(search.trim())}`)
  if (serversIds && serversIds.length > 0) queryParams.push(`serversIds=${serversIds.join(",")}`)
  if (statuses && statuses.length > 0) queryParams.push(`statuses=${statuses.join(",")}`)
  if (locale) queryParams.push(getBackendLocaleOnParams({ locale }))

  try {
    const endpoint = `/servers/services?page=${page}&limit=${limit}&${queryParams.join("&")}`

    const res = await GET(endpoint, headers)

    return {
      data: (res.data.data as ServiceInResponseType[]).map((serviceInResponse) => castToServiceType(serviceInResponse)),
      pagination: res.data.pagination as PaginationType,
    }
  } catch (error) {
    const axiosError = error as AxiosError
    if (axiosError.response?.status === 401) {
      const res = await refreshToken(() =>
        retrieveServicesFromServerSide({
          page,
          limit,
          search,
          serversIds,
          statuses,
          locale,
        }),
      )

      if (!res) return null
      return res
    }

    return null
  }
}
