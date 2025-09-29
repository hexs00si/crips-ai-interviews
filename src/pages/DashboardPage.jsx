import { dashboardData } from '@/data/dashboard';
import { DashboardWelcome } from '@/components/sections/DashboardWelcome';

export function DashboardPage() {
  const { welcome } = dashboardData;

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">{welcome.title}</h1>
        <DashboardWelcome />
      </div>
    </div>
  );
}