"use client"

import { useQuery } from "@tanstack/react-query"
import { useEffect, useState } from "react"
import type { PaginationType } from "@/types/pagination"
import usePagination from "@/hooks/use-pagination"
import useBackendLocale from "@/hooks/use-backend-locale"
import useCurrentUser from "@/modules/auth/hooks/users/use-user"
import { ServerStatusType, ServerType } from "../../types/servers"
import retrieveServersFromServerSide from "../../services/extractions/servers"

interface Params {
  limit?: number
  queryKeys?: (string | number)[]
  paginationAffectUrl?: boolean
}

export default function useServers({ limit = 100, queryKeys = [], paginationAffectUrl = true }: Params) {
  const { page, setPage, pagesNumber, setPagesNumber, records, setRecords } = usePagination({})
  const { backendLocale } = useBackendLocale()
  const { user } = useCurrentUser()

  const [search, setSearch] = useState<string>("");
  const [serverStatuses, setServerStatuses] = useState<ServerStatusType[]>([])

  const { data, isLoading, isError } = useQuery<{
    data: ServerType[]
    pagination: PaginationType
  } | null>({
    queryKey: ["infrastructure", "servers", user, page, backendLocale, search, serverStatuses, ...queryKeys],
    queryFn: () =>
      retrieveServersFromServerSide({
        page,
        limit,
        search,
        statuses: serverStatuses,
        searchType: "name",
        locale: backendLocale,
      }),
    enabled: user !== null,
    placeholderData: (prev) => prev,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  })

  // pages update once data is fetched
  useEffect(() => {
    if (data && data.data && data.pagination) {
      if (pagesNumber !== data.pagination?.totalPages) setPagesNumber(data.pagination.totalPages)
      setRecords(data.pagination.records)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data])

  return {
    servers: data === null ? null : data?.data,
    serversAreLoading: isLoading,
    serversError: isError,
    setPage,
    page,
    records,
    pagesNumber,
    search,
    setSearch,
    serverStatuses,
    setServerStatuses
  }
}