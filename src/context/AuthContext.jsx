import React, { createContext, useContext, useState } from 'react';
import { CREATOR_PROFILE } from '../utils/mockData';

const AuthContext = createContext();

const INITIAL_SOCIAL_CONNECTIONS = {
  youtube: { connected: true, handle: '@cat_boss', followers: '820K' },
  instagram: { connected: true, handle: '@cat_boss_real', followers: '340K' },
  facebook: { connected: true, handle: 'MisterCat Official', followers: '190K' },
  twitter: { connected: true, handle: '@cat_boss', followers: '115K' },
  linkedin: { connected: false, handle: 'Mister Cat', followers: '45K' },
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('createriq_user');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // Fallback
      }
    }
    return {
      ...CREATOR_PROFILE,
      socialConnections: INITIAL_SOCIAL_CONNECTIONS,
    };
  });

  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return localStorage.getItem('createriq_authed') === 'true' || true;
  });

  const login = (email, password) => {
    const userData = {
      ...CREATOR_PROFILE,
      email: email || 'mistercat@creatoriq.app',
      socialConnections: user?.socialConnections || INITIAL_SOCIAL_CONNECTIONS,
    };
    setUser(userData);
    setIsAuthenticated(true);
    localStorage.setItem('createriq_authed', 'true');
    localStorage.setItem('createriq_user', JSON.stringify(userData));
    return true;
  };

  const googleLogin = () => {
    const googleUser = {
      name: 'Mister Cat (Google)',
      handle: '@cat_boss',
      email: 'mistercat.google@creatoriq.app',
      avatar: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=150&auto=format&fit=crop&q=80',
      niche: 'AI & Creative Coding',
      tier: 'PRO Creator',
      totalFollowers: 1485000,
      followerGrowthPct: 14.8,
      avgEngagementRate: 6.42,
      monthlyRevenue: 42850,
      revenueGrowthPct: 22.4,
      socialConnections: INITIAL_SOCIAL_CONNECTIONS,
    };
    setUser(googleUser);
    setIsAuthenticated(true);
    localStorage.setItem('createriq_authed', 'true');
    localStorage.setItem('createriq_user', JSON.stringify(googleUser));
    return true;
  };

  const registerAccount = (accountData) => {
    const newUser = {
      name: accountData.name || 'New Creator',
      handle: accountData.handle || `@${accountData.name?.toLowerCase().replace(/\s+/g, '') || 'creator'}`,
      email: accountData.email,
      avatar: '/cat_boss.png',
      niche: accountData.niche || 'General Content Creator',
      tier: 'PRO Creator',
      totalFollowers: 125000,
      followerGrowthPct: 18.2,
      avgEngagementRate: 7.15,
      monthlyRevenue: 12400,
      revenueGrowthPct: 28.5,
      socialConnections: {
        ...INITIAL_SOCIAL_CONNECTIONS,
        ...accountData.connectedPlatforms,
      },
    };
    setUser(newUser);
    setIsAuthenticated(true);
    localStorage.setItem('createriq_authed', 'true');
    localStorage.setItem('createriq_user', JSON.stringify(newUser));
    return true;
  };

  const toggleSocialConnection = (platformId) => {
    setUser((prev) => {
      const currentCons = prev.socialConnections || INITIAL_SOCIAL_CONNECTIONS;
      const target = currentCons[platformId] || { connected: false, handle: '@creator', followers: '10K' };
      const updated = {
        ...prev,
        socialConnections: {
          ...currentCons,
          [platformId]: {
            ...target,
            connected: !target.connected,
          },
        },
      };
      localStorage.setItem('createriq_user', JSON.stringify(updated));
      return updated;
    });
  };

  const logout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('createriq_authed');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        login,
        googleLogin,
        registerAccount,
        toggleSocialConnection,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
