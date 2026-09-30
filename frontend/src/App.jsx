import React, { useState, useEffect, Suspense, lazy } from 'react';
import { LanguageProvider } from './context/LanguageContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import Sidebar from './components/layout/Sidebar';
import TopNavbar from './components/layout/TopNavbar';
import MobileBottomNav from './components/layout/MobileBottomNav';
import ErrorBoundary from './components/common/ErrorBoundary';
import LoadingState from './components/common/LoadingState';
import ReloadPrompt from './components/common/ReloadPrompt';

// Route-level code splitting with React.lazy
const HomeView = lazy(() => import('./components/views/HomeView'));
const VoiceInputView = lazy(() => import('./components/views/VoiceInputView'));
const ProfileView = lazy(() => import('./components/views/ProfileView'));
const RecommendationsView = lazy(() => import('./components/views/RecommendationsView'));
const NsqfInfoView = lazy(() => import('./components/views/NsqfInfoView'));
const ProgressView = lazy(() => import('./components/views/ProgressView'));
const SettingsView = lazy(() => import('./components/views/SettingsView'));
const AdminDashboard = lazy(() => import('./components/admin/AdminDashboard'));
const FieldAgentView = lazy(() => import('./components/views/FieldAgentView'));
const TrainingProviderView = lazy(() => import('./components/views/TrainingProviderView'));

// Lazy load modals & overlay widgets to keep initial entry bundle ultralight
const SkillPathAuthModal = lazy(() => import('./components/common/SkillPathAuthModal'));
const SplashScreen = lazy(() => import('./components/common/SplashScreen'));
const VoiceAssessmentModal = lazy(() => import('./components/candidate/VoiceAssessmentModal'));
const FloatingAssistant = lazy(() => import('./components/common/FloatingAssistant'));

function MainAppShell() {
  const { currentRole, setCurrentRole, currentUser } = useAuth();
  
  // Set showSplash to false by default to prevent blocking user background
  const [showSplash, setShowSplash] = useState(false);
  const [authModalMode, setAuthModalMode] = useState('login');
  const [activeTab, setActiveTab] = useState('home');
  const [selectedCourseId, setSelectedCourseId] = useState(null);
  const [recommendationsSubTab, setRecommendationsSubTab] = useState('courses');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isVoiceModalOpen, setIsVoiceModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const isAdminUser = currentUser?.role === 'admin';

  const handleDismissSplash = () => {
    setShowSplash(false);
  };

  const handleOpenAuth = (mode = 'login') => {
    setAuthModalMode(mode);
    setIsAuthModalOpen(true);
  };

  const handleRequireAdminAuth = () => {
    if (isAdminUser) {
      setCurrentRole('admin');
    } else {
      handleOpenAuth('admin');
    }
  };

  // Automatically prompt login modal on 401 Unauthorized
  useEffect(() => {
    const handleUnauthorized = () => {
      setAuthModalMode('login');
      setIsAuthModalOpen(true);
    };

    window.addEventListener('auth:unauthorized', handleUnauthorized);
    return () => window.removeEventListener('auth:unauthorized', handleUnauthorized);
  }, []);

  // Handle navigation from cards or sidebar
  const handleNavigate = (tabId, subParam = null) => {
    setCurrentRole('candidate');
    setActiveTab(tabId);
    if (tabId === 'courses') {
      setSelectedCourseId(subParam || null);
      setRecommendationsSubTab('courses');
    } else if (tabId === 'recommendations') {
      setSelectedCourseId(null);
      setRecommendationsSubTab(subParam || 'courses');
    }
  };

  const handleSelectCourse = (courseId) => {
    setCurrentRole('candidate');
    setSelectedCourseId(courseId);
    setRecommendationsSubTab('courses');
    setActiveTab('courses');
  };

  const handleTriggerSearch = () => {
    if (!searchQuery.trim()) return;
    const q = searchQuery.toLowerCase();
    
    if (q.includes('admin') || q.includes('state') || q.includes('analytics')) {
      if (isAdminUser) {
        setCurrentRole('admin');
      } else {
        handleRequireAdminAuth();
      }
    } else if (q.includes('voice') || q.includes('mic') || q.includes('speak')) {
      setCurrentRole('candidate');
      setActiveTab('voice');
    } else if (q.includes('profile') || q.includes('skill')) {
      setCurrentRole('candidate');
      setActiveTab('profile');
    } else if (q.includes('nsqf') || q.includes('level')) {
      setCurrentRole('candidate');
      setActiveTab('nsqf');
    } else if (q.includes('progress') || q.includes('growth')) {
      setCurrentRole('candidate');
      setActiveTab('progress');
    } else {
      setCurrentRole('candidate');
      setActiveTab('recommendations');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex antialiased">
      {/* Fixed Left Sidebar (SkillPath AI Dark Navy) */}
      <Sidebar
        activeTab={activeTab}
        onSelectTab={(tabId) => {
          if (tabId === 'admin') {
            if (isAdminUser) {
              setCurrentRole('admin');
            } else {
              handleRequireAdminAuth();
            }
          } else {
            setCurrentRole('candidate');
            setSelectedCourseId(null);
            if (tabId === 'courses') {
              setRecommendationsSubTab('courses');
            } else if (tabId === 'recommendations') {
              setRecommendationsSubTab('courses');
            }
            setActiveTab(tabId);
          }
        }}
        onRequireAdminAuth={handleRequireAdminAuth}
        isMobileOpen={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
      />

      {/* Main Content Area (offset by 64 / 16rem for desktop sidebar) */}
      <div className="flex-1 lg:pl-64 flex flex-col min-w-0 min-h-screen">
        {/* Top Navbar */}
        <TopNavbar
          onOpenMobileSidebar={() => setIsMobileSidebarOpen(true)}
          onOpenAuthModal={handleOpenAuth}
          onOpenSplashScreen={() => setShowSplash(true)}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          onTriggerSearch={handleTriggerSearch}
        />

        {/* Dynamic Main View */}
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-24 lg:pb-12">
          <ErrorBoundary key={`${currentRole}-${activeTab}`}>
            <Suspense fallback={<LoadingState message="Loading view..." height="h-96" />}>
              {currentRole === 'admin' && isAdminUser ? (
                <AdminDashboard />
              ) : (
                <>
                  {activeTab === 'home' && (
                    <HomeView
                      onNavigate={handleNavigate}
                      onOpenVoiceModal={() => setActiveTab('voice')}
                    />
                  )}

                  {activeTab === 'voice' && (
                    <VoiceInputView
                      onNavigate={handleNavigate}
                      onOpenGuidedModal={() => setIsVoiceModalOpen(true)}
                    />
                  )}

                  {activeTab === 'profile' && (
                    <ProfileView onNavigate={handleNavigate} onOpenAuth={handleOpenAuth} />
                  )}

                  {(activeTab === 'recommendations' || activeTab === 'courses') && (
                    <RecommendationsView
                      selectedCourseId={selectedCourseId}
                      initialSubTab={activeTab === 'courses' ? 'courses' : recommendationsSubTab}
                      onSelectCourse={handleSelectCourse}
                      onBackToList={() => setSelectedCourseId(null)}
                      onNavigate={handleNavigate}
                      onOpenAuth={handleOpenAuth}
                    />
                  )}

                  {activeTab === 'nsqf' && (
                    <NsqfInfoView />
                  )}

                  {activeTab === 'progress' && (
                    <ProgressView onNavigate={handleNavigate} />
                  )}

                  {activeTab === 'settings' && (
                    <SettingsView />
                  )}
                </>
              )}
            </Suspense>
          </ErrorBoundary>
        </main>
      </div>

      {/* Mobile Bottom Navigation Bar */}
      <MobileBottomNav
        activeTab={activeTab}
        onSelectTab={(tabId) => {
          setSelectedCourseId(null);
          setActiveTab(tabId);
        }}
      />

      {/* Lazy Modals & Interactive Overlays */}
      <Suspense fallback={null}>
        {isAuthModalOpen && (
          <SkillPathAuthModal
            isOpen={isAuthModalOpen}
            initialMode={authModalMode}
            onClose={() => setIsAuthModalOpen(false)}
          />
        )}

        {isVoiceModalOpen && (
          <VoiceAssessmentModal
            isOpen={isVoiceModalOpen}
            onClose={() => setIsVoiceModalOpen(false)}
          />
        )}

        <FloatingAssistant />

        {showSplash && (
          <SplashScreen
            onExplore={handleDismissSplash}
            onOpenAuth={(mode) => {
              handleDismissSplash();
              handleOpenAuth(mode);
            }}
          />
        )}
      </Suspense>

      {/* PWA Update Banner */}
      <ReloadPrompt />
    </div>
  );
}

export default function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <MainAppShell />
      </AuthProvider>
    </LanguageProvider>
  );
}
