import { useState } from 'react';
import api from '@/lib/api';

interface UseMutationOptions<TData> {
  onSuccess?: (data: TData) => void;
  onError?: (error: Error) => void;
}

interface UseMutationReturn<TData, TVariables> {
  mutate: (variables: TVariables) => Promise<void>;
  data: TData | null;
  loading: boolean;
  error: string | null;
}

export function useMutation<TData = unknown, TVariables = unknown>(
  endpoint: string,
  method: 'POST' | 'PATCH' | 'DELETE' = 'POST',
  options?: UseMutationOptions<TData>,
): UseMutationReturn<TData, TVariables> {
  const [data, setData] = useState<TData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mutate = async (variables: TVariables) => {
    setLoading(true);
    setError(null);

    try {
      const response = await api<{ data: TData }>(endpoint, {
        method,
        body: variables as Record<string, unknown>,
      });
      setData(response.data);
      options?.onSuccess?.(response.data);
    } catch (err) {
      const errorMessage = (err as Error).message || 'Operation failed';
      setError(errorMessage);
      options?.onError?.(err as Error);
    } finally {
      setLoading(false);
    }
  };

  return { mutate, data, loading, error };
}
