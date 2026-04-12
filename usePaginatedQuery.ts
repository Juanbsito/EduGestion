
import { useState, useEffect, useCallback } from 'react';
import { supabase } from './supabaseClient';

interface PaginatedResult<T> {
  data: T[];
  count: number;
  loading: boolean;
  error: any;
  page: number;
  setPage: (page: number) => void;
  refetch: () => void;
}

export function usePaginatedQuery<T>(
  table: string,
  schoolId: string | undefined,
  pageSize: number = 25,
  filters: Record<string, any> = {}
): PaginatedResult<T> {
  const [data, setData] = useState<T[]>([]);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0);
  const [refreshKey, setRefreshKey] = useState(0);

  const refetch = useCallback(() => {
    setRefreshKey(prev => prev + 1);
  }, []);

  useEffect(() => {
    if (!schoolId) return;

    async function fetchData() {
      setLoading(true);
      const from = page * pageSize;
      const to = from + pageSize - 1;

      let query = supabase
        .from(table)
        .select('*', { count: 'exact' })
        .eq('school_id', schoolId)
        .range(from, to)
        .order('created_at', { ascending: false });

      Object.entries(filters).forEach(([key, value]) => {
        if (value && value !== 'ALL') query = query.eq(key, value);
      });

      const { data: fetchedData, count: totalCount, error: fetchError } = await query;

      if (fetchError) setError(fetchError as any);
      else {
        setData(fetchedData as T[]);
        setCount(totalCount || 0);
      }
      setLoading(false);
    }

    fetchData();
  }, [table, schoolId, page, pageSize, JSON.stringify(filters), refreshKey]);

  return { data, count, loading, error, page, setPage, refetch };
}
