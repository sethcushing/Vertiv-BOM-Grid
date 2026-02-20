import React from 'react';
import { LayoutGrid, ClipboardCheck, BarChart3, ArrowRight, Layers, Target, Users } from 'lucide-react';

const WelcomePage = ({ onNavigateToBOMGrid, onNavigateToCOReview, onNavigateToPMDashboard }) => {
  const features = [
    {
      id: 'bom-grid',
      title: 'BOM Grid',
      description: 'View and manage Bill of Materials with hierarchical structure, multi-dimensional readiness tracking, and cross-functional visibility.',
      icon: LayoutGrid,
      color: 'blue',
      onClick: onNavigateToBOMGrid,
    },
    {
      id: 'co-readiness',
      title: 'CO Readiness Review',
      description: 'Track engineering change order readiness, identify blockers, and monitor item progression through lifecycle stages.',
      icon: ClipboardCheck,
      color: 'emerald',
      onClick: onNavigateToCOReview,
    },
    {
      id: 'pm-dashboard',
      title: 'PM Dashboard',
      description: 'Visual analytics dashboard for project managers with KPIs, timeline tracking, and activation funnel metrics.',
      icon: BarChart3,
      color: 'purple',
      onClick: onNavigateToPMDashboard,
    },
  ];

  const highlights = [
    {
      icon: Layers,
      title: '40+ Data Fields',
      description: 'Comprehensive item attributes across design, procurement, manufacturing, and quality.',
    },
    {
      icon: Target,
      title: '24 Functional Requirements',
      description: '100% FR compliance with complete readiness tracking and lifecycle visibility.',
    },
    {
      icon: Users,
      title: 'Role-Based Views',
      description: 'Engineering, Procurement, PM, and AME views with tailored column visibility.',
    },
  ];

  const colorClasses = {
    blue: {
      bg: 'bg-blue-50',
      border: 'border-blue-200',
      iconBg: 'bg-blue-100',
      icon: 'text-blue-600',
      hover: 'hover:border-blue-400 hover:bg-blue-100/50',
    },
    emerald: {
      bg: 'bg-emerald-50',
      border: 'border-emerald-200',
      iconBg: 'bg-emerald-100',
      icon: 'text-emerald-600',
      hover: 'hover:border-emerald-400 hover:bg-emerald-100/50',
    },
    purple: {
      bg: 'bg-purple-50',
      border: 'border-purple-200',
      iconBg: 'bg-purple-100',
      icon: 'text-purple-600',
      hover: 'hover:border-purple-400 hover:bg-purple-100/50',
    },
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Hero Section */}
      <div className="bg-slate-800 text-white">
        <div className="max-w-6xl mx-auto px-8 py-16">
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-4" data-testid="welcome-title">
              Enterprise BOM Convergence Grid
            </h1>
            <p className="text-xl text-slate-300 max-w-3xl mx-auto">
              A comprehensive visibility and readiness tracking layer for Bill of Materials management, 
              engineering change orders, and cross-functional collaboration.
            </p>
            <div className="flex items-center justify-center gap-4 mt-8">
              <span className="px-3 py-1 bg-emerald-500/20 text-emerald-300 rounded-full text-sm font-medium">
                Production Ready
              </span>
              <span className="px-3 py-1 bg-blue-500/20 text-blue-300 rounded-full text-sm font-medium">
                FR Compliance: 24/24
              </span>
              <span className="px-3 py-1 bg-purple-500/20 text-purple-300 rounded-full text-sm font-medium">
                Version V23
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-8 py-12">
        {/* Quick Start Cards */}
        <div className="mb-12">
          <h2 className="text-2xl font-semibold text-slate-800 mb-6">Quick Start</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {features.map((feature) => {
              const Icon = feature.icon;
              const colors = colorClasses[feature.color];
              
              return (
                <button
                  key={feature.id}
                  onClick={feature.onClick}
                  data-testid={`welcome-${feature.id}-btn`}
                  className={`p-6 rounded-xl border-2 ${colors.border} ${colors.bg} ${colors.hover} transition-all duration-200 text-left group`}
                >
                  <div className={`w-12 h-12 rounded-lg ${colors.iconBg} flex items-center justify-center mb-4`}>
                    <Icon className={`w-6 h-6 ${colors.icon}`} />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-800 mb-2 flex items-center gap-2">
                    {feature.title}
                    <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </h3>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    {feature.description}
                  </p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Key Highlights */}
        <div className="bg-white rounded-xl border border-slate-200 p-8">
          <h2 className="text-xl font-semibold text-slate-800 mb-6">Key Capabilities</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {highlights.map((highlight, index) => {
              const Icon = highlight.icon;
              return (
                <div key={index} className="flex gap-4">
                  <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0">
                    <Icon className="w-5 h-5 text-slate-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-800 mb-1">{highlight.title}</h3>
                    <p className="text-sm text-slate-600">{highlight.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* System Architecture */}
        <div className="mt-8 bg-white rounded-xl border border-slate-200 p-8">
          <h2 className="text-xl font-semibold text-slate-800 mb-4">System Architecture</h2>
          <p className="text-slate-600 mb-6">
            This tool acts as a visibility and readiness layer, pulling item identity from PLM and activation state from ERP.
          </p>
          <div className="grid grid-cols-3 gap-6">
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <h4 className="font-semibold text-blue-800 mb-2">PLM (PD Cloud)</h4>
              <p className="text-sm text-blue-700">System of record for item identity, design status, BOM structure</p>
            </div>
            <div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
              <h4 className="font-semibold text-amber-800 mb-2">BOM Convergence Grid</h4>
              <p className="text-sm text-amber-700">Visibility and readiness tracking layer (NOT a system of record)</p>
            </div>
            <div className="p-4 bg-emerald-50 rounded-lg border border-emerald-200">
              <h4 className="font-semibold text-emerald-800 mb-2">ERP (Alice)</h4>
              <p className="text-sm text-emerald-700">System of record for activation state, supplier setup, orderability</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-sm text-slate-500">
          <p>Last Updated: February 2026 • Version V23 • Production Ready</p>
        </div>
      </div>
    </div>
  );
};

export default WelcomePage;
