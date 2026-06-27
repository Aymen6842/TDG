import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { retrieveUserDetails } from "../../services/users/user-details-extraction";
import useUserStore from "../../store/user-store";

export default function useCurrentUser() {
  const pathname = usePathname();
  const { data, isLoading, isError } = useQuery({
    queryKey: ["user-data", pathname],
    queryFn: () => retrieveUserDetails(),
    placeholderData: keepPreviousData,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false
  });
  const { setUser, setIsLoading: setUserIsLoading, user } = useUserStore((store) => store);

  useEffect(() => {
    if (data) {
      setUser(data);
    }
    // Only clear user data when component unmounts, not on every data change
  }, [data, setUser]);

  useEffect(() => {
    setUserIsLoading(isLoading);
  }, [isLoading, setUserIsLoading]);

  return {
    user: data ? data : null,
    isLoading: data === undefined || isLoading,
    isError: isError || data === null
  };
}
