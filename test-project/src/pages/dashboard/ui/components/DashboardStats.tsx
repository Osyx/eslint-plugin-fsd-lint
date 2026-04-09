import React from "react";

interface DashboardStatsProps {
  data: any;
}

export const DashboardStats: React.FC<DashboardStatsProps> = ({ data }) => {
  return (
    <div>
      <h2>Statistics</h2>
      <pre>{JSON.stringify(data, null, 2)}</pre>
    </div>
  );
};
