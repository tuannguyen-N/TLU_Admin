import { useState, useEffect } from 'react';
import { fetchAllFeedbackCategories } from '../services';
import type { FeedbackCategory } from '../types';

export function useFeedbackCategories() {
  const [categories, setCategories] = useState<FeedbackCategory[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    reload();
  }, []);

  const reload = () => {
    setLoading(true);
    setError(null);
    
    fetchAllFeedbackCategories()
      .then((data) => {
        setCategories(data);
      })
      .catch((err) => {
        console.error('[useFeedbackCategories] fetch error:', err);
        setError('Không thể tải danh sách danh mục feedback');
      })
      .finally(() => {
        setLoading(false);
      });
  };

  return {
    categories,
    loading,
    error,
    reload,
  };
}
