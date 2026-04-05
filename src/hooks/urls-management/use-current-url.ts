import { usePathname, useSearchParams } from "next/navigation";

export function useCurrentUrl(): string {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const queryString = searchParams.toString();

  return queryString ? `${pathname}?${queryString}` : pathname;
}
