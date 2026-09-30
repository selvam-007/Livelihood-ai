import React, { createContext, useContext, useState, useEffect } from 'react';
import apiClient, { AUTH_TOKEN_KEY } from '../utils/apiClient';

const AuthContext = createContext();

export const DEMO_PROFILES = {};

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem('livelihood_token') || null);
  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem('livelihood_user');
    return saved ? JSON.parse(saved) : null;
  });

  const [currentRole, setCurrentRole] = useState(() => {
    return localStorage.getItem('livelihood_role') || 'candidate';
  });

  const [userProfile, setUserProfile] = useState(null);
  const [activeProfileKey, setActiveProfileKey] = useState('user');
  const [profiles, setProfiles] = useState({});

  // Dynamically fetch authenticated candidate profile from the backend API
  useEffect(() => {
    let isMounted = true;
    if (token && currentUser) {
      apiClient.getMyProfile()
        .then((res) => {
          if (isMounted && res?.data) {
            setUserProfile(res.data);
          }
        })
        .catch((err) => {
          console.warn('Profile fetch (non-fatal):', err);
        });
    } else {
      setUserProfile(null);
    }
    return () => { isMounted = false; };
  }, [token, currentUser]);

  const updateActiveProfile = async (updates) => {
    if (currentUser) {
      try {
        const res = await apiClient.updateMyProfile(updates);
        if (res?.data) {
          setUserProfile(res.data);
          return res.data;
        }
      } catch (err) {
        console.error('Failed to update profile:', err);
      }
    }
  };

  // Sync token to localStorage
  useEffect(() => {
    if (token) {
      localStorage.setItem('livelihood_token', token);
    } else {
      localStorage.removeItem('livelihood_token');
    }
  }, [token]);

  // Sync user to localStorage
  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('livelihood_user', JSON.stringify(currentUser));
      const userRole = (currentUser.email && currentUser.email.toLowerCase() === 'admin@livelihood.ai') 
        ? 'admin' 
        : (currentUser.role || 'candidate');
      setCurrentRole(userRole);
      localStorage.setItem('livelihood_role', userRole);
    } else {
      localStorage.removeItem('livelihood_user');
      setCurrentRole('candidate');
      localStorage.setItem('livelihood_role', 'candidate');
      setUserProfile(null);
    }
  }, [currentUser]);

  const toggleRole = () => {
    if (currentUser?.role === 'admin') {
      const nextRole = currentRole === 'admin' ? 'candidate' : 'admin';
      setCurrentRole(nextRole);
      localStorage.setItem('livelihood_role', nextRole);
    } else {
      setCurrentRole('candidate');
      localStorage.setItem('livelihood_role', 'candidate');
    }
  };

  // Listen for unauthorized 401 events to auto-reset auth context
  useEffect(() => {
    const handleUnauthorized = () => {
      setToken(null);
      setCurrentUser(null);
      setUserProfile(null);
      setCurrentRole('candidate');
    };

    window.addEventListener('auth:unauthorized', handleUnauthorized);
    return () => window.removeEventListener('auth:unauthorized', handleUnauthorized);
  }, []);

  const loginWithCredentials = async (email, password) => {
    const res = await apiClient.login(email, password);
    const user = res.data.user;
    if (email && email.toLowerCase() === 'admin@livelihood.ai' && user.role !== 'admin') {
      user.role = 'admin';
    }
    setToken(res.data.access_token);
    setCurrentUser(user);
    setCurrentRole(user.role);
    return res.data;
  };

  const loginWithPhoneOtp = async (phone, otp, optionalData = {}) => {
    const res = await apiClient.verifyPhoneOtp({
      phone,
      otp,
      ...optionalData
    });
    setToken(res.data.access_token);
    setCurrentUser(res.data.user);
    setCurrentRole(res.data.user.role);
    return res.data;
  };

  const registerWithCredentials = async (userData) => {
    const res = await apiClient.register(userData);
    setToken(res.data.access_token);
    setCurrentUser(res.data.user);
    setCurrentRole(res.data.user.role);
    return res.data;
  };

  const logout = () => {
    setToken(null);
    setCurrentUser(null);
    setUserProfile(null);
    setCurrentRole('candidate');
    localStorage.removeItem('livelihood_token');
    localStorage.removeItem('livelihood_user');
    localStorage.setItem('livelihood_role', 'candidate');
  };

  // Only provide an active profile when a candidate is authenticated
  const activeProfile = currentUser ? {
    id: currentUser.id,
    name: currentUser.full_name || 'Candidate',
    email: currentUser.email || '',
    phone: currentUser.phone || '',
    location: currentUser.location || userProfile?.location || '',
    education: userProfile?.education_level || '',
    experienceYears: userProfile?.experience_years || 0,
    experience: userProfile?.prior_occupation ? `${userProfile.prior_occupation} (${userProfile.experience_years || 0} yrs)` : '',
    interests: userProfile?.livelihood_goal || '',
    goal: userProfile?.livelihood_goal || '',
    resources: userProfile?.resources || [],
    constraints: userProfile?.constraints || [],
    currentSkills: userProfile?.skills || [],
    completionPercentage: userProfile?.completion_percentage || 20,
    targetPathway: null
  } : null;

  return (
    <AuthContext.Provider value={{
      token,
      currentUser,
      currentRole,
      setCurrentRole,
      toggleRole,
      loginWithCredentials,
      loginWithPhoneOtp,
      registerWithCredentials,
      logout,
      activeProfileKey,
      setActiveProfileKey,
      activeProfile,
      profiles,
      updateActiveProfile
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
