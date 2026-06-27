import { useEffect, useRef, useState } from "react";
import useUrlParams from "./urls-management/use-url-params";

interface Params {
  paginationAffectUrl?: boolean;
}

export default function usePagination(params?: Params) {
  const [page, setPage] = useState(1);
  const [pagesNumber, setPagesNumber] = useState(1);
  const paginatedListRef = useRef<HTMLDivElement>(null);
  const { updateUrlParams, removeParamFromUrl, getParamFromUrl } =
    useUrlParams();
  const [records, setRecords] = useState(0);

  useEffect(() => {
    if (paginatedListRef.current) paginatedListRef.current.scrollTop = 0;
  }, [paginatedListRef, page]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const searchParams = new URLSearchParams(window.location.search);
      const pageInUrl = searchParams.get("page");

      if (pageInUrl) setPage(Number(pageInUrl));
    }
  }, []);

  //update pagination on the url
  useEffect(() => {
    if (params && params.paginationAffectUrl) {
      const pageInUrl = getParamFromUrl("page");

      if (page !== 1)
        //do not update the url if the page is 1
        updateUrlParams("page", page.toString());
      else if (pageInUrl) removeParamFromUrl("page"); //remove the page param from url if the page in url already exist so it is not equal to 1
    }
  }, [page]);

  return {
    page,
    setPage,
    records,
    setRecords,
    pagesNumber,
    setPagesNumber,
    paginatedListRef,
  };
}
