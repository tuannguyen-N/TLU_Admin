import { useState, useCallback, useEffect } from 'react';
import { fetchNotifications, deleteNotification } from '../services';
import type { Notification } from '../types';

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  const loadNotifications = useCallback(async (pageNum: number) => {
    setLoading(true);
    setError(null);
    try {
      const result = await fetchNotifications({ page: pageNum, size: 10 });
      setNotifications(result.notifications);
      setTotalPages(result.totalPages);
      setTotalElements(result.totalElements);
    } catch (err) {
      console.error('[useNotifications] fetch error:', err);
      setError('Không thể tải danh sách thông báo');
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadNotifications(page);
  }, [page, loadNotifications]);

  const handleDelete = useCallback(async (id: number) => {
    try {
      await deleteNotification(id);
      loadNotifications(page);
    } catch (err) {
      console.error('[useNotifications] delete error:', err);
      throw err;
    }
  }, [page, loadNotifications]);

  const reload = useCallback(() => {
    loadNotifications(page);
  }, [page, loadNotifications]);

  return {
    notifications,
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