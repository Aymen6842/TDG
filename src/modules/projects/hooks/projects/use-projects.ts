import React from "react";
import { useQuery } from "@tanstack/react-query";
import { ProjectType, ProjectTypeEnum, BusinessUnit } from "@/modules/projects/types/projects";
import { useProjectStore } from "../../store/projects";
import useUser from "@/modules/auth/hooks/users/use-user";
import { retrieveProjects, retrieveProjectCreators } from "../../services";

const BACKEND_PAGE_SIZE = 12;
const DISPLAY_PAGE_SIZE = 12;

function useDebounce<T>(value: T, delay = 400): T {
  const [debounced, setDebounced] = React.useState(value);
  React.useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

function applyClientFilters(
  list: ProjectType[],
  projectType: ProjectTypeEnum | undefined,
  isArchived: boolean | undefined,
  createdById: string | undefined
): ProjectType[] {
  let result = list;
  if (projectType)              result = result.filter(p => p.projectType === projectType);
  if (isArchived !== undefined) result = result.filter(p => p.isArchived === isArchived);
  if (createdById)              result = result.filter(p => p.createdBy?.id === createdById);
  return result;
}

export default function useProjects() {
  const { activeTab } = useProjectStore();
  const { user } = useUser();

  const [displayPage, setDisplayPage] = React.useState(1);
  const [search, setSearch] = React.useState("");
  const debouncedSearch = useDebounce(search);

  // Server-side filters
  const [businessUnit, setBusinessUnit] = React.useState<BusinessUnit | undefined>(undefined);
  const [paid, setPaid] = React.useState<boolean | undefined>(undefined);
  const [sortBy, setSortBy] = React.useState<string | undefined>(undefined);

  // Client-side only filters
  const [projectType, setProjectType] = React.useState<ProjectTypeEnum | undefined>(undefined);
  const [isArchived, setIsArchived] = React.useState<boolean | undefined>(false);
  const [createdById, setCreatedById] = React.useState<string | undefined>(undefined);

  const activeStatus = activeTab !== "all" ? activeTab : undefined;

  // When any client-side filter is active, we must fetch ALL backend pages first
  const hasClientFilter = !!(projectType || isArchived !== undefined || createdById);

  // Pool of accumulated items
  const [pool, setPool] = React.useState<ProjectType[]>([]);
  const [backendPage, setBackendPage] = React.useState(1);
  const [backendTotalPages, setBackendTotalPages] = React.useState(1);
  const [allPagesFetched, setAllPagesFetched] = React.useState(false);
  const [sessionKey, setSessionKey] = React.useState(0);

  const refresh = React.useCallback(() => setSessionKey(k => k + 1), []);

  // Synchronous reset when server-side params change
  const serverKey = JSON.stringify({ debouncedSearch, activeStatus, businessUnit, paid, sortBy, sessionKey });
  const prevServerKey = React.useRef(serverKey);
  if (prevServerKey.current !== serverKey) {
    prevServerKey.current = serverKey;
    setPool([]);
    setBackendPage(1);
    setBackendTotalPages(1);
    setAllPagesFetched(false);
    setDisplayPage(1);
  }

  // Reset display page when client-side filters change
  const clientKey = JSON.stringify({ projectType, isArchived, createdById });
  const prevClientKey = React.useRef(clientKey);
  if (prevClientKey.current !== clientKey) {
    prevClientKey.current = clientKey;
    setDisplayPage(1);
    // If switching TO a client-side filter, we need to re-fetch all pages
    // Reset pool so we start accumulating from scratch with the full dataset
    if (!prevClientKey.current || clientKey !== "{}") {
      setPool([]);
      setBackendPage(1);
      setBackendTotalPages(1);
      setAllPagesFetched(false);
    }
  }

  const { data, isLoading, isFetching, isError } = useQuery({
    queryKey: ["projects", backendPage, serverKey],
    queryFn: () => retrieveProjects({
      page: backendPage,
      limit: BACKEND_PAGE_SIZE,
      name: debouncedSearch || undefined,
      status: activeStatus,
      businessUnit,
      paid,
      sortBy,
    }),
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    // Disable only when we've confirmed all pages are fetched AND we're not in a new session
    enabled: backendPage <= backendTotalPages || backendTotalPages === 1,
  });

  // Append fetched page to pool (raw, unfiltered — client filters applied at display time)
  const lastProcessedData = React.useRef<typeof data>(undefined);
  React.useEffect(() => {
    if (!data?.data || data === lastProcessedData.current) return;
    lastProcessedData.current = data;

    const totalPages = data.pagination.totalPages;
    setBackendTotalPages(totalPages);

    setPool(prev => {
      const existingIds = new Set(prev.map(p => p.id));
      return [...prev, ...data.data.filter(p => !existingIds.has(p.id))];
    });

    if (backendPage >= totalPages) {
      setAllPagesFetched(true);
    }
  }, [data, backendPage]);

  // Decide whether to fetch the next backend page
  React.useEffect(() => {
    if (isFetching || isLoading) return;
    if (backendPage >= backendTotalPages && backendTotalPages > 1) {
      setAllPagesFetched(true);
      return;
    }
    if (allPagesFetched) return;

    if (hasClientFilter) {
      // Client filter active: keep fetching until all pages are loaded
      if (backendPage < backendTotalPages) setBackendPage(prev => prev + 1);
    } else {
      // No client filter: only fetch more if current display page needs more items
      const needed = displayPage * DISPLAY_PAGE_SIZE;
      if (pool.length < needed && backendPage < backendTotalPages) {
        setBackendPage(prev => prev + 1);
      }
    }
  }, [pool.length, displayPage, backendPage, backendTotalPages, allPagesFetched, isFetching, isLoading, hasClientFilter]);

  // Creators from dedicated endpoint
  const { data: creatorsData } = useQuery({
    queryKey: ["project-creators"],
    queryFn: retrieveProjectCreators,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  const creators = React.useMemo(() => {
    if (!creatorsData) return [];
    return creatorsData.map(c => ({ id: c.id, name: c.name, isMe: c.id === user?.id }));
  }, [creatorsData, user?.id]);

  // Apply client-side filters to the full pool
  const filteredPool = React.useMemo(
    () => applyClientFilters(pool, projectType, isArchived, createdById),
    [pool, projectType, isArchived, createdById]
  );

  const isFetchingAll = hasClientFilter && !allPagesFetched;
  const pagesNumber = !allPagesFetched && !hasClientFilter
    ? Math.max(displayPage + 1, Math.ceil(filteredPool.length / DISPLAY_PAGE_SIZE) + 1)
    : Math.max(1, Math.ceil(filteredPool.length / DISPLAY_PAGE_SIZE));

  const safePage = Math.min(displayPage, pagesNumber);
  const projects = filteredPool.slice((safePage - 1) * DISPLAY_PAGE_SIZE, safePage * DISPLAY_PAGE_SIZE);
  const records = (!hasClientFilter && !allPagesFetched) ? undefined : filteredPool.length;

  const isFetchingMore = (isFetching || isLoading) && filteredPool.length > 0;

  return {
    projects,
    projectsAreLoading: (isLoading || isFetching || isFetchingAll) && filteredPool.length === 0,
    projectsPageLoading: isFetchingMore && projects.length === 0,
    projectsError: isError,
    page: safePage,
    setPage: setDisplayPage,
    pagesNumber,
    records,
    currentUserId: user?.id,
    creators,
    refresh,
    searchState: [search, setSearch] as const,
    projectTypeState: [projectType, setProjectType] as const,
    businessUnitState: [businessUnit, setBusinessUnit] as const,
    isArchivedState: [isArchived, setIsArchived] as const,
    paidState: [paid, setPaid] as const,
    sortByState: [sortBy, setSortBy] as const,
    createdByState: [createdById, setCreatedById] as const,
  };
}
