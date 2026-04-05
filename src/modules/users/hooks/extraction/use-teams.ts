import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { PaginationType } from "@/types/pagination";
import usePagination from "@/hooks/use-pagination";
import useUser from "@/modules/auth/hooks/users/use-user";
import retreiveTeamsFromServerSide from "../../services/extraction/teams";
import { TeamType } from "../../types/teams";

interface Params {
  limit?: number;
}

export default function useTeams({ limit = 10 }: Params) {
  const { user } = useUser();
  const { page, setPage, pagesNumber, setPagesNumber, records, setRecords } = usePagination();

  const [search, setSearch] = useState("");

  const { data, isLoading, isError } = useQuery<{
    data: TeamType[];
    pagination: PaginationType;
  }>({
    queryKey: ["teams", limit, page, search],
    queryFn: () => retreiveTeamsFromServerSide({ page, limit, search }),
    enabled: user !== null,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false
  });

  useEffect(() => {
    if (data?.pagination) {
      setPagesNumber(data.pagination.totalPages);
      setRecords(data.pagination.records);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data]);

  useEffect(() => {
    setPage(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  return {
    teams: data === null ? null : data?.data,
    teamsAreLoading: isLoading || data === undefined,
    teamsError: isError || data === null,
    setPage,
    page,
    pagesNumber,
    records,
    search,
    setSearch
  };
}
