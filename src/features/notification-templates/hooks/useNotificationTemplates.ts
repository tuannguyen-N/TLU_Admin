import { useState, useCallback, useEffect } from 'react';
import { fetchNotificationTemplates, deleteNotificationTemplate } from '../services';
import type { NotificationTemplate } from '../types';

export function useNotificationTemplates() {
  const [templates, setTemplates] = useState<NotificationTemplate[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  const loadTemplates = useCallback(async (pageNum: number) => {
    setLoading(true);
    setError(null);
    try {
      const result = await fetchNotificationTemplates({ page: pageNum, size: 10 });
      setTemplates(result.templates);
      setTotalPages(result.totalPages);
      setTotalElements(result.totalElements);
    } catch (err) {
      console.error('[useNotificationTemplates] fetch error:', err);
      setError('Không thể tải danh sách mẫu thông báo');
      setTemplates([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTemplates(page);
  }, [page, loadTemplates]);

  const handleDelete = useCallback(async (id: number) => {
    try {
      await deleteNotificationTemplate(id);
      loadTemplates(page);
    } catch (err) {
      console.error('[useNotificationTemplates] delete error:', err);
      throw err;
    }
  }, [page, loadTemplates]);

  const reload = useCallback(() => {
    loadTemplates(page);
  }, [page, loadTemplates]);

  return {
    templates,
    loading,
    error,
    page,
    setPage,
    totalPages,
    totalElements,
    reload,
    handleDelete,
  };
}