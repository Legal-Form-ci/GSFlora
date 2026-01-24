import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Loader2 } from 'lucide-react';

interface PasswordChangeGuardProps {
  children: React.ReactNode;
}

const PasswordChangeGuard = ({ children }: PasswordChangeGuardProps) => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [checking, setChecking] = useState(true);
  const [mustChange, setMustChange] = useState(false);

  useEffect(() => {
    const checkPasswordStatus = async () => {
      if (!user) {
        setChecking(false);
        return;
      }

      try {
        const { data } = await supabase
          .from('user_settings')
          .select('must_change_password')
          .eq('user_id', user.id)
          .maybeSingle();

        if (data?.must_change_password === true) {
          setMustChange(true);
          // Only redirect if not already on change password page
          if (location.pathname !== '/change-password') {
            navigate('/change-password', { replace: true });
          }
        }
      } catch (error) {
        console.error('Error checking password status:', error);
      } finally {
        setChecking(false);
      }
    };

    if (!authLoading) {
      checkPasswordStatus();
    }
  }, [user, authLoading, navigate, location.pathname]);

  if (authLoading || checking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  // If must change password and not on the change password page, show loader (redirect will happen)
  if (mustChange && location.pathname !== '/change-password') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return <>{children}</>;
};

export default PasswordChangeGuard;
