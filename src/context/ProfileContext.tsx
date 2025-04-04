import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Profile } from '../types';

interface ProfileContextType {
  // Profile state
  profiles: Profile[];
  lastUsedProfileId: string | null;
  
  // Profile actions
  addProfile: (name: string) => Profile;
  updateProfile: (profileId: string, name: string) => void;
  deleteProfile: (profileId: string) => void;
  setLastUsedProfile: (profileId: string) => void;
}

export const ProfileContext = createContext<ProfileContextType | undefined>(undefined);

export const ProfileProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [lastUsedProfileId, setLastUsedProfileId] = useState<string | null>(null);
  
  // Load profiles from localStorage on first render
  useEffect(() => {
    // Load profiles
    const savedProfiles = localStorage.getItem('auto-magic-ator-profiles');
    if (savedProfiles) {
      try {
        const parsedProfiles = JSON.parse(savedProfiles) as Profile[];
        setProfiles(parsedProfiles);
      } catch (error) {
        console.error('Failed to parse profiles:', error);
      }
    }
    
    // Load last used profile ID
    const lastProfile = localStorage.getItem('auto-magic-ator-last-profile-id');
    if (lastProfile) {
      setLastUsedProfileId(lastProfile);
    }
  }, []);
  
  // Save profiles to localStorage whenever they change
  useEffect(() => {
    if (profiles.length > 0) {
      localStorage.setItem('auto-magic-ator-profiles', JSON.stringify(profiles));
    }
  }, [profiles]);
  
  // Save last used profile ID to localStorage whenever it changes
  useEffect(() => {
    if (lastUsedProfileId) {
      localStorage.setItem('auto-magic-ator-last-profile-id', lastUsedProfileId);
    }
  }, [lastUsedProfileId]);
  
  // Add a new profile
  const addProfile = (name: string): Profile => {
    if (!name.trim()) {
      throw new Error('Profile name cannot be empty');
    }
    
    const newProfile: Profile = {
      id: Date.now().toString(),
      name: name.trim(),
      createdAt: Date.now(),
      lastUsed: Date.now()
    };
    
    setProfiles(prev => [...prev, newProfile]);
    return newProfile;
  };
  
  // Update an existing profile
  const updateProfile = (profileId: string, name: string) => {
    if (!name.trim()) {
      throw new Error('Profile name cannot be empty');
    }
    
    setProfiles(prev => 
      prev.map(profile => 
        profile.id === profileId 
          ? { ...profile, name: name.trim() } 
          : profile
      )
    );
  };
  
  // Delete a profile
  const deleteProfile = (profileId: string) => {
    setProfiles(prev => prev.filter(profile => profile.id !== profileId));
    
    // If this was the last used profile, clear that reference
    if (lastUsedProfileId === profileId) {
      setLastUsedProfileId(null);
      localStorage.removeItem('auto-magic-ator-last-profile-id');
    }
  };
  
  // Set the last used profile
  const setLastUsedProfile = (profileId: string) => {
    setLastUsedProfileId(profileId);
    
    // Update the lastUsed timestamp for this profile
    setProfiles(prev => 
      prev.map(profile => 
        profile.id === profileId 
          ? { ...profile, lastUsed: Date.now() } 
          : profile
      )
    );
  };
  
  const value = {
    // State
    profiles,
    lastUsedProfileId,
    
    // Actions
    addProfile,
    updateProfile,
    deleteProfile,
    setLastUsedProfile
  };
  
  return <ProfileContext.Provider value={value}>{children}</ProfileContext.Provider>;
};

// Custom hook for using the profile context
export const useProfiles = () => {
  const context = useContext(ProfileContext);
  if (context === undefined) {
    throw new Error('useProfiles must be used within a ProfileProvider');
  }
  return context;
}; 