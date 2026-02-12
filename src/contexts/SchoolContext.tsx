import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface School {
  id: string;
  name: string;
  slug: string;
  logo_url: string | null;
  description: string | null;
  address: string | null;
  phone: string | null;
  email: string | null;
  website: string | null;
  is_active: boolean;
  subscription_plan: string;
}

interface SchoolContextType {
  currentSchool: School | null;
  userSchools: School[];
  loading: boolean;
  setCurrentSchool: (school: School | null) => void;
  fetchSchoolBySlug: (slug: string) => Promise<School | null>;
}

const SchoolContext = createContext<SchoolContextType | undefined>(undefined);

export const SchoolProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const [currentSchool, setCurrentSchool] = useState<School | null>(null);
  const [userSchools, setUserSchools] = useState<School[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      fetchUserSchools();
    } else {
      setUserSchools([]);
      setCurrentSchool(null);
    }
  }, [user]);

  const fetchUserSchools = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const { data: memberships } = await supabase
        .from('school_members')
        .select('school_id')
        .eq('user_id', user.id)
        .eq('is_active', true);

      if (memberships && memberships.length > 0) {
        const schoolIds = memberships.map(m => m.school_id);
        const { data: schools } = await supabase
          .from('schools')
          .select('*')
          .in('id', schoolIds);

        if (schools) {
          setUserSchools(schools as School[]);
          if (!currentSchool && schools.length > 0) {
            setCurrentSchool(schools[0] as School);
          }
        }
      }
    } catch (error) {
      console.error('Error fetching user schools:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSchoolBySlug = async (slug: string): Promise<School | null> => {
    const { data } = await supabase
      .from('schools')
      .select('*')
      .eq('slug', slug)
      .eq('is_active', true)
      .maybeSingle();
    return data as School | null;
  };

  return (
    <SchoolContext.Provider value={{
      currentSchool,
      userSchools,
      loading,
      setCurrentSchool,
      fetchSchoolBySlug,
    }}>
      {children}
    </SchoolContext.Provider>
  );
};

export const useSchool = () => {
  const context = useContext(SchoolContext);
  if (!context) {
    throw new Error('useSchool must be used within a SchoolProvider');
  }
  return context;
};
