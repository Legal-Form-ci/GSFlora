import { useSchool } from '@/contexts/SchoolContext';
import { Building2, ChevronDown, Check } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const SchoolSelector = () => {
  const { currentSchool, userSchools, setCurrentSchool, loading } = useSchool();

  if (loading || userSchools.length <= 1) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2 max-w-[200px]">
          <Building2 className="w-4 h-4 shrink-0" />
          <span className="truncate">{currentSchool?.name || 'Établissement'}</span>
          <ChevronDown className="w-3 h-3 shrink-0" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-64">
        {userSchools.map((school) => (
          <DropdownMenuItem
            key={school.id}
            onClick={() => setCurrentSchool(school)}
            className={cn('gap-2', currentSchool?.id === school.id && 'bg-accent')}
          >
            <Building2 className="w-4 h-4 shrink-0" />
            <span className="truncate flex-1">{school.name}</span>
            {currentSchool?.id === school.id && <Check className="w-4 h-4 shrink-0" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default SchoolSelector;
