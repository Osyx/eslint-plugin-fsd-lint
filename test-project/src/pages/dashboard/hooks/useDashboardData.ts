import { useState, useEffect } from "react";

export const useDashboardData = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate data fetching
    setTimeout(() => {
      setData({
        users: 100,
        revenue: 50000,
        orders: 250,
      });
      setLoading(false);
    }, 1000);
  }, []);

  return { data, loading };
};
