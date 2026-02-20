import React from 'react';
import { LayoutGrid, ClipboardCheck, BarChart3, ArrowRight, Layers, Target, Users, Sparkles, Zap, Shield } from 'lucide-react';

const WelcomePage = ({ onNavigateToBOMGrid, onNavigateToCOReview, onNavigateToPMDashboard }) => {
  const features = [
    {
      id: 'bom-grid',
      title: 'BOM Grid',
      description: 'View and manage Bill of Materials with hierarchical structure, multi-dimensional readiness tracking, and cross-functional visibility.',
      icon: LayoutGrid,
      gradient: 'from-blue-500 to-cyan-500',
      bgGradient: 'from-blue-50 to-cyan-50',
      borderColor: 'border-blue-200',
      onClick: onNavigateToBOMGrid,
    },
    {
      id: 'co-readiness',
      title: 'CO Readiness Review',
      description: 'Track engineering change order readiness, identify blockers, and monitor item progression through lifecycle stages.',
      icon: ClipboardCheck,
      gradient: 'from-emerald-500 to-teal-500',
      bgGradient: 'from-emerald-50 to-teal-50',
      borderColor: 'border-emerald-200',
      onClick: onNavigateToCOReview,
    },
    {
      id: 'pm-dashboard',
      title: 'PM Dashboard',
      description: 'Visual analytics dashboard for project managers with KPIs, timeline tracking, and activation funnel metrics.',
      icon: BarChart3,
      gradient: 'from-purple-500 to-pink-500',
      bgGradient: 'from-purple-50 to-pink-50',
      borderColor: 'border-purple-200',
      onClick: onNavigateToPMDashboard,
    },
  ];

  const highlights = [
    {
      icon: Layers,
      title: '40+ Data Fields',
      description: 'Comprehensive item attributes across design, procurement, manufacturing, and quality.',
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
    {
      icon: Target,
      title: '24 Functional Requirements',
      description: '100% FR compliance with complete readiness tracking and lifecycle visibility.',
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-100',
    },
    {
      icon: Users,
      title: 'Role-Based Views',
      description: 'Engineering, Procurement, PM, and AME views with tailored column visibility.',
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
      {/* Hero Section */}
      <div className="hero-gradient text-white relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500/20 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-500/20 rounded-full blur-3xl"></div>
        </div>
        
        <div className="max-w-6xl mx-auto px-8 py-20 relative z-10">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full border border-white/10 mb-6">
              <Sparkles className="w-4 h-4 text-yellow-400" />
              <span className="text-sm font-medium text-white/90">Enterprise Edition V23</span>
            </div>
            
            <h1 className="text-5xl font-bold mb-6 bg-gradient-to-r from-white via-blue-100 to-purple-200 bg-clip-text text-transparent" data-testid="welcome-title">
              Enterprise BOM Convergence Grid
            </h1>
            <p className="text-xl text-slate-300 max-w-3xl mx-auto leading-relaxed">
              A comprehensive visibility and readiness tracking layer for Bill of Materials management, 
              engineering change orders, and cross-functional collaboration.
            </p>
            
            <div className="flex items-center justify-center gap-4 mt-10">
              <span className="px-4 py-2 bg-emerald-500/20 text-emerald-300 rounded-full text-sm font-semibold border border-emerald-500/30 shadow-lg shadow-emerald-500/10">
                <Zap className="w-3.5 h-3.5 inline mr-1.5" />
                Production Ready
              </span>
              <span className="px-4 py-2 bg-blue-500/20 text-blue-300 rounded-full text-sm font-semibold border border-blue-500/30 shadow-lg shadow-blue-500/10">
                <Shield className="w-3.5 h-3.5 inline mr-1.5" />
                FR Compliance: 24/24
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-8 py-16">
        {/* Quick Start Cards */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold text-slate-800 mb-8">Quick Start</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {features.map((feature) => {
              const Icon = feature.icon;
              
              return (
                <button
                  key={feature.id}
                  onClick={feature.onClick}
                  data-testid={`welcome-${feature.id}-btn`}
                  className={`card-modern p-8 text-left group bg-gradient-to-br ${feature.bgGradient} border-2 ${feature.borderColor} hover:border-opacity-60`}
                >
                  <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                    <Icon className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-800 mb-3 flex items-center gap-2">
                    {feature.title}
                    <ArrowRight className="w-5 h-5 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-300" />
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
        <div className="card-elevated p-10 mb-12">
          <h2 className="text-xl font-bold text-slate-800 mb-8">Key Capabilities</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {highlights.map((highlight, index) => {
              const Icon = highlight.icon;
              return (
                <div key={index} className="flex gap-5">
                  <div className={`w-12 h-12 rounded-xl ${highlight.bgColor} flex items-center justify-center flex-shrink-0 shadow-sm`}>
                    <Icon className={`w-6 h-6 ${highlight.color}`} />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-800 mb-2">{highlight.title}</h3>
                    <p className="text-sm text-slate-600 leading-relaxed">{highlight.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* System Architecture */}
        <div className="card-elevated p-10">
          <h2 className="text-xl font-bold text-slate-800 mb-6">System Architecture</h2>
          <p className="text-slate-600 mb-8">
            This tool acts as a visibility and readiness layer, pulling item identity from PLM and activation state from ERP.
          </p>
          <div className="grid grid-cols-3 gap-6">
            <div className="p-6 bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl border border-blue-200 shadow-sm">
              <div className="w-10 h-10 rounded-xl bg-blue-500 flex items-center justify-center mb-4 shadow-lg shadow-blue-500/30">
                <Layers className="w-5 h-5 text-white" />
              </div>
              <h4 className="font-bold text-blue-900 mb-2">PLM (PD Cloud)</h4>
              <p className="text-sm text-blue-700">System of record for item identity, design status, BOM structure</p>
            </div>
            <div className="p-6 bg-gradient-to-br from-amber-50 to-orange-100 rounded-2xl border border-amber-200 shadow-sm">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center mb-4 shadow-lg shadow-amber-500/30">
                <LayoutGrid className="w-5 h-5 text-white" />
              </div>
              <h4 className="font-bold text-amber-900 mb-2">BOM Convergence Grid</h4>
              <p className="text-sm text-amber-700">Visibility and readiness tracking layer (NOT a system of record)</p>
            </div>
            <div className="p-6 bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-2xl border border-emerald-200 shadow-sm">
              <div className="w-10 h-10 rounded-xl bg-emerald-500 flex items-center justify-center mb-4 shadow-lg shadow-emerald-500/30">
                <Target className="w-5 h-5 text-white" />
              </div>
              <h4 className="font-bold text-emerald-900 mb-2">ERP (Alice)</h4>
              <p className="text-sm text-emerald-700">System of record for activation state, supplier setup, orderability</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-12 text-center text-sm text-slate-500">
          <p>Last Updated: February 2026 • Version V23 • Production Ready</p>
        </div>
      </div>
    </div>
  );
};

export default WelcomePage;
