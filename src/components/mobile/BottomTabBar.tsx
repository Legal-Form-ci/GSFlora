import { useMemo } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, BookOpen, Calendar, Award, MessageSquare, ClipboardList } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';
import { useSchool } from '@/contexts/SchoolContext';

interface TabItem {
  label: string;
  href: string;
  icon: React.ElementType;
}

const studentTabs: TabItem[] = [
  { label: 'Accueil', href: '/student', icon: Home },
  { label: 'Cours', href: '/student/courses', icon: BookOpen },
  { label: 'Notes', href: '/student/grades', icon: Award },
  { label: 'EDT', href: '/student/schedule', icon: Calendar },
  { label: 'Messages', href: '/messages', icon: MessageSquare },
];

const parentTabs: TabItem[] = [
  { label: 'Accueil', href: '/parent', icon: Home },
  { label: 'Notes', href: '/parent/grades', icon: Award },
  { label: 'Absences', href: '/parent/attendance', icon: ClipboardList },
  { label: 'EDT', href: '/parent/schedule', icon: Calendar },
  { label: 'Messages', href: '/messages', icon: MessageSquare },
];

const GLOBAL_PATHS = ['/messages', '/profile', '/settings'];

interface BottomTabBarProps {
  role: 'student' | 'parent';
}

const BottomTabBar = ({ role }: BottomTabBarProps) => {
  const location = useLocation();
  const isMobile = useIsMobile();
  const { currentSchool } = useSchool();

  const tabs = role === 'student' ? studentTabs : parentTabs;

  const slugTabs = useMemo(() => {
    if (!currentSchool?.slug) return tabs;
    return tabs.map(tab => {
      if (GLOBAL_PATHS.some(p => tab.href === p)) return tab;
      return { ...tab, href: `/${currentSchool.slug}${tab.href}` };
    });
  }, [tabs, currentSchool?.slug]);

  if (!isMobile) return null;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card/95 backdrop-blur-lg border-t border-border shadow-lg safe-area-bottom">
      <div className="flex items-center justify-around h-16 px-1">
        {slugTabs.map((tab) => {
          const isActive = location.pathname === tab.href;
          const Icon = tab.icon;
          return (
            <Link
              key={tab.href}
              to={tab.href}
              className={cn(
                'flex flex-col items-center justify-center flex-1 py-1 px-1 rounded-lg transition-colors min-w-0',
                isActive ? 'text-primary' : 'text-muted-foreground'
              )}
            >
              <Icon className={cn('w-5 h-5 mb-0.5', isActive && 'text-primary')} />
              <span className={cn('text-[10px] font-medium truncate', isActive && 'font-semibold')}>
                {tab.label}
              </span>
              {isActive && <div className="absolute bottom-1 w-5 h-0.5 bg-primary rounded-full" />}
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomTabBar;
