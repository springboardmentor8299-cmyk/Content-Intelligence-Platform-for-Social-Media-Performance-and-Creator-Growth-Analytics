/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { User, Session } from '@supabase/supabase-js';

export type UserRole = 'creator' | 'agency' | 'marketing_team' | 'admin';

export interface Profile {
  id: string;
  email: string | null;
  full_name: string | null;
  avatar_url: string | null;
  role: UserRole;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  loading: boolean;
  signUp: (email: string, password: string, fullName: string, role: UserRole) => Promise<{ error: Error | null }>;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async (userId: string) => {
    if (!supabase) return null;
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    if (error) {
      console.error('Error fetching profile:', error);
      return null;
    }
    return data as Profile;
  };

  const refreshProfile = async () => {
    if (user) {
      const profileData = await fetchProfile(user.id);
      if (profileData) setProfile(profileData);
    }
  };

  useEffect(() => {
    if (!supabase) {
      // Check if there is a cached mock session
      const savedMock = localStorage.getItem('creatoriq_mock_auth');
      if (savedMock) {
        try {
          const parsed = JSON.parse(savedMock);
          setUser(parsed.user);
          setProfile(parsed.profile);
        } catch {
          // ignore
        }
      }
      setLoading(false);
      return;
    }

    const client = supabase;
    client.auth.getUser().then(async ({ data: { user } }) => {
      setUser(user);
      if (user) {
        const { data: { session } } = await client.auth.getSession();
        setSession(session);
        const profileData = await fetchProfile(user.id);
        setProfile(profileData);
      }
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        const profileData = await fetchProfile(session.user.id);
        setProfile(profileData);
      } else {
        setProfile(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string, fullName: string, role: UserRole) => {
    if (!supabase) {
      const mockUser = { id: `mock-${Date.now()}`, email } as User;
      const mockProfile: Profile = {
        id: mockUser.id,
        email,
        full_name: fullName,
        avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=128&h=128&fit=crop',
        role,
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      localStorage.setItem('creatoriq_mock_auth', JSON.stringify({ user: mockUser, profile: mockProfile }));
      setUser(mockUser);
      setProfile(mockProfile);
      return { error: null };
    }
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          role: role,
        },
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    return { error: error as Error | null };
  };

  const signIn = async (email: string, password: string) => {
    if (!supabase) {
      const lower = email.toLowerCase();
      let mockRole: UserRole = 'creator';
      let fullName = 'Jane Doe';
      let avatar = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=128&h=128&fit=crop';

      if (lower.includes('agency')) {
        mockRole = 'agency';
        fullName = 'Apex Talent Agency';
        avatar = 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=128&h=128&fit=crop';
      } else if (lower.includes('marketing')) {
        mockRole = 'marketing_team';
        fullName = 'Brand Growth Team';
        avatar = 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=128&h=128&fit=crop';
      } else if (lower.includes('admin')) {
        mockRole = 'admin';
        fullName = 'System Administrator';
        avatar = 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=128&h=128&fit=crop';
      }

      const mockUser = { id: `mock-${Date.now()}`, email } as User;
      const mockProfile: Profile = {
        id: mockUser.id,
        email,
        full_name: fullName,
        avatar_url: avatar,
        role: mockRole,
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      localStorage.setItem('creatoriq_mock_auth', JSON.stringify({ user: mockUser, profile: mockProfile }));
      setUser(mockUser);
      setProfile(mockProfile);
      return { error: null };
    }
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error: error as Error | null };
  };

  const signOut = async () => {
    localStorage.removeItem('creatoriq_mock_auth');
    setUser(null);
    setProfile(null);
    setSession(null);
    if (supabase) {
      await supabase.auth.signOut();
    }
  };

  return (
    <AuthContext.Provider value={{ user, session, profile, loading, signUp, signIn, signOut, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
