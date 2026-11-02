import React, { useEffect, useRef, useState } from 'react';
import {
  LayoutDashboard, Users, FileText, Stethoscope, Calendar, BedDouble,
  FlaskConical, ScanLine, Bone, Scissors, AlertTriangle, IndianRupee,
  Shield, Pill, BarChart3, Settings, LogOut, Menu, X, MapPin, Phone,
  Database, RefreshCw, Smartphone, CheckCircle2
} from 'lucide-react';
import { api, getAuthToken, setAuthToken } from './services/api';
import { DashboardSummary, Doctor, Patient, SyncStatus, UserAccount, UserRole } from './types/hms';
import { LoginPage } from './components/LoginPage';
import { OwnerDashboard } from './components/OwnerDashboard';
import { PatientModule } from './components/PatientModule';
import {
  EmrModule, DoctorModule, AppointmentModule,
  OrthopaedicModule, SurgeryModule, EmergencyModule
} from './components/ClinicalModules';
import {
  AdmissionBedModule, LabReportModule, ImagingModule,
  BillingModule, PharmacyModule
} from './components/OperationsModules';
import {
  StaffUserModule, OnboardingImportExportModule, AnalyticsModule, AuditSettingsModule
} from './components/AdminAnalyticsModules';

interface NavItem {
  id: string;
  label: string;
  icon: any;
  allowedRoles: UserRole[];
}

const ALL_ROLES: UserRole[] = ['OWNER', 'ADMIN', 'DOCTOR', 'NURSE', 'RECEPTIONIST', 'LAB_TECH', 'BILLING'];

const NAV_ITEMS: NavItem[] = [
  { id: 'dashboard', label: '1. Owner Dashboard', icon: LayoutDashboard, allowedRoles: ALL_ROLES },
  { id: 'patients', label: '2. Patients & 360° Profiles', icon: Users, allowedRoles: ['OWNER', 'ADMIN', 'DOCTOR', 'NURSE', 'RECEPTIONIST', 'BILLING'] },
  { id: 'emr', label: '3. Electronic Medical Records', icon: FileText, allowedRoles: ['OWNER', 'ADMIN', 'DOCTOR', 'NURSE'] },
  { id: 'doctors', label: '4. Doctor Management', icon: Stethoscope, allowedRoles: ALL_ROLES },
  { id: 'appointments', label: '5. Appointment Management', icon: Calendar, allowedRoles: ['OWNER', 'ADMIN', 'DOCTOR', 'NURSE', 'RECEPTIONIST'] },
  { id: 'admissions', label: '6 & 7. Admissions, Wards & Beds', icon: BedDouble, allowedRoles: ['OWNER', 'ADMIN', 'DOCTOR', 'NURSE', 'RECEPTIONIST'] },
  { id: 'lab', label: '8. Lab & Blood Reports', icon: FlaskConical, allowedRoles: ['OWNER', 'ADMIN', 'DOCTOR', 'NURSE', 'LAB_TECH'] },
  { id: 'imaging', label: '9. Diagnostic Imaging', icon: ScanLine, allowedRoles: ['OWNER', 'ADMIN', 'DOCTOR', 'NURSE', 'LAB_TECH'] },
  { id: 'ortho', label: '10. Orthopaedic Department', icon: Bone, allowedRoles: ['OWNER', 'ADMIN', 'DOCTOR', 'NURSE'] },
  { id: 'surgeries', label: '11. Surgeries & Anaesthesia', icon: Scissors, allowedRoles: ['OWNER', 'ADMIN', 'DOCTOR', 'NURSE'] },
  { id: 'emergency', label: '12. Emergency & Trauma', icon: AlertTriangle, allowedRoles: ['OWNER', 'ADMIN', 'DOCTOR', 'NURSE', 'RECEPTIONIST'] },
  { id: 'billing', label: '13. Billing & Payments', icon: IndianRupee, allowedRoles: ['OWNER', 'ADMIN', 'BILLING', 'RECEPTIONIST'] },
  { id: 'staff', label: '14. Staff & User Roles', icon: Shield, allowedRoles: ['OWNER', 'ADMIN'] },
  { id: 'pharmacy', label: '15. Pharmacy & Implants', icon: Pill, allowedRoles: ['OWNER', 'ADMIN', 'DOCTOR', 'NURSE', 'BILLING'] },
  { id: 'analytics', label: '16. Reports & Analytics', icon: BarChart3, allowedRoles: ['OWNER', 'ADMIN', 'BILLING'] },
  { id: 'settings', label: '17. Audit Logs & Settings', icon: Settings, allowedRoles: ['OWNER', 'ADMIN'] },
  { id: 'onboarding', label: '18. Onboarding, Import & Export', icon: Database, allowedRoles: ['OWNER', 'ADMIN', 'RECEPTIONIST'] },
];

export function App() {
  const [currentUser, setCurrentUser] = useState<UserAccount | null>(null);
  const [activeModule, setActiveModule] = useState<string>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [syncStatus, setSyncStatus] = useState<SyncStatus | null>(null);
  const [lastSyncedLocal, setLastSyncedLocal] = useState<string>('');
  const [pwaPrompt, setPwaPrompt] = useState<any>(null);
  const [showPwaModal, setShowPwaModal] = useState<boolean>(false);
  const lastWatermarkRef = useRef<number>(0);

  const loadCoreData = async () => {
    try {
      const [sumData, patList, docList, syncData] = await Promise.all([
        api.get<DashboardSummary>('/dashboard/summary'),
        api.get<Patient[]>('/patients'),
        api.get<Doctor[]>('/doctors'),
        api.get<SyncStatus>('/sync/status'),
      ]);
      setSummary(sumData);
      setPatients(patList);
      setDoctors(docList);
      setSyncStatus(syncData);
      lastWatermarkRef.current = syncData.watermarkId;
      setLastSyncedLocal(new Date().toLocaleTimeString());
    } catch (err) {
      console.error('Failed to load hospital data', err);
    }
  };

  useEffect(() => {
    const handler = (e: any) => {
      e.preventDefault();
      setPwaPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  useEffect(() => {
    const token = getAuthToken();
    if (token) {
      api.get<UserAccount>('/auth/me')
        .then((u) => {
          setCurrentUser(u);
          loadCoreData();
        })
        .catch(() => {
          setAuthToken(null);
          setCurrentUser(null);
        });
    }
  }, []);

  // Multi-Device Real-Time Cloud Synchronization Heartbeat (Polls every 10s)
  useEffect(() => {
    if (!currentUser) return;
    const interval = setInterval(async () => {
      try {
        const s = await api.get<SyncStatus>('/sync/status');
        setSyncStatus(s);
        setLastSyncedLocal(new Date().toLocaleTimeString());
        if (s.watermarkId !== lastWatermarkRef.current) {
          lastWatermarkRef.current = s.watermarkId;
          loadCoreData();
        }
      } catch {
        // Ignore transient network hiccups
      }
    }, 10000);
    return () => clearInterval(interval);
  }, [currentUser]);

  const handleInstallPwa = async () => {
    if (pwaPrompt) {
      pwaPrompt.prompt();
      await pwaPrompt.userChoice;
      setPwaPrompt(null);
    } else {
      setShowPwaModal(true);
    }
  };

  const handleLoginSuccess = (user: UserAccount) => {
    setCurrentUser(user);
    setActiveModule('dashboard');
    loadCoreData();
  };

  const handleLogout = () => {
    setAuthToken(null);
    setCurrentUser(null);
  };

  if (!currentUser) {
    return <LoginPage onLoginSuccess={handleLoginSuccess} />;
  }

  const visibleNav = NAV_ITEMS.filter((item) => item.allowedRoles.includes(currentUser.role));

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-slate-900/50 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Left Sidebar Navigation */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-40 w-72 bg-slate-900 text-white flex flex-col justify-between transition-transform duration-200 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="p-5 border-b border-slate-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-teal-500/20 border border-teal-400/40 flex items-center justify-center">
                <Stethoscope className="w-6 h-6 text-teal-300" />
              </div>
              <div>
                <h1 className="text-sm font-extrabold tracking-tight text-white">
                  MAHALAKSHMI HOSPITAL
                </h1>
                <span className="text-[11px] text-teal-300 block">
                  R.R.Pet Main Road, Eluru
                </span>
              </div>
            </div>
            <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-slate-400">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 overflow-y-auto p-3 space-y-1">
          {visibleNav.map((item) => {
            const Icon = item.icon;
            const active = activeModule === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveModule(item.id);
                  setSidebarOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
                  active
                    ? 'bg-gradient-to-r from-teal-600 to-sky-600 text-white shadow-md'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span className="truncate">{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Logged-in User Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/60">
          <div className="flex items-center justify-between">
            <div className="truncate pr-2">
              <div className="text-xs font-bold text-white truncate">{currentUser.fullName}</div>
              <div className="text-[11px] text-teal-400 font-semibold">
                Role: {currentUser.role} (@{currentUser.username})
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="p-2 rounded-xl bg-rose-500/20 hover:bg-rose-600 text-rose-300 hover:text-white transition cursor-pointer"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Hospital Header Bar */}
        <header className="bg-white border-b border-slate-200 px-4 md:px-6 py-3 flex flex-wrap items-center justify-between gap-3 sticky top-0 z-20">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-xl border border-slate-200 text-slate-700"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-base font-extrabold text-slate-900">
                  {summary?.hospitalSettings?.hospitalName || 'MAHALAKSHMI HOSPITAL'}
                </span>
                <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <CheckCircle2 className="w-3 h-3" /> Cloud DB Live Sync ({lastSyncedLocal || 'Active'})
                </span>
              </div>
              <div className="text-[11px] text-slate-500 flex flex-wrap items-center gap-3">
                <span className="flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-teal-600" />
                  Kasturivari Street, R.R.Pet Main Road, Eluru, AP 534002
                </span>
                {syncStatus && (
                  <span className="hidden xl:inline text-teal-700 font-medium">
                    • Latest Activity: {syncStatus.lastChangeAction} by @{syncStatus.lastChangeBy}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={loadCoreData}
              className="px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-teal-50 text-slate-700 hover:text-teal-800 text-xs font-semibold flex items-center gap-1 cursor-pointer"
              title="Synchronize with Central PostgreSQL Database"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Sync Now
            </button>
            <button
              onClick={handleInstallPwa}
              className="px-3 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm cursor-pointer"
            >
              <Smartphone className="w-3.5 h-3.5" /> Install App (PWA)
            </button>
            <span className="hidden md:inline-block px-3 py-1.5 rounded-xl bg-slate-100 text-slate-800 text-xs font-semibold">
              {currentUser.designation || currentUser.role}
            </span>
            <button
              onClick={handleLogout}
              className="px-3 py-1.5 rounded-xl border border-slate-300 hover:bg-rose-50 hover:text-rose-700 text-xs font-semibold cursor-pointer"
            >
              Sign Out
            </button>
          </div>
        </header>

        {/* Active Module Workspace */}
        <main className="flex-1 p-4 md:p-6 max-w-[1600px] w-full mx-auto">
          {activeModule === 'dashboard' && (
            <OwnerDashboard
              summary={summary}
              onNavigate={(mod) => setActiveModule(mod === 'beds' ? 'admissions' : mod)}
              onRefresh={loadCoreData}
            />
          )}

          {activeModule === 'patients' && (
            <PatientModule
              doctors={doctors}
              onDataChange={loadCoreData}
              onNavigateModule={(mod) => setActiveModule(mod)}
            />
          )}

          {activeModule === 'emr' && (
            <EmrModule patients={patients} doctors={doctors} onRefreshGlobal={loadCoreData} />
          )}

          {activeModule === 'doctors' && (
            <DoctorModule onRefreshGlobal={loadCoreData} />
          )}

          {activeModule === 'appointments' && (
            <AppointmentModule patients={patients} doctors={doctors} onRefreshGlobal={loadCoreData} />
          )}

          {(activeModule === 'admissions' || activeModule === 'beds') && (
            <AdmissionBedModule
              patients={patients}
              doctors={doctors}
              currentUser={currentUser}
              onRefreshGlobal={loadCoreData}
            />
          )}

          {activeModule === 'lab' && (
            <LabReportModule
              patients={patients}
              doctors={doctors}
              currentUser={currentUser}
              onRefreshGlobal={loadCoreData}
            />
          )}

          {activeModule === 'imaging' && (
            <ImagingModule
              patients={patients}
              doctors={doctors}
              currentUser={currentUser}
              onRefreshGlobal={loadCoreData}
            />
          )}

          {activeModule === 'ortho' && (
            <OrthopaedicModule patients={patients} doctors={doctors} onRefreshGlobal={loadCoreData} />
          )}

          {activeModule === 'surgeries' && (
            <SurgeryModule patients={patients} doctors={doctors} onRefreshGlobal={loadCoreData} />
          )}

          {activeModule === 'emergency' && (
            <EmergencyModule patients={patients} doctors={doctors} onRefreshGlobal={loadCoreData} />
          )}

          {activeModule === 'billing' && (
            <BillingModule
              patients={patients}
              doctors={doctors}
              currentUser={currentUser}
              onRefreshGlobal={loadCoreData}
            />
          )}

          {activeModule === 'staff' && (
            <StaffUserModule onRefreshGlobal={loadCoreData} />
          )}

          {activeModule === 'pharmacy' && (
            <PharmacyModule onRefreshGlobal={loadCoreData} />
          )}

          {activeModule === 'analytics' && (
            <AnalyticsModule summary={summary} />
          )}

          {activeModule === 'settings' && (
            <AuditSettingsModule onRefreshGlobal={loadCoreData} />
          )}

          {activeModule === 'onboarding' && (
            <OnboardingImportExportModule onRefreshGlobal={loadCoreData} />
          )}
        </main>
      </div>

      {/* Multi-Device PWA Installation Instructions Modal */}
      {showPwaModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex justify-between items-center pb-3 border-b">
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Smartphone className="w-5 h-5 text-teal-600" /> Install Mahalakshmi HMS Across All Devices
              </h3>
              <button onClick={() => setShowPwaModal(false)} className="cursor-pointer"><X className="w-5 h-5" /></button>
            </div>
            <div className="space-y-3 text-xs text-slate-700">
              <div className="p-3 rounded-xl bg-teal-50 border border-teal-200">
                <strong>Windows PC / MacBook (Chrome or Edge):</strong>
                <p className="mt-0.5">Click the <strong>Install Mahalakshmi HMS</strong> icon in the right side of your browser address bar to install as a standalone desktop app.</p>
              </div>
              <div className="p-3 rounded-xl bg-sky-50 border border-sky-200">
                <strong>Android Smartphones & Tablets (Chrome):</strong>
                <p className="mt-0.5">Tap the browser menu (⋮) and select <strong>"Install app"</strong> or <strong>"Add to Home screen"</strong>.</p>
              </div>
              <div className="p-3 rounded-xl bg-indigo-50 border border-indigo-200">
                <strong>iPhone & iPad (Safari):</strong>
                <p className="mt-0.5">Tap the <strong>Share</strong> button at the bottom of Safari and choose <strong>"Add to Home Screen"</strong>.</p>
              </div>
              <p className="text-[11px] text-slate-500">
                Security Notice: Patient clinical records are fetched live over encrypted connections and are never stored in browser localStorage or offline cache.
              </p>
            </div>
            <div className="flex justify-end">
              <button onClick={() => setShowPwaModal(false)} className="px-4 py-2 rounded-xl bg-teal-600 text-white text-xs font-semibold cursor-pointer">
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
