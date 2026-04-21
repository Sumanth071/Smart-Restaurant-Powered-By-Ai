import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";

import api from "../api/client";

const QueryClientContext = createContext(null);

const toKey = (queryKey) => JSON.stringify(Array.isArray(queryKey) ? queryKey : [queryKey]);

const isFresh = (entry, staleTime) => {
  if (!entry?.updatedAt) {
    return false;
  }

  return Date.now() - entry.updatedAt < staleTime;
};

export const QueryClientProvider = ({ children }) => {
  const cacheRef = useRef(new Map());

  const getQueryEntry = useCallback((queryKey) => cacheRef.current.get(toKey(queryKey)), []);

  const setQueryEntry = useCallback((queryKey, value) => {
    cacheRef.current.set(toKey(queryKey), {
      ...value,
      updatedAt: value.updatedAt || Date.now(),
    });
  }, []);

  const invalidateQueries = useCallback((matcher) => {
    const predicate =
      typeof matcher === "function"
        ? matcher
        : (key) => {
            if (!matcher) {
              return true;
            }

            return key.includes(String(matcher));
          };

    Array.from(cacheRef.current.keys()).forEach((key) => {
      if (predicate(key)) {
        cacheRef.current.delete(key);
      }
    });
  }, []);

  const value = useMemo(
    () => ({
      getQueryEntry,
      setQueryEntry,
      invalidateQueries,
    }),
    [getQueryEntry, invalidateQueries, setQueryEntry]
  );

  return <QueryClientContext.Provider value={value}>{children}</QueryClientContext.Provider>;
};

export const useQueryClient = () => {
  const context = useContext(QueryClientContext);

  if (!context) {
    throw new Error("useQueryClient must be used within a QueryClientProvider");
  }

  return context;
};

export const useApiQuery = ({
  queryKey,
  url,
  params,
  enabled = true,
  staleTime = 30000,
  select,
  fetcher,
}) => {
  const client = useQueryClient();
  const serializedKey = useMemo(() => toKey(queryKey), [queryKey]);
  const cachedEntry = client.getQueryEntry(queryKey);
  const [data, setData] = useState(cachedEntry?.data ?? null);
  const [error, setError] = useState(cachedEntry?.error ?? "");
  const [isLoading, setIsLoading] = useState(enabled && !cachedEntry?.data);
  const [isFetching, setIsFetching] = useState(false);

  const runQuery = useCallback(
    async ({ force = false } = {}) => {
      if (!enabled) {
        return null;
      }

      const currentEntry = client.getQueryEntry(queryKey);

      if (!force && isFresh(currentEntry, staleTime)) {
        setData(currentEntry.data);
        setError(currentEntry.error || "");
        setIsLoading(false);
        return currentEntry.data;
      }

      setIsFetching(true);
      setIsLoading(!currentEntry?.data);

      try {
        const result = fetcher ? await fetcher() : await api.get(url, { params });
        const resolvedData = select ? select(result) : result.data;
        client.setQueryEntry(queryKey, { data: resolvedData, error: "" });
        setData(resolvedData);
        setError("");
        return resolvedData;
      } catch (requestError) {
        const message = requestError.response?.data?.message || requestError.message || "Unable to load data.";
        client.setQueryEntry(queryKey, { data: currentEntry?.data ?? null, error: message });
        setError(message);
        if (!currentEntry?.data) {
          setData(null);
        }
        throw requestError;
      } finally {
        setIsLoading(false);
        setIsFetching(false);
      }
    },
    [client, enabled, fetcher, params, queryKey, select, staleTime, url]
  );

  useEffect(() => {
    const entry = client.getQueryEntry(queryKey);

    if (entry?.data) {
      setData(entry.data);
      setError(entry.error || "");
      setIsLoading(false);
    }

    runQuery().catch(() => {});
  }, [client, queryKey, runQuery, serializedKey]);

  return {
    data,
    error,
    isLoading,
    isFetching,
    refetch: () => runQuery({ force: true }),
  };
};
