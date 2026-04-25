import { useState, useCallback, useEffect } from 'react';
import { fetchTuitionInvoices } from '../services';
import type { TuitionInvoice } from '../types';

export function useTuitionInvoices(semesterId: number | null, status?: string) {
  const [invoices, setInvoices] = useState<TuitionInvoice[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  const loadInvoices = useCallback(async (semId: number, pageNum: number, statusFilter?: string) => {
    if (!semId) return;
    setLoading(true);
    setError(null);
    try {
      const result = await fetchTuitionInvoices({ semesterId: semId, page: pageNum, size: 10, status: statusFilter });
      setInvoices(result.invoices);
      setTotalPages(result.totalPages);
      setTotalElements(result.totalElements);
    } catch (err) {
      console.error('[useTuitionInvoices] fetch error:', err);
      setError('Không thể tải danh sách hóa đơn');
      setInvoices([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (semesterId !== null) {
      setPage(0);
      loadInvoices(semesterId, 0, status);
    }
  }, [semesterId, status, loadInvoices]);

  const handlePageChange = useCallback((newPage: number) => {
    setPage(newPage);
    if (semesterId !== null) {
      loadInvoices(semesterId, newPage, status);
    }
  }, [semesterId, status, loadInvoices]);

  return {
    invoices,
    loading,
    error,
    page,
    setPage: handlePageChange,
    totalPages,
    totalElements,
    reload: () => loadInvoices(semesterId!, page, status),
  };
}
