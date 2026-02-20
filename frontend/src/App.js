import React, { useState } from 'react';
import { Toaster } from 'sonner';
import AppNavigation from './components/AppNavigation';
import WelcomePage from './components/WelcomePage';
import BOMSearch from './components/BOMSearch';
import BOMGrid from './components/BOMGrid';
import COReadinessReview from './components/COReadinessReview';
import ProjectDashboard from './components/ProjectDashboard';
import PMDashboardSearch from './components/PMDashboardSearch';
import './App.css';

function App() {
  const [activeTab, setActiveTab] = useState('welcome');
  const [viewState, setViewState] = useState('search');
  const [selectedScope, setSelectedScope] = useState('Atlas 2.0 – NPDI Launch');
  const [selectedItemNumber, setSelectedItemNumber] = useState('ASM-12000');
  const [dashboardContext, setDashboardContext] = useState(null);

  const handleTabChange = (tab) => {
    if (tab === 'welcome') {
      setActiveTab('welcome');
    } else {
      setActiveTab(tab);
      setViewState('search');
    }
  };

  const handleNavigateToHome = () => {
    setActiveTab('welcome');
    setViewState('search');
  };

  const handleNavigateToBOMContent = (itemNumber) => {
    if (itemNumber) {
      setSelectedItemNumber(itemNumber);
    }
    setViewState('content');
  };

  const handleNavigateToCOContent = (itemNumber) => {
    if (itemNumber) {
      setSelectedItemNumber(itemNumber);
    }
    setViewState('content');
  };

  const handleNavigateToPMContent = (context) => {
    setDashboardContext(context);
    setViewState('content');
  };

  const handleBackToSearch = () => {
    setViewState('search');
  };

  return (
    <div className="min-h-screen bg-slate-100">
      {activeTab !== 'welcome' && (
        <AppNavigation 
          activeTab={activeTab === 'welcome' ? 'bom-grid' : activeTab} 
          onTabChange={handleTabChange}
          onNavigateToHome={handleNavigateToHome}
        />
      )}
      <Toaster position="top-right" />
      
      {/* Welcome Page */}
      {activeTab === 'welcome' && (
        <WelcomePage
          onNavigateToBOMGrid={() => {
            setActiveTab('bom-grid');
            setViewState('search');
          }}
          onNavigateToCOReview={() => {
            setActiveTab('co-readiness');
            setViewState('search');
          }}
          onNavigateToPMDashboard={() => {
            setActiveTab('pm-dashboard');
            setViewState('search');
          }}
        />
      )}
      
      {/* BOM Grid Tab */}
      {activeTab === 'bom-grid' && (
        <>
          {viewState === 'search' && (
            <BOMSearch onNavigateToBOM={handleNavigateToBOMContent} />
          )}
          
          {viewState === 'content' && (
            <BOMGrid
              onNavigateToDashboard={() => {
                setActiveTab('pm-dashboard');
                setViewState('content');
              }}
              onNavigateToCO={() => {
                setActiveTab('co-readiness');
                setViewState('content');
              }}
              onNavigateToSearch={handleBackToSearch}
              selectedScope={selectedScope}
              onScopeChange={setSelectedScope}
            />
          )}
        </>
      )}

      {/* CO Readiness Review Tab */}
      {activeTab === 'co-readiness' && (
        <>
          {viewState === 'search' && (
            <BOMSearch onNavigateToBOM={handleNavigateToCOContent} />
          )}
          
          {viewState === 'content' && (
            <COReadinessReview
              onNavigateToBOM={(itemNumber) => {
                if (itemNumber) {
                  setSelectedItemNumber(itemNumber);
                }
                setActiveTab('bom-grid');
                setViewState('content');
              }}
              onNavigateToDashboard={() => {
                setActiveTab('pm-dashboard');
                setViewState('content');
              }}
              onNavigateToSearch={handleBackToSearch}
              selectedScope={selectedScope}
            />
          )}
        </>
      )}

      {/* PM Dashboard Tab */}
      {activeTab === 'pm-dashboard' && (
        <>
          {viewState === 'search' && (
            <PMDashboardSearch onNavigateToDashboard={handleNavigateToPMContent} />
          )}
          
          {viewState === 'content' && (
            <ProjectDashboard
              onNavigateToBOM={() => {
                setActiveTab('bom-grid');
                setViewState('content');
              }}
              onNavigateToCO={() => {
                setActiveTab('co-readiness');
                setViewState('content');
              }}
              onNavigateToSearch={handleBackToSearch}
              selectedScope={selectedScope}
              onScopeChange={setSelectedScope}
              dashboardContext={dashboardContext || undefined}
            />
          )}
        </>
      )}
    </div>
  );
}

export default App;
