interface StatCardProps {
  title: string;
  value: number | string;
  icon?: string;
  color?: string;
}

export default function StatCard({
  title,
  value,
  icon,
  color = 'primary',
}: StatCardProps) {
  const colorClasses: Record<string, string> = {
    primary: 'bg-primary-50 text-primary-600',
    green: 'bg-green-50 text-green-600',
    yellow: 'bg-yellow-50 text-yellow-600',
    red: 'bg-red-50 text-red-600',
    blue: 'bg-blue-50 text-blue-600',
    purple: 'bg-purple-50 text-purple-600',
  };

  return (
    <div className="card hover:shadow-lg transition-shadow">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">{value}</p>
        </div>
        {icon && (
          <div
            className={`w-12 h-12 rounded-full flex items-center justify-center ${
              colorClasses[color]
            }`}
          >
            <span className="text-2xl">{icon}</span>
          </div>
        )}
      </div>
    </div>
  );
}
