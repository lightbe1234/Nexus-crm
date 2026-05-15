import React, { createContext, useContext, useState, useEffect } from 'react';
import { getSettings, initSettings } from '../services/db';
import { defaultSettings } from './defaultSettings';
import { useAuth } from '../contexts/AuthContext';

const SettingsContext = createContext();

export const useSettings = () => useContext(SettingsContext);

export const SettingsProvider = ({ children }) => {
  const { currentUser } = useAuth();
  const [settings, setSettings] = useState(defaultSettings);
  const [loading, setLoading] = useState(true);

  const refreshSettings = async () => {
    try {
      let data = await getSettings();
      if (!data) {
        await initSettings(defaultSettings);
        data = defaultSettings;
      }
      setSettings(data);
    } catch (err) {
      console.error("Error loading settings:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (currentUser) {
      refreshSettings();
    } else {
      setLoading(false);
    }
  }, [currentUser]);

  return (
    <SettingsContext.Provider value={{ settings, loading, refreshSettings }}>
      {children}
    </SettingsContext.Provider>
  );
};
