import { useState, useCallback, useEffect } from 'react';
import { fetchApplicationTypes } from '../services';
import type { ApplicationType } from '../types';

export function useApplicationTypes() {
  const [applicationTypes, setApplicationTypes] = useState<ApplicationType[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadApplicationTypes = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await fetchApplicationTypes();
      // Filter out inactive application types
      const activeTypes = result.filter(t => t.isActive !== false);
      setApplicationTypes(activeTypes);
    } catch (err) {
      console.error('[useApplicationTypes] fetch error:', err);
      setError('Không thể tải danh sách loại đơn từ');
      setApplicationTypes([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadApplicationTypes();
  }, [loadApplicationTypes]);

  const reload = useCallback(() => {
    loadApplicationTypes();
  }, [loadApplicationTypes]);

  return {
    applicationTypes,
    loading,
    error,
    reload,
  };
}