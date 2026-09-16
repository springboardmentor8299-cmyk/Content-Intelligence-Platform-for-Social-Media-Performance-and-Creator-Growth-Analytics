import { useEffect } from 'react';
import { useNavigate } from 'react-router';
import { supabase } from '@/integrations/supabase/client';
import { Loader2 } from 'lucide-react';

export default function AuthCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    const handleCallback = async () => {
      if (!supabase) {
        navigate('/login');
        return;
      }

      const { data: { session }, error } = await supabase.auth.getSession();

      if (error) {
        console.error('Auth callback error:', error);
        navigate('/login');
        return;
      }

      if (session) {
        navigate('/dashboard', { replace: true });
      } else {
        navigate('/login');
      }
    };

    handleCallback();
  }, [navigate]);

  return (
    <div className="flex h-screen items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-foreground-secondary">Completing sign in...</p>
      </div>
    </div>
  );
}
