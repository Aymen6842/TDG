import { useSearchParams } from "next/navigation";

export function usePreviousUrl() {
  const searchParams = useSearchParams();

  return searchParams.get("previousUrl");
}
