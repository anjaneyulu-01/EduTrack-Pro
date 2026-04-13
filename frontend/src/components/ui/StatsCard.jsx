import { TrendingUp, TrendingDown } from 'lucide-react';

export default function StatsCard({ title, value, icon: Icon, color = 'primary', trend, trendValue, subtitle }) {
  const colors = {
    primary: { bg: 'bg-primary-50 dark:bg-primary-900/20', icon: 'text-primary-600 dark:text-primary-400', ring: 'ring-primary-100 dark:ring-primary-900/30' },
    emerald: { bg: 'bg-emerald-50 dark:bg-emerald-900/20', icon: 'text-emerald-600 dark:text-emerald-400', ring: 'ring-emerald-100 dark:ring-emerald-900/30' },
    amber: { bg: 'bg-amber-50 dark:bg-amber-900/20', icon: 'text-amber-600 dark:text-amber-400', ring: 'ring-amber-100 dark:ring-amber-900/30' },
    rose: { bg: 'bg-rose-50 dark:bg-rose-900/20', icon: 'text-rose-600 dark:text-rose-400', ring: 'ring-rose-100 dark:ring-rose-900/30' },
    violet: { bg: 'bg-violet-50 dark:bg-violet-900/20', icon: 'text-violet-600 dark:text-violet-400', ring: 'ring-violet-100 dark:ring-violet-900/30' },
    cyan: { bg: 'bg-cyan-50 dark:bg-cyan-900/20', icon: 'text-cyan-600 dark:text-cyan-400', ring: 'ring-cyan-100 dark:ring-cyan-900/30' },
  };
  const c = colors[color] || colors.primary;

  return (
    <div className="stat-card hover:shadow-md transition-shadow duration-200">
      <div className={`w-12 h-12 rounded-xl ${c.bg} ring-1 ${c.ring} flex items-center justify-center flex-shrink-0`}>
        <Icon className={`w-6 h-6 ${c.icon}`} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">{title}</p>
        <p className="text-2xl font-bold text-gray-900 dark:text-white mt-0.5">{value}</p>
        {(trend || subtitle) && (
          <div className="flex items-center gap-1 mt-1">
            {trend === 'up' && <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />}
            {trend === 'down' && <TrendingDown className="w-3.5 h-3.5 text-rose-500" />}
            {trendValue && (
              <span className={`text-xs font-medium ${trend === 'up' ? 'text-emerald-600' : trend === 'down' ? 'text-rose-500' : 'text-gray-400'}`}>
                {trendValue}
              </span>
            )}
            {subtitle && <span className="text-xs text-gray-400">{subtitle}</span>}
          </div>
        )}
      </div>
    </div>
  );
}
