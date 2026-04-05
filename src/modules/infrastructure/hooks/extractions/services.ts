"use client"

import { useQuery } from "@tanstack/react-query"
import { useEffect, useState } from "react"
import type { PaginationType } from "@/types/pagination"
import usePagination from "@/hooks/use-pagination"
import useBackendLocale from "@/hooks/use-backend-locale"
import useCurrentUser from "@/modules/auth/hooks/users/use-user"
import { ServiceStatusType, ServiceType } from "../../types/services"
import retrieveServicesFromServerSide from "../../services/extractions/services"

interface Params {
  limit?: number
  queryKeys?: (string | number)[]
}

export default function useServices({
  limit = 100,
  queryKeys = [],
}: Params) {
  const { page, setPage, pagesNumber, setPagesNumber, records, setRecords } = usePagination({})
  const { backendLocale } = useBackendLocale()
  const { user } = useCurrentUser()

  const [search, setSearch] = useState("")
  const [serversIds, setServersIds] = useState<string[]>([]);
  const [servicesStatuses, setServicesStatuses] = useState<ServiceStatusType[]>([]);

  const { data, isLoading, isError } = useQuery<{
    data: ServiceType[]
    pagination: PaginationType
  } | null>({
    queryKey: ["infrastructure", "services", user, page, backendLocale, search, servicesStatuses, serversIds, ...queryKeys],
    queryFn: () =>
      retrieveServicesFromServerSide({
        page,
        limit,
        search,
        serversIds,
        statuses: servicesStatuses,
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
    services: data === null ? null : data?.data,
    servicesAreLoading: isLoading,
    servicesError: isError,
    setPage,
    page,
    records,
    pagesNumber,
    setServersIds,
    serversIds,
    search, setSearch,
    servicesStatuses, setServicesStatuses
  }
}