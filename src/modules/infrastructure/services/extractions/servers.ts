import { GET } from "@/lib/http-methods"
import extractJWTokens from "@/modules/auth/utils/jwt/extract-tokens"
import { refreshToken } from "@/modules/auth/services/refresh-token"
import type { AxiosError } from "axios"
import type { PaginationType } from "@/types/pagination"
import type { BackendLocale } from "@/types/locales"
import { getBackendLocaleOnParams } from "@/utils/backend-locale"
import { ServerInResponseType, ServerStatusType } from "../../types/servers"
import { castToServerType } from "../../dto/responses/servers"

interface Params {
  page: number
  limit: number
  statuses?: ServerStatusType[]
  search: string
  searchType: string
  locale?: BackendLocale
}

export default async function retrieveServersFromServerSide({
  page,
  limit,
  search,
  searchType,
  statuses,
  locale,
}: Params) {
  const { access } = extractJWTokens()
  const headers = {
    Authorization: `Bearer ${access}`,
  }

  const queryParams = []

  if (search !== "") queryParams.push(`name=${encodeURIComponent(search)}`)
  if (searchType !== "") queryParams.push(`searchBy=${searchType}`)
  if (statuses && statuses.length > 0) queryParams.push(`statuses=${statuses.join(",")}`)
  if (locale) queryParams.push(getBackendLocaleOnParams({ locale }))

  try {
    const endpoint = `/servers?page=${page}&limit=${limit}&${queryParams.join("&")}`

    const res = await GET(endpoint, headers)

    return {
      data: (res.data.data as ServerInResponseType[]).map((serverInResponse) => castToServerType(serverInResponse)),
      pagination: res.data.pagination as PaginationType,
    }
  } catch (error) {
    const axiosError = error as AxiosError
    if (axiosError.response?.status === 401) {
      const res = await refreshToken(() =>
        retrieveServersFromServerSide({
          page,
          limit,
          search,
          searchType,
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
