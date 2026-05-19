import { useState, useEffect } from 'react';
import { fetchAllFeedback } from '../services';
import type { Feedback } from '../types';

export function useFeedback() {
  const [feedback, setFeedback] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    reload();
  }, []);

  const reload = () => {
    setLoading(true);
    setError(null);
    
    fetchAllFeedback()
      .then((data) => {
        setFeedback(data);
      })
      .catch((err) => {
        console.error('[useFeedback] fetch error:', err);
        setError('Không thể tải danh sách feedback');
      })
      .finally(() => {
        setLoading(false);
      });
  };

  return {
    feedback,
    loading,
    error,
    reload,
  };
}
