import { useQuery } from "@tanstack/react-query";
import retreiveUserInfo from "../../services/extraction/user";
import { UserType } from "../../types/users";

interface Params {
  id: string;
}

export default function useUserInfo({ id }: Params) {
  const { data, isLoading, isError } = useQuery<UserType>({
    queryKey: ["users", id],
    queryFn: () => retreiveUserInfo({ id }),
    refetchOnWindowFocus: false,
    refetchOnReconnect: false
  });

  return {
    user: data,
    userIsLoading: isLoading || data === undefined,
    userError: isError || data === null
  };
}
