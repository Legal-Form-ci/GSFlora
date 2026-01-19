import { cn } from '@/lib/utils';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  className?: string;
  iconClassName?: string;
}

const StatCard = ({ title, value, icon, trend, className, iconClassName }: StatCardProps) => {
  return (
    <div className={cn('bg-card rounded-xl p-5 shadow-flora', className)}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-muted-foreground">{title}</p>
          <p className="text-2xl font-bold text-foreground mt-1">{value}</p>
          {trend && (
            <p
              className={cn(
                'text-xs mt-2',
                trend.isPositive ? 'text-flora-success' : 'text-destructive'
              )}
            >
              {trend.isPositive ? '+' : ''}{trend.value}% ce mois
            </p>
          )}
        </div>
        <div
          className={cn(
            'w-12 h-12 rounded-xl flex items-center justify-center',
            iconClassName || 'bg-primary/10 text-primary'
          )}
        >
          {icon}
        </div>
      </div>
    </div>
  );
};

export default StatCard;
