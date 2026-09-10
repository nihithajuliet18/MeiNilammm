import React, { useState, useEffect } from 'react';
import { LanguageProvider, useLanguage } from './context/LanguageContext';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Header } from './components/Header';
import { Sidebar, ActiveView } from './components/Sidebar';
import { DashboardView } from './components/DashboardView';
import { CaseWorkspaceView } from './components/CaseWorkspaceView';
import { ApplicationIntakeWizard } from './components/ApplicationIntakeWizard';
import { AdminSettingsView } from './components/AdminSettingsView';
import { AuditReportView } from './components/AuditReportView';
import { AuthModal } from './components/AuthModal';
import { MapComponent } from './components/MapComponent';
import { RealTimeUploadCenter } from './components/RealTimeUploadCenter';
import { RealTimeUploadModal } from './components/RealTimeUploadModal';
import { FmbStudioView } from './components/FmbStudioView';
import { VideoLandingPage } from './components/VideoLandingPage';
import { motion, AnimatePresence } from 'motion/react';
import { Application, ParcelModel } from './types';
import {
  FileText,
  AlertTriangle,
  CheckCircle2,
  MapPin,
  Upload,
  RefreshCw,
  Plus,
  Layers,
  ArrowRight,
  Search,
} from 'lucide-react';

const MainApp: React.FC = () => {
  const { t } = useLanguage();
  const { user } = useAuth();
  const [activeView, setActiveView] = useState<ActiveView>('dashboard');
  const [applications, setApplications] = useState<Application[]>([]);
  const [selectedAppId, setSelectedAppId] = useState<string | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [selectedMapParcel, setSelectedMapParcel] = useState<ParcelModel | null>(null);
  const [allParcels, setAllParcels] = useState<ParcelModel[]>([]);
  const [isGlobalUploadModalOpen, setIsGlobalUploadModalOpen] = useState<boolean>(false);
  const [showLanding, setShowLanding] = useState<boolean>(false);

  const handleEnterFromLanding = (scenarioId?: number) => {
    setShowLanding(false);
    if (scenarioId) {
      handleSelectScenario(scenarioId);
    }
  };

  // Fetch all applications
  const fetchApplications = async () => {
    try {
      const res = await fetch('/api/applications');
      const contentType = res.headers.get('content-type');
      if (res.ok && contentType && contentType.includes('application/json')) {
        const data = await res.json();
        setApplications(data);
        if (data.length > 0 && !selectedAppId) {
          setSelectedAppId(data[0].id);
        }
      }
    } catch (err) {
      console.error('Failed to load applications:', err);
    }
  };

  // Fetch all parcels for GIS map workspace
  const fetchParcels = async () => {
    try {
      const res = await fetch('/api/parcels');
      const contentType = res.headers.get('content-type');
      if (res.ok && contentType && contentType.includes('application/json')) {
        const data = await res.json();
        setAllParcels(data);
        if (data.length > 0 && !selectedMapParcel) {
          setSelectedMapParcel(data[0]);
        }
      }
    } catch (err) {
      console.error('Failed to load parcels:', err);
    }
  };

  useEffect(() => {
    fetchApplications();
    fetchParcels();
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleSelectApplication = (id: string) => {
    setSelectedAppId(id);
    setActiveView('case_workspace');
  };

  const handleSelectScenario = (scenarioId: number) => {
    const matched = applications.find((a) => a.demoScenarioId === scenarioId);
    if (matched) {
      setSelectedAppId(matched.id);
      setActiveView('case_workspace');
    }
  };

  const handleRunVerification = async (appId: string) => {
    try {
      showToast('Executing deterministic 14-rule verification engine...');
      const res = await fetch(`/api/applications/${appId}/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          officerName: user?.name,
          officerRole: user?.role,
          officerDepartment: user?.department,
        }),
      });
      if (res.ok) {
        showToast('Automated verification completed! Case updated.');
        await fetchApplications();
        setSelectedAppId(appId);
        setActiveView('case_workspace');
      }
    } catch (e) {
      console.error('Verification failed:', e);
    }
  };

  const handleResetDemo = async () => {
    try {
      const res = await fetch('/api/reset-demo', { method: 'POST' });
      if (res.ok) {
        showToast('All 5 demonstration scenarios reset to baseline.');
        await fetchApplications();
        await fetchParcels();
        setActiveView('dashboard');
      }
    } catch (e) {
      console.error('Reset failed:', e);
    }
  };

  const reviewCount = applications.filter((a) => a.status === 'Review Required').length;
  const fieldTaskCount = applications.filter(
    (a) => a.status === 'Field Verification Assigned'
  ).length;

  return (
    <div className="min-h-screen bg-slate-100/60 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors">
      {/* Full-Screen Video Landing Page Gateway */}
      <AnimatePresence>
        {showLanding && (
          <motion.div
            key="meinilam-video-landing-overlay"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 1.02 }}
            transition={{ duration: 0.5, ease: 'easeInOut' }}
            className="fixed inset-0 z-50 overflow-hidden"
          >
            <VideoLandingPage onEnter={handleEnterFromLanding} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 bg-emerald-800 text-white px-4 py-3 rounded-lg shadow-xl text-xs font-semibold flex items-center space-x-2 animate-in fade-in slide-in-from-top-3">
          <CheckCircle2 className="w-4 h-4 text-emerald-300 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Global Header */}
      <Header
        onOpenAuthModal={() => setIsAuthModalOpen(true)}
        onResetDemo={handleResetDemo}
        onSelectScenario={handleSelectScenario}
        onOpenRealTimeUpload={() => setIsGlobalUploadModalOpen(true)}
        onOpenLanding={() => setShowLanding(true)}
      />

      {/* Main Container Layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Navigation Sidebar */}
        <Sidebar
          activeView={activeView}
          onNavigate={(view) => setActiveView(view)}
          onResetDemo={handleResetDemo}
          reviewRequiredCount={reviewCount}
          fieldTaskCount={fieldTaskCount}
          onOpenLanding={() => setShowLanding(true)}
        />

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          {/* Dashboard View */}
          {activeView === 'dashboard' && (
            <DashboardView
              applications={applications}
              onSelectApplication={handleSelectApplication}
              onSelectScenario={handleSelectScenario}
              onNavigateToIntake={() => setActiveView('application_new')}
              onRunVerification={handleRunVerification}
              onNavigate={(v) => setActiveView(v)}
              onResetDemo={handleResetDemo}
              onRefresh={fetchApplications}
            />
          )}

          {/* Intake Wizard */}
          {activeView === 'application_new' && (
            <ApplicationIntakeWizard
              onCancel={() => setActiveView('dashboard')}
              onSuccess={(newId) => {
                showToast('Application registered successfully!');
                fetchApplications();
                setSelectedAppId(newId);
                setActiveView('case_workspace');
              }}
            />
          )}

          {/* Deep Case Workspace View */}
          {activeView === 'case_workspace' && selectedAppId && (
            <CaseWorkspaceView
              applicationId={selectedAppId}
              onBack={() => setActiveView('dashboard')}
              onRunVerification={handleRunVerification}
            />
          )}

          {/* All Applications List */}
          {activeView === 'applications_all' && (
            <div className="space-y-4">
              <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                <div>
                  <h1 className="text-lg font-bold text-slate-900 dark:text-white">
                    All Registered Land Applications ({applications.length})
                  </h1>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Comprehensive register across Patta transfers, layout approvals, and subdivision requests
                  </p>
                </div>
                <button
                  onClick={() => setActiveView('application_new')}
                  className="px-3 py-1.5 rounded-lg bg-emerald-700 text-white text-xs font-semibold hover:bg-emerald-800 flex items-center space-x-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>New Application</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {applications.map((app) => (
                  <div
                    key={app.id}
                    onClick={() => handleSelectApplication(app.id)}
                    className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-emerald-500 dark:hover:border-emerald-500 cursor-pointer shadow-2xs transition-all flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-xs font-bold text-emerald-700 dark:text-emerald-400">
                          {app.applicationNumber}
                        </span>
                        <span
                          className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                            app.status === 'Review Required'
                              ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                              : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                          }`}
                        >
                          {app.status}
                        </span>
                      </div>

                      <h3 className="text-xs font-bold text-slate-900 dark:text-white mt-2">
                        {app.applicantName}
                      </h3>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">
                        Sy. {app.surveyNumber}/{app.subdivision} • Patta #{app.pattaNumber}
                      </p>
                      <p className="text-[10px] text-slate-400 mt-1">
                        {app.village}, {app.taluk}
                      </p>
                    </div>

                    <div className="mt-3 pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-emerald-700 dark:text-emerald-400 font-semibold">
                      <span>Open Workspace</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Maps Workspace */}
          {activeView === 'maps_workspace' && (
            <div className="space-y-4">
              <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h1 className="text-lg font-bold text-slate-900 dark:text-white flex items-center space-x-2">
                    <MapPin className="w-5 h-5 text-emerald-600" />
                    <span>Cadastral GIS & Multi-source Geospatial Harmonization</span>
                  </h1>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    MapLibre GL JS • Vector FMB, Town Survey Land Records (TSLR), and boundary overlays
                  </p>
                </div>

                {allParcels.length > 0 && (
                  <div className="flex items-center space-x-2">
                    <span className="text-xs text-slate-500">Select Parcel:</span>
                    <select
                      value={selectedMapParcel?.id || ''}
                      onChange={(e) => {
                        const found = allParcels.find((p) => p.id === e.target.value);
                        if (found) setSelectedMapParcel(found);
                      }}
                      className="p-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-mono"
                    >
                      {allParcels.map((p) => (
                        <option key={p.id} value={p.id}>
                          Sy. {p.surveyNumber}/{p.subdivision} ({p.village})
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 h-[600px] overflow-hidden">
                <MapComponent parcel={selectedMapParcel || undefined} />
              </div>
            </div>
          )}

          {/* Document Upload / Review */}
          {(activeView === 'documents_upload' || activeView === 'documents_review') && (
            <RealTimeUploadCenter
              applications={applications}
              initialApplicationId={selectedAppId || undefined}
              onSelectApplication={handleSelectApplication}
              onNavigateToWorkspace={(id) => {
                setSelectedAppId(id);
                setActiveView('case_workspace');
              }}
              onRunVerification={handleRunVerification}
            />
          )}

          {/* FMB (Field Measurement Book) Cadastral Vision Studio */}
          {activeView === 'fmb_studio' && (
            <FmbStudioView
              applications={applications}
              initialApplicationId={selectedAppId || undefined}
              onNavigateToCase={(id) => {
                setSelectedAppId(id);
                setActiveView('case_workspace');
              }}
            />
          )}

          {/* Verification Matrix Direct Tab */}
          {activeView === 'verification_matrix' && (
            <div className="space-y-4">
              <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800">
                <h1 className="text-lg font-bold text-slate-900 dark:text-white">
                  Deterministic 14-Rule Verification Suite
                </h1>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Full statutory rule check across all 14 categories. Select an application to evaluate live findings.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[
                  {
                    num: '01',
                    name: 'Survey & Subdivision Match',
                    cat: 'Concordance',
                    desc: 'Cross-checks survey numbers and subdivision letters across deed, patta, and A-Register.',
                  },
                  {
                    num: '02',
                    name: 'Administrative Hierarchy',
                    cat: 'Jurisdiction',
                    desc: 'Verifies District, Taluk, Revenue Village, and Town/Ward/Block against authoritative master data.',
                  },
                  {
                    num: '03',
                    name: 'Extent Harmonization & Tolerance',
                    cat: 'Geometry',
                    desc: 'Converts legacy units (Cents, Grounds, Sq.Ft) to Sq.M with 0.5% rural / 0.1% urban tolerance.',
                  },
                  {
                    num: '04',
                    name: 'Document Completeness Checklist',
                    cat: 'Prerequisites',
                    desc: 'Flags missing prerequisite documents based on transaction type (e.g. partition deed, legal heir cert).',
                  },
                  {
                    num: '05',
                    name: 'Title Party & Identity Linkage',
                    cat: 'Title Flow',
                    desc: 'Traces vendor in current deed to purchaser in parent deed with initial/alias resolution.',
                  },
                  {
                    num: '06',
                    name: 'Encumbrance Coverage Verification',
                    cat: 'Legal',
                    desc: 'Verifies continuous uninterrupted EC search coverage spanning minimum 30 years.',
                  },
                  {
                    num: '07',
                    name: 'Duplicate Application Guard',
                    cat: 'Fraud Prevention',
                    desc: 'Checks for overlapping active filings across adjacent sub-registries on the same parcel.',
                  },
                  {
                    num: '08',
                    name: 'Boundary Concordance (Four Boundaries)',
                    cat: 'Cadastral',
                    desc: 'Compares North, South, East, West boundaries in deed against FMB field measurement book.',
                  },
                  {
                    num: '09',
                    name: 'Government Land Encroachment Check',
                    cat: 'Public Assets',
                    desc: 'Cross-checks adjacency to water bodies, poramboke, forest reserve, or temple lands.',
                  },
                  {
                    num: '10',
                    name: 'Field Verification Trigger Logic',
                    cat: 'Ground Survey',
                    desc: 'Automatically assigns DGPS field inspection when mapped vs documented extent exceeds 2%.',
                  },
                ].map((rule) => (
                  <div
                    key={rule.num}
                    className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs space-y-1.5"
                  >
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-mono font-bold text-emerald-700 dark:text-emerald-400">
                        Rule #{rule.num}
                      </span>
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                        {rule.cat}
                      </span>
                    </div>
                    <h3 className="text-xs font-bold text-slate-900 dark:text-white mt-1">
                      {rule.name}
                    </h3>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                      {rule.desc}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Field Inspection View */}
          {activeView === 'field_inspection' && (
            <div className="space-y-4">
              <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800">
                <h1 className="text-lg font-bold text-slate-900 dark:text-white">
                  Field Inspection & DGPS Verification Tasks
                </h1>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Ground measurements, Total Station traverses, and geotagged photographic evidence
                </p>
              </div>

              <div className="p-8 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 text-center space-y-3">
                <MapPin className="w-8 h-8 text-amber-600 mx-auto" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Active Field Survey Tasks Available in Scenario 3 & 4
                </h3>
                <p className="text-xs text-slate-500 max-w-md mx-auto">
                  Inspect ground survey records with Leica TS16 Total Station measurements and geotagged RTK GNSS boundary photographs inside the case workspace.
                </p>
                <button
                  onClick={() => handleSelectScenario(3)}
                  className="px-4 py-2 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold"
                >
                  Open Scenario 3 (Extent Deficit Field Inspection)
                </button>
              </div>
            </div>
          )}

          {/* Department Collaboration */}
          {activeView === 'collaboration' && (
            <div className="space-y-4">
              <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800">
                <h1 className="text-lg font-bold text-slate-900 dark:text-white">
                  Inter-Departmental Collaboration & Sharing Grants
                </h1>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Cross-agency sharing between Revenue, Registration (SRO), Town Planning (DTCP), and Survey
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2">
                  <h3 className="font-bold text-xs text-slate-900 dark:text-white">
                    Revenue & Registration Cross-Verification
                  </h3>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Automatically verifies presented sale deeds against electronic Patta extracts without requiring physical office paper transit.
                  </p>
                </div>

                <div className="p-5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2">
                  <h3 className="font-bold text-xs text-slate-900 dark:text-white">
                    DTCP / Planning Permission Verification
                  </h3>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Empowers town planning authorities to verify title chain and cadastral parcel boundaries prior to sanctioning building plans.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Reports & Benchmark View */}
          {activeView === 'reports_audit' && <AuditReportView />}

          {/* Admin & 30 Languages View */}
          {activeView === 'admin_settings' && (
            <AdminSettingsView onResetDemo={handleResetDemo} />
          )}
        </main>
      </div>

      {/* Auth / Role Switcher Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />

      {/* Global Real-Time Upload Modal */}
      <RealTimeUploadModal
        isOpen={isGlobalUploadModalOpen}
        onClose={() => setIsGlobalUploadModalOpen(false)}
        applications={applications}
        applicationId={selectedAppId || undefined}
        onUploadSuccess={(data) => {
          fetchApplications();
          if (data.document?.applicationId) {
            setSelectedAppId(data.document.applicationId);
            setActiveView('case_workspace');
          }
          showToast(`Document "${data.document?.fileName || 'Record'}" uploaded & parsed in real-time!`);
        }}
      />
    </div>
  );
};

export default function App() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <AuthProvider>
          <MainApp />
        </AuthProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
}
