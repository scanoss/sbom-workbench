import { useEffect, useState } from 'react';

export default function useApi<T>() {
  const [data, setData] = useState<T>(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const execute = async (call: () => Promise<T>) => {
    try {
      setError(false);
      setLoading(true);
      const response = await call();
      setData(response);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  return { data, error, loading, execute };
}
