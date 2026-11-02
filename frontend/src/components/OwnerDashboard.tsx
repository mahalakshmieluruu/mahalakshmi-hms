import React from 'react';
import {
  Users, CalendarCheck, BedDouble, AlertTriangle, FlaskConical, Scissors,
  IndianRupee, TrendingUp, UserCheck, Activity, ArrowUpRight, ShieldAlert,
  Building2, CheckCircle2, Clock
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts';
import { DashboardSummary, HOSPITAL_SERVICES } from '../types/hms';

interface OwnerDashboardProps {
  summary: DashboardSummary | null;
  onNavigate: (module: string) => void;
  onRefresh: () => void;
}

const CHART_COLORS = ['#0d9488', '#0284c7', '#6366f1', '#f59e0b', '#e11d48', '#10b981', '#8b5cf6'];

export const OwnerDashboard: React.FC<OwnerDashboardProps> = ({ summary, onNavigate, onRefresh }) => {
  if (!summary) {
    return (
      <div className="p-8 text-center text-slate-500">
        Loading live database metrics for Mahalakshmi Hospital...
      </div>
    );
  }

  const kpiCards = [
    {
      label: 'Total Registered Patients',
      value: summary.totalRegisteredPatients,
      sub: 'Permanent EMR Profiles',
      icon: Users,
      color: 'bg-teal-50 text-teal-700 border-teal-200',
      module: 'patients',
    },
    {
      label: "Today's Patient Visits",
      value: summary.todaysPatientVisits,
      sub: `${summary.todaysAppointments} OPD + Emergency`,
      icon: UserCheck,
      color: 'bg-sky-50 text-sky-700 border-sky-200',
      module: 'appointments',
    },
    {
      label: 'Currently Admitted (IPD)',
      value: summary.currentlyAdmittedPatients,
      sub: `${summary.dischargedPatients} Discharged Total`,
      icon: BedDouble,
      color: 'bg-indigo-50 text-indigo-700 border-indigo-200',
      module: 'admissions',
    },
    {
      label: 'Active Emergency Cases',
      value: summary.emergencyCases,
      sub: '24x7 Casualty & Trauma',
      icon: AlertTriangle,
      color: 'bg-rose-50 text-rose-700 border-rose-200',
      module: 'emergency',
    },
    {
      label: 'Available / Occupied Beds',
      value: `${summary.availableBeds} / ${summary.occupiedBeds}`,
      sub: `Total ${summary.totalBeds} Ward & ICU Beds`,
      icon: Building2,
      color: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      module: 'beds',
    },
    {
      label: "Today's Appointments",
      value: summary.todaysAppointments,
      sub: `${summary.totalDoctors} Specialist Doctors`,
      icon: CalendarCheck,
      color: 'bg-cyan-50 text-cyan-700 border-cyan-200',
      module: 'appointments',
    },
    {
      label: 'Pending Lab Reports',
      value: summary.pendingLabReports,
      sub: `${summary.verifiedLabReports} Verified Reports`,
      icon: FlaskConical,
      color: 'bg-amber-50 text-amber-700 border-amber-200',
      module: 'lab',
    },
    {
      label: 'Scheduled Surgeries (OT)',
      value: summary.scheduledSurgeries,
      sub: 'Modular Ortho, Spine & Keyhole OTs',
      icon: Scissors,
      color: 'bg-purple-50 text-purple-700 border-purple-200',
      module: 'surgeries',
    },
    {
      label: 'Daily Collections (Today)',
      value: `₹${summary.dailyCollections.toLocaleString('en-IN')}`,
      sub: 'Live Verified Receipts',
      icon: IndianRupee,
      color: 'bg-teal-50 text-teal-800 border-teal-200',
      module: 'billing',
    },
    {
      label: 'Monthly Revenue',
      value: `₹${summary.monthlyRevenue.toLocaleString('en-IN')}`,
      sub: 'Current Month Paid Total',
      icon: TrendingUp,
      color: 'bg-blue-50 text-blue-800 border-blue-200',
      module: 'billing',
    },
    {
      label: 'Outstanding Payments',
      value: `₹${summary.outstandingPayments.toLocaleString('en-IN')}`,
      sub: 'IPD & Surgery Balances Due',
      icon: Clock,
      color: 'bg-orange-50 text-orange-800 border-orange-200',
      module: 'billing',
    },
    {
      label: 'Discharged Patients',
      value: summary.dischargedPatients,
      sub: `${summary.totalImagingScans} Imaging Scans Completed`,
      icon: CheckCircle2,
      color: 'bg-slate-100 text-slate-800 border-slate-300',
      module: 'admissions',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Hospital Owner Banner */}
      <div className="bg-gradient-to-r from-teal-800 via-teal-700 to-sky-800 rounded-2xl p-6 text-white shadow-lg flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-teal-200 text-xs font-semibold uppercase tracking-wider">
            <Activity className="w-4 h-4" /> Real-Time Executive Command Centre
          </div>
          <h2 className="text-2xl font-extrabold mt-1">
            {summary.hospitalSettings?.hospitalName || 'MAHALAKSHMI HOSPITAL'} — Owner Dashboard
          </h2>
          <p className="text-sm text-teal-100 mt-0.5">
            {summary.hospitalSettings?.addressLine1}, {summary.hospitalSettings?.addressLine2}, {summary.hospitalSettings?.city}, {summary.hospitalSettings?.state} {summary.hospitalSettings?.pincode}
          </p>
          <div className="text-xs text-teal-200 mt-2 flex flex-wrap items-center gap-4">
            <span>Managing Director: <strong>{summary.hospitalSettings?.ownerName}</strong></span>
            <span>Database Engine: <strong>{summary.databaseEngine}</strong></span>
          </div>
        </div>
        <div className="flex flex-wrap gap-2.5">
          <button
            onClick={() => onNavigate('patients')}
            className="px-4 py-2.5 rounded-xl bg-white text-teal-900 font-semibold text-xs hover:bg-teal-50 transition shadow cursor-pointer"
          >
            + Register New Patient
          </button>
          <button
            onClick={() => onNavigate('settings')}
            className="px-4 py-2.5 rounded-xl bg-teal-950/60 border border-teal-400/40 text-white font-semibold text-xs hover:bg-teal-900 transition cursor-pointer"
          >
            Edit Hospital Profile & Settings
          </button>
          <button
            onClick={onRefresh}
            className="px-3.5 py-2.5 rounded-xl bg-white/15 hover:bg-white/25 text-white font-semibold text-xs transition cursor-pointer"
          >
            Refresh Live Data
          </button>
        </div>
      </div>

      {/* 12 Live KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpiCards.map((card) => {
          const Icon = card.icon;
          return (
            <button
              key={card.label}
              onClick={() => onNavigate(card.module)}
              className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-sm hover:shadow-md hover:border-teal-400 transition text-left flex items-start justify-between group cursor-pointer"
            >
              <div>
                <span className="text-xs font-semibold text-slate-500 block">{card.label}</span>
                <span className="text-2xl font-extrabold text-slate-900 mt-1 block">{card.value}</span>
                <span className="text-xs text-slate-500 mt-1 flex items-center gap-1 group-hover:text-teal-700">
                  {card.sub} <ArrowUpRight className="w-3 h-3 opacity-70" />
                </span>
              </div>
              <div className={`w-11 h-11 rounded-xl border flex items-center justify-center shrink-0 ${card.color}`}>
                <Icon className="w-5 h-5" />
              </div>
            </button>
          );
        })}
      </div>

      {/* Interactive Recharts Analytics Row */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Revenue & Outstanding by Billing Category */}
        <div className="lg:col-span-7 bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900">Department & Category Revenue vs. Outstanding (₹)</h3>
              <p className="text-xs text-slate-500">Live financial breakdown computed from hospital invoices</p>
            </div>
            <button
              onClick={() => onNavigate('billing')}
              className="text-xs font-semibold text-teal-700 hover:underline cursor-pointer"
            >
              Manage Billing →
            </button>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={summary.revenueChartData} margin={{ top: 10, right: 20, left: 10, bottom: 25 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="category" tick={{ fontSize: 11 }} angle={-12} textAnchor="end" />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip formatter={(val: any) => `₹${Number(val).toLocaleString('en-IN')}`} />
                <Legend />
                <Bar dataKey="collected" name="Collected Revenue (₹)" fill="#0d9488" radius={[6, 6, 0, 0]} />
                <Bar dataKey="outstanding" name="Outstanding Balance (₹)" fill="#f59e0b" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Orthopaedic & Service Distribution Pie Chart */}
        <div className="lg:col-span-5 bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900">Service & Specialty Case Distribution</h3>
              <p className="text-xs text-slate-500">Patient load across Mahalakshmi Hospital specialties</p>
            </div>
            <button
              onClick={() => onNavigate('ortho')}
              className="text-xs font-semibold text-teal-700 hover:underline cursor-pointer"
            >
              Ortho Dept →
            </button>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={summary.departmentAnalytics}
                  dataKey="patients"
                  nameKey="department"
                  cx="50%"
                  cy="45%"
                  outerRadius={80}
                  label={({ department, patients }) => `${department}: ${patients}`}
                >
                  {summary.departmentAnalytics.map((_, index) => (
                    <Cell key={index} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Ward Occupancy & Active Surgeries / Emergencies */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Ward Occupancy */}
        <div className="lg:col-span-5 bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-slate-900">Live Ward & ICU Bed Occupancy</h3>
            <button
              onClick={() => onNavigate('beds')}
              className="text-xs font-semibold text-teal-700 hover:underline cursor-pointer"
            >
              Edit Beds & Wards →
            </button>
          </div>
          <div className="space-y-3">
            {summary.wardAnalytics.map((w) => {
              const pct = w.total > 0 ? Math.round((w.occupied / w.total) * 100) : 0;
              return (
                <div key={w.ward} className="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
                  <div className="flex justify-between text-xs font-semibold text-slate-800 mb-1.5">
                    <span>{w.ward}</span>
                    <span>
                      {w.occupied} Occupied / {w.available} Available (Total {w.total})
                    </span>
                  </div>
                  <div className="w-full h-2.5 bg-slate-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-teal-600 rounded-full transition-all"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Operation Theatre Schedule & Emergency Cases */}
        <div className="lg:col-span-7 bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-slate-900">Operation Theatre (OT) Schedule & Emergency Alerts</h3>
            <div className="flex gap-3">
              <button
                onClick={() => onNavigate('surgeries')}
                className="text-xs font-semibold text-teal-700 hover:underline cursor-pointer"
              >
                OT Schedule →
              </button>
              <button
                onClick={() => onNavigate('emergency')}
                className="text-xs font-semibold text-rose-600 hover:underline cursor-pointer"
              >
                Emergency Desk →
              </button>
            </div>
          </div>

          <div className="space-y-2.5">
            {summary.upcomingSurgeries.map((s) => (
              <div
                key={s.id}
                className="p-3 rounded-xl border border-slate-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 hover:bg-slate-50"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold text-teal-700">{s.surgeryUid}</span>
                    <span className="text-sm font-bold text-slate-900">{s.procedureName}</span>
                  </div>
                  <div className="text-xs text-slate-600 mt-0.5">
                    Patient: <strong>{s.patientName}</strong> | Surgeon: {s.leadSurgeonName} | {s.operationTheatre}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-500">{s.scheduledDate} {s.scheduledTime}</span>
                  <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-teal-100 text-teal-800">
                    {s.status}
                  </span>
                </div>
              </div>
            ))}

            {summary.recentEmergencies.map((emg) => (
              <div
                key={emg.id}
                className="p-3 rounded-xl border border-rose-200 bg-rose-50/50 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2"
              >
                <div className="flex items-start gap-2.5">
                  <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <div>
                    <div className="text-sm font-bold text-slate-900">
                      {emg.patientName} ({emg.age}y/{emg.gender}) — {emg.traumaType}
                    </div>
                    <div className="text-xs text-slate-600">
                      Vitals: {emg.vitalsSummary} | Attending: {emg.attendingDoctor}
                    </div>
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-rose-600 text-white self-start sm:self-center">
                  {emg.triageLevel} • {emg.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Configured 15 Hospital Services Bar */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700">
            Active Hospital Clinical Services (Click to View / Edit Cases)
          </h3>
          <button
            onClick={() => onNavigate('settings')}
            className="text-xs text-teal-700 font-semibold hover:underline cursor-pointer"
          >
            Configure Services →
          </button>
        </div>
        <div className="flex flex-wrap gap-2">
          {HOSPITAL_SERVICES.map((srv) => (
            <button
              key={srv}
              onClick={() =>
                ['Joint Replacement', 'Fractures', 'Spine Surgeries', 'Trauma', 'Joint Inflammation', 'Ligament Tears', 'Keyhole Surgeries', 'Orthopaedics'].includes(srv)
                  ? onNavigate('ortho')
                  : srv === 'Emergency Care'
                  ? onNavigate('emergency')
                  : srv === 'Diagnostic Imaging'
                  ? onNavigate('imaging')
                  : onNavigate('patients')
              }
              className="px-3 py-1.5 rounded-xl bg-teal-50 hover:bg-teal-600 hover:text-white text-teal-800 border border-teal-200 text-xs font-semibold transition cursor-pointer"
            >
              {srv}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
