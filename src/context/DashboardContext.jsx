import React, { createContext, useContext, useState, useEffect } from 'react';
import { PLATFORMS, TIMEFRAMES, RECENT_NOTIFICATIONS } from '../utils/mockData';

const DashboardContext = createContext();

export const DashboardProvider = ({ children }) => {
  const [selectedPlatform, setSelectedPlatform] = useState('all');
  const [timeframe, setTimeframe] = useState('30d');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [notifications, setNotifications] = useState(RECENT_NOTIFICATIONS);
  const [realTimeSim, setRealTimeSim] = useState(false);

  // Theme Mode State ('dark' | 'light')
  const [theme, setTheme] = useState(() => {
    const savedTheme = localStorage.getItem('createriq_theme');
    return savedTheme || 'dark'; // Default dark theme
  });

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('createriq_theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(prev => !prev);
  };

  const toggleSidebarCollapse = () => {
    setIsSidebarCollapsed(prev => !prev);
  };

  const markNotificationAsRead = (id) => {
    setNotifications(prev =>
      prev.map(n => n.id === id ? { ...n, unread: false } : n)
    );
  };

  const clearAllNotifications = () => {
    setNotifications([]);
  };

  return (
    <DashboardContext.Provider
      value={{
        theme,
        setTheme,
        toggleTheme,
        selectedPlatform,
        setSelectedPlatform,
        timeframe,
        setTimeframe,
        isSidebarOpen,
        setIsSidebarOpen,
        toggleSidebar,
        isSidebarCollapsed,
        toggleSidebarCollapse,
        notifications,
        markNotificationAsRead,
        clearAllNotifications,
        realTimeSim,
        setRealTimeSim,
        platforms: PLATFORMS,
        timeframes: TIMEFRAMES,
      }}
    >
      {children}
    </DashboardContext.Provider>
  );
};

export const useDashboard = () => useContext(DashboardContext);
