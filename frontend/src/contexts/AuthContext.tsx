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

import { API_BASE_URL } from '@/config/api';

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
    if (!supabase && profile?.email) {
      try {
        const res = await fetch(`${API_BASE_URL}/api/v1/admin/users`);
        if (res.ok) {
          const users = await res.json();
          const match = users.find((u: any) => u.email.toLowerCase() === profile.email?.toLowerCase());
          if (match) {
            const updated: Profile = {
              ...profile,
              role: match.role as UserRole,
              is_active: match.is_active,
              full_name: match.full_name || profile.full_name,
            };
            setProfile(updated);
            if (user) {
              localStorage.setItem('creatoriq_mock_auth', JSON.stringify({ user, profile: updated }));
            }
          }
        }
      } catch {
        // ignore
      }
      return;
    }

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

          // Synchronize profile with backend to reflect any role updates made by admin
          if (parsed.profile?.email) {
            fetch(`${API_BASE_URL}/api/v1/admin/users`)
              .then(res => (res.ok ? res.json() : null))
              .then(users => {
                if (Array.isArray(users)) {
                  const match = users.find(
                    (u: any) => u.email.toLowerCase() === parsed.profile.email.toLowerCase()
                  );
                  if (match && (match.role !== parsed.profile.role || match.is_active !== parsed.profile.is_active)) {
                    const updated: Profile = {
                      ...parsed.profile,
                      role: match.role as UserRole,
                      is_active: match.is_active,
                    };
                    setProfile(updated);
                    localStorage.setItem(
                      'creatoriq_mock_auth',
                      JSON.stringify({ user: parsed.user, profile: updated })
                    );
                  }
                }
              })
              .catch(() => {});
          }
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
      const lower = email.toLowerCase().trim();

      // 1. Attempt to log in with backend FastAPI endpoint to get real up-to-date role & active status
      try {
        const res = await fetch(`${API_BASE_URL}/api/v1/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: lower, password }),
        });

        if (res.ok) {
          const data = await res.json();
          const apiUser = data.user;
          const mockUser = { id: apiUser.id, email: apiUser.email } as User;
          const mockProfile: Profile = {
            id: apiUser.id,
            email: apiUser.email,
            full_name: apiUser.full_name,
            avatar_url: apiUser.avatar_url,
            role: apiUser.role as UserRole,
            is_active: apiUser.is_active,
            created_at: apiUser.created_at || new Date().toISOString(),
            updated_at: apiUser.updated_at || new Date().toISOString(),
          };
          localStorage.setItem('creatoriq_mock_auth', JSON.stringify({ user: mockUser, profile: mockProfile }));
          setUser(mockUser);
          setProfile(mockProfile);
          return { error: null };
        } else {
          const errData = await res.json().catch(() => ({}));
          if (res.status === 403 || (errData.detail && errData.detail.includes('suspended'))) {
            return { error: new Error(errData.detail || 'This account has been suspended by an administrator.') };
          }
          if (res.status === 401) {
            return { error: new Error(errData.detail || 'Invalid email or password') };
          }
        }
      } catch (err) {
        console.warn('Backend login endpoint unavailable, trying local fallback:', err);
      }

      // 2. Check if user or role was saved in local storage by Admin Dashboard
      const savedAdminUsers = localStorage.getItem('creatoriq_admin_users');
      let customUser: any = null;
      if (savedAdminUsers) {
        try {
          const parsed = JSON.parse(savedAdminUsers);
          customUser = parsed.find((u: any) => u.email.toLowerCase() === lower);
        } catch {
          // ignore
        }
      }

      if (customUser && customUser.is_active === false) {
        return { error: new Error('This account has been suspended by an administrator.') };
      }

      let mockRole: UserRole = (customUser?.role as UserRole) || 'creator';
      let fullName = customUser?.full_name || 'Jane Doe';
      let avatar = customUser?.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=128&h=128&fit=crop';

      if (!customUser) {
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
      }

      const mockUser = { id: customUser?.id || `mock-${Date.now()}`, email: lower } as User;
      const mockProfile: Profile = {
        id: mockUser.id,
        email: lower,
        full_name: fullName,
        avatar_url: avatar,
        role: mockRole,
        is_active: customUser ? customUser.is_active : true,
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
