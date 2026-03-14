import { useMemo } from 'react';
import { useSchool } from '@/contexts/SchoolContext';

type NavItem = { label: string; href: string; icon: React.ReactNode };

/** Paths that should NOT be prefixed with the school slug */
const GLOBAL_PATHS = ['/messages', '/profile', '/settings', '/change-password', '/platform-admin', '/create-school'];

export const useSlugNavItems = (navItems: NavItem[]): NavItem[] => {
  const { currentSchool } = useSchool();

  return useMemo(() => {
    if (!currentSchool?.slug) return navItems;
    const slug = currentSchool.slug;

    return navItems.map(item => {
      if (GLOBAL_PATHS.some(p => item.href === p || item.href.startsWith(p + '/'))) {
        return item;
      }
      return { ...item, href: `/${slug}${item.href}` };
    });
  }, [navItems, currentSchool?.slug]);
};
