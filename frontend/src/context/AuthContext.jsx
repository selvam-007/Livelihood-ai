import React, { createContext, useContext, useState, useEffect } from 'react';
import apiClient, { AUTH_TOKEN_KEY } from '../utils/apiClient';

const AuthContext = createContext();

export const DEMO_PROFILES = {
  selvam: {
    id: 'cand-000',
    name: 'Selvam C.',
    email: 'selvamc01@gmail.com',
    nameTa: 'செல்வம் சி.',
    ageGroup: '18-24',
    location: 'Chennai, Tamil Nadu',
    education: 'B.Tech (1st Year)',
    priorOccupation: 'Student / Personal Projects',
    experienceYears: 2,
    experience: '2 years (Personal Projects)',
    interests: 'AI, Data Science, Game Development',
    goal: 'AI Engineer',
    resources: ['Personal Laptop', 'Python & VS Code', 'GitHub Portfolio', 'Broadband Internet', 'Google Colab GPU'],
    currentSkills: [
      { name: 'Python', level: 'Intermediate', percentage: 70, verified: true, category: 'Programming' },
      { name: 'HTML', level: 'Intermediate', percentage: 65, verified: true, category: 'Frontend' },
      { name: 'C', level: 'Beginner', percentage: 40, verified: true, category: 'Core Programming' },
      { name: 'AI', level: 'Intermediate', percentage: 75, verified: true, category: 'Machine Learning' },
      { name: 'Unity', level: 'Beginner', percentage: 45, verified: true, category: 'Game Engine' },
    ],
    missingCompetencies: [
      { name: 'Feature Engineering & Model Optimization', urgency: 'High', module: 'SSC/Q8102 - AI Associate' },
      { name: 'Cloud MLOps & Model Deployment', urgency: 'Medium', module: 'SSC/N8105 - ML Engineering' },
      { name: 'Production Data Pipeline Orchestration', urgency: 'High', module: 'SSC/N8108 - Data Engineering' },
      { name: 'Ethical AI & Data Governance', urgency: 'Low', module: 'SSC/N8112 - AI Ethics' }
    ],
    targetPathway: {
      title: 'Python for Data Science & AI Engineer',
      nsqfLevel: 'NSQF Level 5',
      qpCode: 'SSC/Q8102',
      council: 'IT-ITeS Sector Skill Council (NASSCOM)',
      matchScore: 88,
      type: 'Wage Employment',
      potentialIncome: '₹35,000 - ₹55,000 / month',
      nextAction: 'Enroll in NSQF Level 5 Python for Data Science (3 Months, Online / Self-paced)',
      explanation: 'Matches your 2 years of personal project experience in Python, HTML, and AI fundamentals. Bridging feature engineering and cloud deployment qualifies you directly for NSQF Level 5 AI Engineer placement.',
    }
  },
  tailor: {
    id: 'cand-001',
    name: 'Lakshmi Priya',
    nameTa: 'லட்சுமி பிரியா',
    ageGroup: '25-35',
    location: 'Madurai, Tamil Nadu',
    education: '12th Standard (Higher Secondary)',
    priorOccupation: 'Apparel Stitching Assistant',
    experienceYears: 2,
    goal: 'Self-Employment / Home Micro-Enterprise',
    resources: ['Manual Sewing Machine', 'Pattern Scraps', 'Measuring Kit', 'Smartphone with UPI'],
    currentSkills: [
      { name: 'Basic Machine Stitching', level: 'Intermediate', verified: true, category: 'Technical' },
      { name: 'Fabric Cutting & Marking', level: 'Basic', verified: true, category: 'Technical' },
      { name: 'Button & Zipper Fixing', level: 'Intermediate', verified: true, category: 'Technical' },
      { name: 'Customer Fitting Consultation', level: 'Basic', verified: false, category: 'Soft Skill' },
      { name: 'Digital Payments (UPI)', level: 'Intermediate', verified: true, category: 'Digital' },
    ],
    missingCompetencies: [
      { name: 'Advanced Pattern Drafting & Grading', urgency: 'High', module: 'AMH/Q1947 - Self Employed Tailor' },
      { name: 'Apparel Quality Inspection & Finishing', urgency: 'Medium', module: 'AMH/N1948 - Finishing' },
      { name: 'Micro-Enterprise Costing & Pricing', urgency: 'High', module: 'MEPSC/N0102 - Entrepreneurship' },
      { name: 'Digital Marketing & Social Commerce', urgency: 'Low', module: 'DGT/N0901 - Digital Sales' }
    ],
    targetPathway: {
      title: 'Self-Employed Tailor & Boutique Entrepreneur',
      nsqfLevel: 'NSQF Level 4',
      qpCode: 'AMH/Q1947',
      council: 'Apparel Made-Ups & Home Furnishing Sector Skill Council',
      matchScore: 88,
      type: 'Self-Employment',
      potentialIncome: '₹18,000 - ₹32,000 / month',
      nextAction: 'Enroll in PMKVY 4.0 Advanced Blouse & Kurti Pattern Drafting (Free 45-hr hybrid batch)',
      explanation: 'Matches your 2 years of manual stitching experience and available home sewing machine. Addressing the pattern drafting gap will qualify you for higher margin bespoke tailoring orders.',
    }
  },
  electrician: {
    id: 'cand-002',
    name: 'Karthik Subramanian',
    nameTa: 'கார்த்திக் சுப்ரமணியன்',
    ageGroup: '18-24',
    location: 'Coimbatore, Tamil Nadu',
    education: '10th Standard (SSLC)',
    priorOccupation: 'Helper to Domestic Electrician',
    experienceYears: 1.5,
    goal: 'Skilled Wage Employment / Certified Technician',
    resources: ['Basic Hand Toolset', 'Digital Multimeter', 'Two-Wheeler'],
    currentSkills: [
      { name: 'Conduit Wiring Pulling', level: 'Intermediate', verified: true, category: 'Technical' },
      { name: 'Switchboard Fixing', level: 'Intermediate', verified: true, category: 'Technical' },
      { name: 'Basic Continuity Testing', level: 'Basic', verified: true, category: 'Technical' },
      { name: 'Tool Handling Safety', level: 'Intermediate', verified: true, category: 'Safety' },
    ],
    missingCompetencies: [
      { name: 'IE Rules & High-Voltage Electrical Safety', urgency: 'High', module: 'ELE/Q6001 - Wireman' },
      { name: 'Single Phase Inverter & UPS Installation', urgency: 'High', module: 'ELE/N6002 - Power Systems' },
      { name: 'Earthing Resistance Measurement', urgency: 'Medium', module: 'ELE/N6004 - Testing' }
    ],
    targetPathway: {
      title: 'Certified Domestic Electrical Solutions Technician',
      nsqfLevel: 'NSQF Level 3/4',
      qpCode: 'ELE/Q6001',
      council: 'Electronic & Power Sector Skill Council of India',
      matchScore: 84,
      type: 'Wage Employment',
      potentialIncome: '₹16,000 - ₹24,000 / month',
      nextAction: 'Take RPL (Recognition of Prior Learning) Level 3 Assessment at Coimbatore Govt ITI',
      explanation: 'Builds directly on your 1.5 years on-site experience as an apprentice helper. Formal certification enables commercial contractor placement.',
    }
  },
  it: {
    id: 'cand-003',
    name: 'Meena Sundaram',
    nameTa: 'மீனா சுந்தரம்',
    ageGroup: '20-28',
    location: 'Tiruchirappalli, Tamil Nadu',
    education: 'Polytechnic Diploma (Computer Science)',
    priorOccupation: 'Back-office Data Clerk',
    experienceYears: 1,
    goal: 'Formal Technical IT Employment',
    resources: ['Home Laptop', 'Broadband Internet', 'English Fluency'],
    currentSkills: [
      { name: 'Spreadsheets & MS Excel Formulas', level: 'Advanced', verified: true, category: 'Digital' },
      { name: 'Data Entry & Touch Typing', level: 'Advanced', verified: true, category: 'Digital' },
      { name: 'Basic SQL Querying', level: 'Basic', verified: true, category: 'Technical' },
      { name: 'Email Etiquette & Communication', level: 'Intermediate', verified: true, category: 'Soft Skill' },
    ],
    missingCompetencies: [
      { name: 'CRM & ERP Data Pipeline Handling', urgency: 'High', module: 'SSC/Q0508 - CRM Operator' },
      { name: 'Business Intelligence Dashboarding (PowerBI)', urgency: 'Medium', module: 'SSC/N0509 - Analytics' },
      { name: 'Data Privacy & IT Act Compliance', urgency: 'Medium', module: 'SSC/N0512 - Security' }
    ],
    targetPathway: {
      title: 'CRM Data Operations & Business Process Associate',
      nsqfLevel: 'NSQF Level 5',
      qpCode: 'SSC/Q0508',
      council: 'IT-ITeS Sector Skill Council (NASSCOM)',
      matchScore: 91,
      type: 'Wage Employment',
      potentialIncome: '₹22,000 - ₹35,000 / month',
      nextAction: 'Enroll in FutureSkills PRIME 60-Hour Fast-Track CRM Associate program with placement drive',
      explanation: 'Leverages your CS Diploma and high spreadsheet fluency. Bridging the CRM pipeline gap positions you for tier-1 IT-BPM employment.',
    }
  }
};

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem('livelihood_token') || null);
  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem('livelihood_user');
    return saved ? JSON.parse(saved) : null;
  });

  const [currentRole, setCurrentRole] = useState(() => {
    return localStorage.getItem('livelihood_role') || 'candidate';
  });

  const [activeProfileKey, setActiveProfileKey] = useState('selvam');
  const [profiles, setProfiles] = useState(() => DEMO_PROFILES);

  const updateActiveProfile = (updates) => {
    setProfiles((prev) => ({
      ...prev,
      [activeProfileKey]: {
        ...prev[activeProfileKey],
        ...updates
      }
    }));
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
      // If current user is not admin, ensure currentRole is candidate (or user's actual role)
      const userRole = currentUser.role || 'candidate';
      setCurrentRole(userRole);
      localStorage.setItem('livelihood_role', userRole);
    } else {
      localStorage.removeItem('livelihood_user');
      setCurrentRole('candidate');
      localStorage.setItem('livelihood_role', 'candidate');
    }
  }, [currentUser]);

  const toggleRole = () => {
    // Only allow switching to admin if currentUser is actually an admin
    if (currentUser?.role === 'admin') {
      const nextRole = currentRole === 'admin' ? 'candidate' : 'admin';
      setCurrentRole(nextRole);
      localStorage.setItem('livelihood_role', nextRole);
    } else {
      // Non-admin users cannot switch to admin without logging in
      setCurrentRole('candidate');
      localStorage.setItem('livelihood_role', 'candidate');
    }
  };

  // Listen for unauthorized 401 events to auto-reset auth context
  useEffect(() => {
    const handleUnauthorized = () => {
      setToken(null);
      setCurrentUser(null);
      setCurrentRole('candidate');
    };

    window.addEventListener('auth:unauthorized', handleUnauthorized);
    return () => window.removeEventListener('auth:unauthorized', handleUnauthorized);
  }, []);

  const loginWithCredentials = async (email, password) => {
    const res = await apiClient.login(email, password);
    setToken(res.data.access_token);
    setCurrentUser(res.data.user);
    setCurrentRole(res.data.user.role);
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
    setCurrentRole('candidate');
    localStorage.removeItem('livelihood_token');
    localStorage.removeItem('livelihood_user');
    localStorage.setItem('livelihood_role', 'candidate');
  };

  const activeProfile = profiles[activeProfileKey] || profiles.selvam || DEMO_PROFILES.selvam;

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
