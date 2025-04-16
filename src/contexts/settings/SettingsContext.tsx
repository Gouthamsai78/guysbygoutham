
import React, { createContext, useContext, useEffect, useState } from 'react';
import { AppSettings } from '@/types';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/auth';

interface SettingsContextType {
  showAds: boolean;
  toggleShowAds: () => void;
  reduceAnimations: boolean;
  toggleReduceAnimations: () => void;
  savePreferences: () => Promise<void>;
}

const defaultSettings: AppSettings = {
  showAds: true,
  reduceAnimations: false
};

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<AppSettings>(defaultSettings);
  const { user, isAuthenticated } = useAuth();

  useEffect(() => {
    const loadSettings = async () => {
      // Only load settings if the user is authenticated
      if (isAuthenticated && user) {
        try {
          // Try to get user settings from local storage first for quick loading
          const storedSettings = localStorage.getItem(`settings_${user.id}`);
          if (storedSettings) {
            setSettings(JSON.parse(storedSettings));
          }
          
          // Check if the user_settings table exists
          const { data: tableExists, error: tableCheckError } = await supabase.rpc(
            'check_table_exists',
            { table_name: 'user_settings' }
          );

          // If the table doesn't exist, create it
          if (!tableExists || tableCheckError) {
            console.log('Creating user_settings table');
            await supabase.rpc('create_settings_table');
          }
          
          // Then fetch from database for the most up-to-date settings
          const { data, error } = await supabase.rpc(
            'get_user_settings',
            { user_id_param: user.id }
          );
          
          if (!error && data) {
            // Parse the JSONB data returned from PostgreSQL
            const fetchedSettings = typeof data === 'object' ? { ...defaultSettings, ...data } : defaultSettings;
            setSettings(fetchedSettings);
            localStorage.setItem(`settings_${user.id}`, JSON.stringify(fetchedSettings));
          } else if (error) {
            console.error('Error loading settings:', error);
            // If no settings found, create default settings using RPC
            await supabase.rpc(
              'set_user_settings', 
              { 
                user_id_param: user.id,
                settings_param: defaultSettings
              }
            );
            localStorage.setItem(`settings_${user.id}`, JSON.stringify(defaultSettings));
          }
        } catch (error) {
          console.error('Error in settings initialization:', error);
        }
      }
    };

    loadSettings();
  }, [isAuthenticated, user]);

  const toggleShowAds = () => {
    setSettings(prev => ({
      ...prev,
      showAds: !prev.showAds
    }));
  };
  
  const toggleReduceAnimations = () => {
    setSettings(prev => ({
      ...prev,
      reduceAnimations: !prev.reduceAnimations
    }));
  };

  const savePreferences = async () => {
    if (!user) return Promise.reject(new Error('User not authenticated'));
    
    try {
      localStorage.setItem(`settings_${user.id}`, JSON.stringify(settings));
      
      const { error } = await supabase.rpc(
        'set_user_settings',
        {
          user_id_param: user.id,
          settings_param: settings
        }
      );
      
      if (error) {
        throw error;
      }
      
      return Promise.resolve();
    } catch (error) {
      console.error('Error saving settings:', error);
      return Promise.reject(error);
    }
  };

  useEffect(() => {
    // Add a class to the body when animations should be reduced
    if (settings.reduceAnimations) {
      document.body.classList.add('reduce-animations');
    } else {
      document.body.classList.remove('reduce-animations');
    }
  }, [settings.reduceAnimations]);

  return (
    <SettingsContext.Provider 
      value={{ 
        showAds: settings.showAds,
        toggleShowAds,
        reduceAnimations: settings.reduceAnimations || false,
        toggleReduceAnimations,
        savePreferences
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};
