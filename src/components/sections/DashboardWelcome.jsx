import { dashboardData } from '@/data/dashboard';

export function DashboardWelcome() {
  const { welcome } = dashboardData;

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <p className="text-gray-600">{welcome.message}</p>
    </div>
  );
}