import { useState, useEffect, useCallback } from 'react';
import { fetchEmails, triggerManualFetch } from '../services/api';

export const useEmails = (filters = {}) => {
  const [emails, setEmails] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [fetchingManual, setFetchingManual] = useState(false);

  const loadEmails = useCallback(async () => {
    try {
      setLoading(true);
      const data = await fetchEmails(filters);
      setEmails(data);
      setError(null);
    } catch (err) {
      setError(err.message || 'Failed to fetch emails');
    } finally {
      setLoading(false);
    }
  }, [JSON.stringify(filters)]); // Re-run when filters change

  useEffect(() => {
    loadEmails();
    
    // Auto refresh every 60 seconds
    const interval = setInterval(() => {
      loadEmails();
    }, 60000);
    
    return () => clearInterval(interval);
  }, [loadEmails]);

  const manualFetch = async () => {
    try {
      setFetchingManual(true);
      await triggerManualFetch();
      await loadEmails(); // Reload from DB after fetch
    } catch (err) {
      console.error(err);
      alert("Failed to manually fetch emails");
    } finally {
      setFetchingManual(false);
    }
  };

  return { emails, loading, error, manualFetch, fetchingManual, refetch: loadEmails };
};
