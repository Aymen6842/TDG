import { useQuery } from "@tanstack/react-query";
import { UserRoleOnFrontendSide, UserRoleOnBackendSide } from "../../types";
import retrieveUserRoleOnBackendSides from "../../services/users/user-roles";
import { useTranslations } from "next-intl";
import { castRoleFromFrontendToBackend } from "../../utils/user-roles";
import useUser from "./use-user";

/**
 * Hook to fetch and provide user roles in frontend format.
 * This hook retrieves the list of available user roles from the backend,
 * casts them from backend format (UserRoleOnBackendSide) to frontend format (UserRoleOnFrontendSide),
 * and provides loading and error states.
 *
 * The casting from backend to frontend is performed here after fetching the data.
 *
 * @returns UseUserRoleOnBackendSidesResult - Object containing roles array, loading state, and error state
 */
export default function useUserRoles() {
  const t = useTranslations("modules.users.roles");
  const { user } = useUser();

  const { data, isLoading, isError } = useQuery<UserRoleOnFrontendSide[]>({
    queryKey: ["user", "roles", user],
    queryFn: () => retrieveUserRoleOnBackendSides(),
    enabled: user !== null,
    placeholderData: [],
    refetchOnWindowFocus: false,
    refetchOnReconnect: false
  });


  return {
    roles:
      data && data.length > 0
        ? data.map((role) => ({
          label: t(role),
          value: castRoleFromFrontendToBackend(role) as UserRoleOnBackendSide
        }))
        : [],
    rolesAreLoading: isLoading,
    rolesError: isError
  };
}
