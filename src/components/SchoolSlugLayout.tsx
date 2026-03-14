import { useEffect, useState } from 'react';
import { useParams, Outlet, Navigate } from 'react-router-dom';
import { useSchool } from '@/contexts/SchoolContext';
import { Loader2 } from 'lucide-react';

const SchoolSlugLayout = () => {
  const { slug } = useParams<{ slug: string }>();
  const { currentSchool, setCurrentSchool, fetchSchoolBySlug, userSchools, loading: schoolsLoading } = useSchool();
  const [resolving, setResolving] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!slug) return;

    const resolve = async () => {
      setResolving(true);
      // Check if school is already in user's schools
      const existing = userSchools.find(s => s.slug === slug);
      if (existing) {
        setCurrentSchool(existing);
        setResolving(false);
        return;
      }

      // Fetch by slug
      const school = await fetchSchoolBySlug(slug);
      if (school) {
        setCurrentSchool(school);
      } else {
        setNotFound(true);
      }
      setResolving(false);
    };

    if (!schoolsLoading) {
      resolve();
    }
  }, [slug, schoolsLoading, userSchools]);

  if (notFound) {
    return <Navigate to="/" replace />;
  }

  if (resolving || schoolsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return <Outlet />;
};

export default SchoolSlugLayout;
