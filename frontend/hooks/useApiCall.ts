import { useState, useEffect, useCallback } from 'react';

interface ApiCallState<T> {
    data: T | null;
    loading: boolean;
    error: string | null;
    execute: () => Promise<void>;
}

/**
 * useApiCall — Centralized hook for async API requests.
 * Handles loading, error, and data state consistently across the app.
 *
 * Usage:
 *   const { data, loading, error, execute } = useApiCall(() => api.get('/products'));
 *
 * - Set `immediate = false` to prevent auto-fetching on mount (manual trigger only).
 */
export function useApiCall<T = any>(
    fn: () => Promise<T>,
    immediate = true,
): ApiCallState<T> {
    const [data, setData] = useState<T | null>(null);
    const [loading, setLoading] = useState(immediate);
    const [error, setError] = useState<string | null>(null);

    const execute = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const result = await fn();
            setData(result);
        } catch (err: any) {
            setError(err.message || 'Ocurrió un error inesperado');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        if (immediate) {
            execute();
        }
    }, []);

    return { data, loading, error, execute };
}
