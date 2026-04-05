import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { PaginationType } from "@/types/pagination";
import usePagination from "@/hooks/use-pagination";
import retrieveUsers from "../../services/extraction/users";
import {
  FilteringUsersHookResult,
  SearchUserByType,
  UsersCriteriaType
} from "../../types/filtering";
import { useTranslations } from "next-intl";
import { castRoleFromFrontendToBackend } from "../../../auth/utils/user-roles";
import { UserRoleOnBackendSide, UserRoleOnFrontendSide } from "@/modules/auth/types";
import { UserType } from "../../types/users";
import useUser from "@/modules/auth/hooks/users/use-user";
import { hasPermissions } from "@/modules/auth/utils/users-permissions";

interface Params {
  limit?: number;
}

export default function useUsers({ limit = 100 }: Params): FilteringUsersHookResult {
  const { user } = useUser();
  const warnings = useTranslations("shared.warnings");
  const t = useTranslations("UsersManagement");

  const { page, setPage, pagesNumber, setPagesNumber, records, setRecords } = usePagination();

  const [exportIsPending, setExportIsPending] = useState(false);
  const [filterApplication, setFilterApplication] = useState(0);
  const [search, setSearch] = useState("");
  const [searchBy, setSearchBy] = useState<SearchUserByType>("name");
  const [roles, setRoles] = useState<UserRoleOnFrontendSide[]>([]);
  const [criteria, setCriteria] = useState<UsersCriteriaType>("nameAsc");

  const [usersCreationPeriod, setUsersCreationPeriod] = useState<{
    from: string;
    to: string;
  }>({ from: "", to: "" });

  const usersExtractionParams = {
    page,
    limit,
    search,
    searchBy,
    roles: roles.map((role) => castRoleFromFrontendToBackend(role)) as UserRoleOnBackendSide[],
    sortBy: criteria,
    usersCreatedAfter: usersCreationPeriod.from,
    usersCreatedBefore: usersCreationPeriod.to
  };

  const { data, isLoading, isError } = useQuery<{
    data: UserType[];
    pagination: PaginationType;
  }>({
    queryKey: ["users", user, page, filterApplication, search, searchBy, criteria],
    queryFn: () => retrieveUsers(usersExtractionParams),
    enabled: user !== null && hasPermissions(user.roles, "usersManagement", "view"),
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

  useEffect(() => {
    setPage(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [criteria]);

  // const exportDataIntoCSV = async () => {
  //   setExportIsPending(true);

  //   const blob = await exportUsersDataToCSV(usersExtractionParams);

  //   if (blob) {
  //     // Create URL for blob
  //     const url = window.URL.createObjectURL(blob);

  //     // Create temporary link for download
  //     const link = document.createElement("a");
  //     link.href = url;
  //     link.setAttribute("download", "users_export.csv"); // name of file
  //     document.body.appendChild(link);
  //     link.click();

  //     // Clean up
  //     link.remove();
  //     window.URL.revokeObjectURL(url);

  //     toast.success(t("export.successfulOperation.description"));
  //   } else toast.error(warnings("dataExportError.description"));

  //   setExportIsPending(false);
  // };

  const applyFilter = () => {
    setFilterApplication(filterApplication + 1);
  };

  return {
    users: data === null ? null : data?.data,
    usersAreLoading: isLoading || data === undefined,
    usersError: isError || data === null,
    setPage,
    page,
    pagesNumber,
    records,
    filterVersion: filterApplication,
    searchByState: [searchBy, setSearchBy],
    searchState: [search, setSearch],
    rolesState: [roles, setRoles],
    criteriaState: [criteria, setCriteria],
    usersCreationPeriodState: [usersCreationPeriod, setUsersCreationPeriod],
    applyFilter,
    exportIsPending
  };
}
