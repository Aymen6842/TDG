import { useRouter } from "next/navigation";

export default function useUrlParams() {
  const router = useRouter();

  const updateUrlParams = (key: string, value: string) => {
    if (typeof window !== "undefined") {
      const searchParams = new URLSearchParams(window.location.search);
      const params = new URLSearchParams(searchParams.toString());

      params.set(key, value);

      router.replace(`?${params.toString()}`, { scroll: false });
    }
  };

  const removeParamFromUrl = (key: string) => {
    if (typeof window !== "undefined") {
      const searchParams = new URLSearchParams(window.location.search);
      const params = new URLSearchParams(searchParams.toString());

      params.delete(key);

      router.replace(`?${params.toString()}`, { scroll: false });
    }
  };

  const getParamFromUrl = (key: string) => {
    if (typeof window !== "undefined") {
      const searchParams = new URLSearchParams(window.location.search);

      return searchParams.get(key);
    }

    return null;
  };

  return {
    updateUrlParams,
    removeParamFromUrl,
    getParamFromUrl,
  };
}
