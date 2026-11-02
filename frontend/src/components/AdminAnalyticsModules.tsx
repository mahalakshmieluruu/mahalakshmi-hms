import React, { useEffect, useState } from 'react';
import {
  Plus, Edit3, Trash2, X, Shield, BarChart3, Settings, FileSpreadsheet,
  Save, CheckCircle2, KeyRound, Power, Upload, Download, AlertTriangle,
  FileCheck2, Database
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import { api } from '../services/api';
import {
  UserAccount, UserRole, HospitalSettings, AuditLog, DashboardSummary
} from '../types/hms';

// ============================================================================
// MODULE 14: STAFF & ROLE-BASED USER MANAGEMENT (Multi-Staff & Device Tracking)
// ============================================================================
export const StaffUserModule: React.FC<{ onRefreshGlobal: () => void }> = ({ onRefreshGlobal }) => {
  const [users, setUsers] = useState<UserAccount[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<UserAccount>({
    username: '',
    plainPassword: '',
    fullName: '',
    role: 'RECEPTIONIST',
    department: 'Front Office & OPD',
    designation: 'Reception Executive',
    phone: '+91 ',
    email: '',
    shiftTiming: 'Morning (08:00 - 16:00)',
    active: true,
  });

  const roles: { value: UserRole; label: string }[] = [
    { value: 'OWNER', label: 'Owner / Super Admin' },
    { value: 'ADMIN', label: 'Hospital Administrator' },
    { value: 'DOCTOR', label: 'Doctor / Surgeon' },
    { value: 'NURSE', label: 'Nurse (IPD / ICU / OT)' },
    { value: 'RECEPTIONIST', label: 'Receptionist' },
    { value: 'LAB_TECH', label: 'Laboratory Technician' },
    { value: 'BILLING', label: 'Billing Staff' },
  ];

  const load = async () => setUsers(await api.get<UserAccount[]>('/users'));
  useEffect(() => { load(); }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editing.id) {
      await api.put(`/users/${editing.id}`, editing);
    } else {
      await api.post('/users', editing);
    }
    setModalOpen(false);
    await load();
    onRefreshGlobal();
  };

  const handleToggleActive = async (u: UserAccount) => {
    if (!u.id) return;
    await api.put(`/users/${u.id}/toggle-active`, {});
    await load();
    onRefreshGlobal();
  };

  const handleResetPassword = async (u: UserAccount) => {
    if (!u.id) return;
    const newPw = window.prompt(`Enter new password for ${u.fullName} (@${u.username}):`, 'Mahalakshmi@2026');
    if (!newPw) return;
    await api.put(`/users/${u.id}/reset-password`, { newPassword: newPw });
    window.alert(`Password successfully reset for @${u.username}`);
    await load();
  };

  const handleDelete = async (id?: number) => {
    if (!id || !window.confirm('Delete this staff user account?')) return;
    await api.delete(`/users/${id}`);
    await load();
    onRefreshGlobal();
  };

  return (
    <div className="space-y-5">
      <div className="bg-white rounded-2xl p-5 border border-slate-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Shield className="w-5 h-5 text-teal-600" /> Multi-Staff Accounts & Role-Based Access Control (RBAC)
          </h2>
          <p className="text-xs text-slate-500">
            Individual staff credentials, role permissions, account activation/deactivation, password resets, and last-login device audit.
          </p>
        </div>
        <button
          onClick={() => {
            setEditing({
              username: '',
              plainPassword: 'Staff@2026',
              fullName: '',
              role: 'NURSE',
              department: 'IPD Nursing',
              designation: 'Staff Nurse',
              phone: '+91 98480-',
              email: 'staff@mahalakshmihospital-eluru.in',
              shiftTiming: 'Day Shift (08:00 - 16:00)',
              active: true,
            });
            setModalOpen(true);
          }}
          className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
        >
          <Plus className="w-4 h-4" /> + Add Individual Staff Account
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold uppercase text-slate-500">
              <th className="py-3 px-4">Username</th>
              <th className="py-3 px-4">Staff Full Name & Designation</th>
              <th className="py-3 px-4">Assigned Role</th>
              <th className="py-3 px-4">Department & Shift</th>
              <th className="py-3 px-4">Last Login & Device</th>
              <th className="py-3 px-4">Account Status</th>
              <th className="py-3 px-4 text-right">Security & Edit Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {users.map((u) => (
              <tr key={u.id} className="hover:bg-slate-50">
                <td className="py-3.5 px-4 font-mono font-bold text-teal-700">@{u.username}</td>
                <td className="py-3.5 px-4">
                  <div className="font-bold text-slate-900">{u.fullName}</div>
                  <div className="text-slate-500">{u.designation} • {u.phone}</div>
                </td>
                <td className="py-3.5 px-4">
                  <span className="px-2.5 py-1 rounded-full bg-teal-100 text-teal-900 font-bold text-[11px]">
                    {u.role}
                  </span>
                </td>
                <td className="py-3.5 px-4">
                  <div className="font-medium text-slate-800">{u.department}</div>
                  <div className="text-slate-500">{u.shiftTiming}</div>
                </td>
                <td className="py-3.5 px-4">
                  {u.lastLoginAt ? (
                    <div>
                      <div className="font-mono text-[11px] text-slate-800">
                        {u.lastLoginAt.replace('T', ' ').substring(0, 19)}
                      </div>
                      <div className="text-[11px] text-teal-700 font-medium">{u.lastLoginDevice || 'Web Browser'}</div>
                    </div>
                  ) : (
                    <span className="text-slate-400 italic">No recent login recorded</span>
                  )}
                </td>
                <td className="py-3.5 px-4">
                  <span className={`px-2.5 py-0.5 rounded-full font-bold text-[11px] ${u.active ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'}`}>
                    {u.active ? 'ACTIVE' : 'DEACTIVATED'}
                  </span>
                </td>
                <td className="py-3.5 px-4 text-right">
                  <div className="inline-flex items-center gap-1.5">
                    <button
                      onClick={() => handleResetPassword(u)}
                      className="px-2 py-1 rounded-lg bg-sky-50 hover:bg-sky-100 text-sky-800 border border-sky-200 font-semibold flex items-center gap-1 cursor-pointer"
                      title="Reset Staff Password"
                    >
                      <KeyRound className="w-3.5 h-3.5" /> Reset PW
                    </button>
                    <button
                      onClick={() => handleToggleActive(u)}
                      className={`px-2 py-1 rounded-lg font-semibold flex items-center gap-1 cursor-pointer border ${
                        u.active
                          ? 'bg-rose-50 hover:bg-rose-100 text-rose-700 border-rose-200'
                          : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border-emerald-200'
                      }`}
                      title={u.active ? 'Deactivate Account' : 'Activate Account'}
                    >
                      <Power className="w-3.5 h-3.5" /> {u.active ? 'Disable' : 'Enable'}
                    </button>
                    <button onClick={() => { setEditing({ ...u, plainPassword: '' }); setModalOpen(true); }} className="p-1.5 rounded-lg bg-slate-100 hover:bg-amber-100 cursor-pointer"><Edit3 className="w-4 h-4" /></button>
                    <button onClick={() => handleDelete(u.id)} className="p-1.5 rounded-lg bg-slate-100 hover:bg-rose-100 text-rose-600 cursor-pointer"><Trash2 className="w-4 h-4" /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl">
            <div className="flex justify-between items-center pb-3 border-b">
              <h3 className="text-lg font-bold">{editing.id ? `Edit Staff User @${editing.username}` : 'Create Individual Staff Account'}</h3>
              <button onClick={() => setModalOpen(false)} className="cursor-pointer"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleSave} className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="font-semibold block mb-1">Username *</label>
                <input type="text" required value={editing.username} onChange={(e) => setEditing({ ...editing, username: e.target.value })} className="w-full px-3 py-2 rounded-xl border border-slate-300" />
              </div>
              <div>
                <label className="font-semibold block mb-1">
                  {editing.id ? 'New Password (leave blank to keep)' : 'Initial Password *'}
                </label>
                <input type="text" value={editing.plainPassword || ''} onChange={(e) => setEditing({ ...editing, plainPassword: e.target.value })} className="w-full px-3 py-2 rounded-xl border border-slate-300" placeholder="BCrypt hashed on save" />
              </div>
              <div>
                <label className="font-semibold block mb-1">Staff Full Name *</label>
                <input type="text" required value={editing.fullName} onChange={(e) => setEditing({ ...editing, fullName: e.target.value })} className="w-full px-3 py-2 rounded-xl border border-slate-300" />
              </div>
              <div>
                <label className="font-semibold block mb-1">RBAC Security Role *</label>
                <select value={editing.role} onChange={(e) => setEditing({ ...editing, role: e.target.value as UserRole })} className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white">
                  {roles.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
                </select>
              </div>
              <div>
                <label className="font-semibold block mb-1">Department</label>
                <input type="text" value={editing.department} onChange={(e) => setEditing({ ...editing, department: e.target.value })} className="w-full px-3 py-2 rounded-xl border border-slate-300" />
              </div>
              <div>
                <label className="font-semibold block mb-1">Designation</label>
                <input type="text" value={editing.designation} onChange={(e) => setEditing({ ...editing, designation: e.target.value })} className="w-full px-3 py-2 rounded-xl border border-slate-300" />
              </div>
              <div>
                <label className="font-semibold block mb-1">Phone</label>
                <input type="text" value={editing.phone} onChange={(e) => setEditing({ ...editing, phone: e.target.value })} className="w-full px-3 py-2 rounded-xl border border-slate-300" />
              </div>
              <div>
                <label className="font-semibold block mb-1">Shift Timing & Status</label>
                <div className="flex gap-2">
                  <input type="text" value={editing.shiftTiming} onChange={(e) => setEditing({ ...editing, shiftTiming: e.target.value })} className="w-2/3 px-2 py-2 rounded-xl border border-slate-300" />
                  <select value={editing.active ? 'YES' : 'NO'} onChange={(e) => setEditing({ ...editing, active: e.target.value === 'YES' })} className="w-1/3 px-2 py-2 rounded-xl border border-slate-300 bg-white">
                    <option value="YES">Active</option>
                    <option value="NO">Disabled</option>
                  </select>
                </div>
              </div>
              <div className="sm:col-span-2 flex justify-end gap-2 pt-3 border-t">
                <button type="button" onClick={() => setModalOpen(false)} className="px-4 py-2 rounded-xl border cursor-pointer">Cancel</button>
                <button type="submit" className="px-5 py-2 rounded-xl bg-teal-600 text-white font-semibold cursor-pointer">Save Staff Account</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

// ============================================================================
// HOSPITAL ONBOARDING, BULK CSV/EXCEL IMPORT & DATA EXPORT MODULE
// ============================================================================
export const OnboardingImportExportModule: React.FC<{ onRefreshGlobal: () => void }> = ({ onRefreshGlobal }) => {
  const [importType, setImportType] = useState<'patients' | 'doctors' | 'staff'>('patients');
  const [csvContent, setCsvContent] = useState<string>('');
  const [previewResult, setPreviewResult] = useState<any | null>(null);
  const [commitBanner, setCommitBanner] = useState<string>('');

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = String(ev.target?.result || '');
      setCsvContent(text);
      setPreviewResult(null);
      setCommitBanner('');
    };
    reader.readAsText(file);
  };

  const loadSamplePreviewData = () => {
    if (importType === 'patients') {
      setCsvContent(
        `patientUid,fullName,dateOfBirth,age,gender,bloodGroup,phone,address,emergencyContactName,emergencyContactPhone,allergies,medicalHistory,primaryService,assignedDoctorName,status\n` +
        `MHL-2026-2051,V. Suryaprakash Rao,1968-03-19,58,Male,A+,+91 98482-77661,"Powerpet, Eluru, AP 534002",V. Padma,+91 98482-77662,None,Right Hip Osteoarthritis,Joint Replacement,Dr. K. Venkata Rama Rao,OUTPATIENT\n` +
        `MHL-2026-1001,D. Suryanarayana Murthy,1962-04-15,64,Male,B+,+91 98483-10293,"Powerpet, Eluru",D. Karthik,+91 98483-99881,Sulfa,Duplicate Check Demo,Joint Replacement,Dr. K. Venkata Rama Rao,ADMITTED\n` +
        `MHL-2026-2052,,1980-01-01,46,Female,O+,123,"Invalid Phone & Missing Name Demo",,,,,,,OUTPATIENT`
      );
    } else if (importType === 'doctors') {
      setCsvContent(
        `doctorCode,fullName,specialization,department,qualification,licenseNumber,experienceYears,phone,email,consultationFee,availabilitySchedule,roomNumber\n` +
        `DOC-205,Dr. P. Narasimha Raju,Spine & Trauma Surgery,Spine Surgeries,MBBS MS (Ortho),APMC-77412,16,+91 98481-66554,dr.raju@mahalakshmihospital-eluru.in,600,Mon-Sat 10AM-4PM,OPD-06`
      );
    } else {
      setCsvContent(
        `username,fullName,role,department,designation,phone,email,shiftTiming,initialPassword\n` +
        `nurse_swapna,M. Swapna Kumari,NURSE,Orthopaedic OT,OT Scrub Nurse,+91 94901-33442,swapna@mahalakshmihospital-eluru.in,General Shift,Nurse@2026`
      );
    }
    setPreviewResult(null);
    setCommitBanner('');
  };

  const handlePreview = async () => {
    const res = await api.post<any>(`/onboarding/preview/${importType}`, { csvContent });
    setPreviewResult(res);
    setCommitBanner('');
  };

  const handleCommit = async () => {
    const res = await api.post<any>(`/onboarding/commit/${importType}`, { csvContent });
    setPreviewResult(res);
    setCommitBanner(
      `Successfully imported ${res.importedCount} new ${importType} record(s). Skipped ${res.duplicateCount} duplicate(s) (never overwritten) and ${res.invalidCount} invalid row(s).`
    );
    onRefreshGlobal();
  };

  const downloadErrorReport = () => {
    if (!previewResult?.errorReportCsv) return;
    const blob = new Blob([previewResult.errorReportCsv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Mahalakshmi_HMS_${importType}_Import_Error_Report.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Database className="w-5 h-5 text-teal-600" /> Hospital Onboarding, Bulk CSV/Excel Import & Data Export
          </h2>
          <p className="text-xs text-slate-500">
            Download templates, preview & validate historical records, detect duplicates without overwriting existing medical data, and export reports.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <a
            href={api.getTemplateDownloadUrl('patients')}
            className="px-3 py-2 rounded-xl bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-200 text-xs font-semibold flex items-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5" /> Patients Template (.CSV)
          </a>
          <a
            href={api.getTemplateDownloadUrl('doctors')}
            className="px-3 py-2 rounded-xl bg-sky-50 hover:bg-sky-100 text-sky-800 border border-sky-200 text-xs font-semibold flex items-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5" /> Doctors Template (.CSV)
          </a>
          <a
            href={api.getTemplateDownloadUrl('staff')}
            className="px-3 py-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-800 border border-indigo-200 text-xs font-semibold flex items-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5" /> Staff Template (.CSV)
          </a>
        </div>
      </div>

      {/* Bulk Import Workbench */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <label className="text-xs font-bold uppercase text-slate-600">Select Import Entity:</label>
            <select
              value={importType}
              onChange={(e) => {
                setImportType(e.target.value as any);
                setPreviewResult(null);
                setCommitBanner('');
              }}
              className="px-3 py-2 rounded-xl border border-slate-300 text-xs font-bold bg-white"
            >
              <option value="patients">Historical & New Patients</option>
              <option value="doctors">Doctors & Consultants</option>
              <option value="staff">Hospital Staff Accounts</option>
            </select>
            <button
              type="button"
              onClick={loadSamplePreviewData}
              className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold cursor-pointer"
            >
              Load Sample Test Rows (Valid + Duplicate + Invalid)
            </button>
          </div>

          <label className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer">
            <Upload className="w-4 h-4" /> Upload Excel / CSV File
            <input type="file" accept=".csv,.txt" className="hidden" onChange={handleFileUpload} />
          </label>
        </div>

        <textarea
          rows={5}
          value={csvContent}
          onChange={(e) => setCsvContent(e.target.value)}
          placeholder="Paste CSV rows here or upload a .csv file above..."
          className="w-full p-3 rounded-xl border border-slate-300 font-mono text-xs"
        />

        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex gap-2">
            <button
              type="button"
              onClick={handlePreview}
              disabled={!csvContent.trim()}
              className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 disabled:opacity-50 text-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
            >
              <FileCheck2 className="w-4 h-4" /> 1. Preview, Validate & Check Duplicates
            </button>
            {previewResult && previewResult.validCount > 0 && (
              <button
                type="button"
                onClick={handleCommit}
                className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4" /> 2. Commit {previewResult.validCount} Valid Record(s) to Database
              </button>
            )}
          </div>

          {previewResult && (previewResult.duplicateCount > 0 || previewResult.invalidCount > 0) && (
            <button
              type="button"
              onClick={downloadErrorReport}
              className="px-3.5 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-200 text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
            >
              <Download className="w-4 h-4" /> Download Import Error & Duplicate Report (.CSV)
            </button>
          )}
        </div>

        {commitBanner && (
          <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-bold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" /> {commitBanner}
          </div>
        )}

        {/* Validation & Duplicate Preview Breakdown */}
        {previewResult && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-3 border-t border-slate-200 text-xs">
            <div className="p-3.5 rounded-xl bg-emerald-50/70 border border-emerald-200">
              <div className="font-bold text-emerald-900 mb-2">
                Valid Records Ready ({previewResult.validCount})
              </div>
              <div className="space-y-1.5 max-h-40 overflow-y-auto">
                {previewResult.validRows?.map((r: any, idx: number) => (
                  <div key={idx} className="p-2 rounded bg-white border border-emerald-200">
                    <strong>Row {r.rowNumber}: {r.fullName}</strong> ({r.identifier})
                    <div className="text-[11px] text-slate-500">{r.details}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-amber-50/70 border border-amber-200">
              <div className="font-bold text-amber-900 mb-2 flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5" /> Duplicate Records Protected ({previewResult.duplicateCount})
              </div>
              <div className="space-y-1.5 max-h-40 overflow-y-auto">
                {previewResult.duplicateRows?.map((r: any, idx: number) => (
                  <div key={idx} className="p-2 rounded bg-white border border-amber-200">
                    <strong>Row {r.rowNumber}: {r.fullName}</strong>
                    <div className="text-[11px] text-amber-800">{r.reason}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-rose-50/70 border border-rose-200">
              <div className="font-bold text-rose-900 mb-2">
                Invalid / Missing Fields ({previewResult.invalidCount})
              </div>
              <div className="space-y-1.5 max-h-40 overflow-y-auto">
                {previewResult.invalidRows?.map((r: any, idx: number) => (
                  <div key={idx} className="p-2 rounded bg-white border border-rose-200">
                    <strong>Row {r.rowNumber}: {r.fullName || 'Missing Name'}</strong>
                    <div className="text-[11px] text-rose-700">{r.reason}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Authorized Data Export Panel */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
        <h3 className="text-base font-bold text-slate-900 mb-1">Authorized Hospital Data Export (CSV / Excel & Print PDF)</h3>
        <p className="text-xs text-slate-500 mb-4">
          All exports are protected by JWT authorization and recorded in the immutable security audit log.
        </p>
        <div className="flex flex-wrap gap-2.5">
          {[
            { id: 'patients', label: 'Export All Patients (CSV/Excel)' },
            { id: 'doctors', label: 'Export Doctors Roster (CSV/Excel)' },
            { id: 'invoices', label: 'Export Billing & Invoices (CSV/Excel)' },
            { id: 'lab-reports', label: 'Export Blood & Lab Reports (CSV/Excel)' },
            { id: 'audit-logs', label: 'Export Security Audit Logs (CSV/Excel)' },
          ].map((exp) => (
            <a
              key={exp.id}
              href={api.getExportDownloadUrl(exp.id)}
              className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-teal-700 text-white text-xs font-semibold flex items-center gap-1.5 transition"
            >
              <FileSpreadsheet className="w-4 h-4" /> {exp.label}
            </a>
          ))}
          <button
            type="button"
            onClick={() => window.print()}
            className="px-4 py-2.5 rounded-xl border border-slate-300 hover:bg-slate-100 text-slate-800 text-xs font-semibold cursor-pointer"
          >
            Print / Save Current View as PDF
          </button>
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// MODULE 16: REPORTS & ANALYTICS
// ============================================================================
export const AnalyticsModule: React.FC<{ summary: DashboardSummary | null }> = ({ summary }) => {
  if (!summary) return null;

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl p-5 border border-slate-200 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-teal-600" /> Executive Hospital Reports & Department Analytics
          </h2>
          <p className="text-xs text-slate-500">
            Real-time operational, orthopaedic sub-specialty, and revenue intelligence computed directly from the database.
          </p>
        </div>
        <button
          onClick={() => window.print()}
          className="px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
        >
          <FileSpreadsheet className="w-4 h-4" /> Print / Export PDF Report
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
          <h3 className="text-sm font-bold text-slate-800 mb-4">Orthopaedic Sub-Specialty Case Volume</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={summary.orthoAnalytics}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="specialty" tick={{ fontSize: 11 }} />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Legend />
                <Bar dataKey="cases" name="Registered Cases" fill="#0284c7" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
          <h3 className="text-sm font-bold text-slate-800 mb-4">Department-Wise Patient & Revenue Summary</h3>
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500 uppercase text-[11px]">
                <th className="py-2">Hospital Service / Department</th>
                <th className="py-2">Patients</th>
                <th className="py-2 text-right">Collected Revenue (₹)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {summary.departmentAnalytics.map((d) => (
                <tr key={d.department}>
                  <td className="py-2.5 font-semibold text-slate-800">{d.department}</td>
                  <td className="py-2.5">{d.patients}</td>
                  <td className="py-2.5 text-right font-bold text-teal-700">₹{d.revenue.toLocaleString('en-IN')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// MODULE 17: AUDIT LOGS & EDITABLE HOSPITAL SYSTEM SETTINGS
// ============================================================================
export const AuditSettingsModule: React.FC<{ onRefreshGlobal: () => void }> = ({ onRefreshGlobal }) => {
  const [settings, setSettings] = useState<HospitalSettings | null>(null);
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [savedBanner, setSavedBanner] = useState(false);

  const load = async () => {
    const [s, l] = await Promise.all([
      api.get<HospitalSettings>('/settings'),
      api.get<AuditLog[]>('/audit-logs'),
    ]);
    setSettings(s);
    setLogs(l);
  };

  useEffect(() => { load(); }, []);

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settings) return;
    const updated = await api.put<HospitalSettings>('/settings', settings);
    setSettings(updated);
    setSavedBanner(true);
    setTimeout(() => setSavedBanner(false), 3000);
    await load();
    onRefreshGlobal();
  };

  return (
    <div className="space-y-6">
      {settings && (
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between pb-4 border-b border-slate-200">
            <div>
              <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <Settings className="w-5 h-5 text-teal-600" /> Hospital Profile & System Configuration Editor
              </h2>
              <p className="text-xs text-slate-500">
                Edit hospital title, address, contact numbers, GST/Registration numbers, Managing Director name, and active clinical services.
              </p>
            </div>
            {savedBanner && (
              <span className="px-3 py-1.5 rounded-xl bg-emerald-100 text-emerald-800 text-xs font-bold flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4" /> Hospital Settings Saved to Database!
              </span>
            )}
          </div>

          <form onSubmit={handleSaveSettings} className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Hospital Name</label>
              <input type="text" value={settings.hospitalName} onChange={(e) => setSettings({ ...settings, hospitalName: e.target.value })} className="w-full px-3 py-2 rounded-xl border border-slate-300 font-bold" />
            </div>
            <div className="md:col-span-2">
              <label className="font-semibold text-slate-700 block mb-1">Tagline / Subtitle</label>
              <input type="text" value={settings.subtitle} onChange={(e) => setSettings({ ...settings, subtitle: e.target.value })} className="w-full px-3 py-2 rounded-xl border border-slate-300" />
            </div>
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Address Line 1 (Street)</label>
              <input type="text" value={settings.addressLine1} onChange={(e) => setSettings({ ...settings, addressLine1: e.target.value })} className="w-full px-3 py-2 rounded-xl border border-slate-300" />
            </div>
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Address Line 2 (Locality)</label>
              <input type="text" value={settings.addressLine2} onChange={(e) => setSettings({ ...settings, addressLine2: e.target.value })} className="w-full px-3 py-2 rounded-xl border border-slate-300" />
            </div>
            <div>
              <label className="font-semibold text-slate-700 block mb-1">City, State & Pincode</label>
              <div className="flex gap-2">
                <input type="text" value={settings.city} onChange={(e) => setSettings({ ...settings, city: e.target.value })} className="w-1/3 px-2 py-2 rounded-xl border border-slate-300" />
                <input type="text" value={settings.state} onChange={(e) => setSettings({ ...settings, state: e.target.value })} className="w-1/3 px-2 py-2 rounded-xl border border-slate-300" />
                <input type="text" value={settings.pincode} onChange={(e) => setSettings({ ...settings, pincode: e.target.value })} className="w-1/3 px-2 py-2 rounded-xl border border-slate-300" />
              </div>
            </div>
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Primary Reception Phone</label>
              <input type="text" value={settings.primaryPhone} onChange={(e) => setSettings({ ...settings, primaryPhone: e.target.value })} className="w-full px-3 py-2 rounded-xl border border-slate-300" />
            </div>
            <div>
              <label className="font-semibold text-slate-700 block mb-1">24x7 Emergency Phone</label>
              <input type="text" value={settings.emergencyPhone} onChange={(e) => setSettings({ ...settings, emergencyPhone: e.target.value })} className="w-full px-3 py-2 rounded-xl border border-slate-300" />
            </div>
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Owner / Managing Director</label>
              <input type="text" value={settings.ownerName} onChange={(e) => setSettings({ ...settings, ownerName: e.target.value })} className="w-full px-3 py-2 rounded-xl border border-slate-300" />
            </div>
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Hospital Registration No.</label>
              <input type="text" value={settings.registrationNumber} onChange={(e) => setSettings({ ...settings, registrationNumber: e.target.value })} className="w-full px-3 py-2 rounded-xl border border-slate-300" />
            </div>
            <div>
              <label className="font-semibold text-slate-700 block mb-1">GSTIN</label>
              <input type="text" value={settings.gstNumber} onChange={(e) => setSettings({ ...settings, gstNumber: e.target.value })} className="w-full px-3 py-2 rounded-xl border border-slate-300" />
            </div>
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Operating Hours</label>
              <input type="text" value={settings.operatingHours} onChange={(e) => setSettings({ ...settings, operatingHours: e.target.value })} className="w-full px-3 py-2 rounded-xl border border-slate-300" />
            </div>
            <div className="md:col-span-3">
              <label className="font-semibold text-slate-700 block mb-1">Configured Hospital Services (Comma-Separated)</label>
              <textarea rows={2} value={settings.configuredServices} onChange={(e) => setSettings({ ...settings, configuredServices: e.target.value })} className="w-full px-3 py-2 rounded-xl border border-slate-300" />
            </div>
            <div className="md:col-span-3 flex justify-end">
              <button type="submit" className="px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-semibold flex items-center gap-1.5 shadow cursor-pointer">
                <Save className="w-4 h-4" /> Save Hospital Settings
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Security Audit Trail */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
        <h3 className="text-lg font-bold text-slate-900">Immutable Security & Clinical Audit Logs</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold uppercase text-slate-500">
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-4">Actor & Role</th>
                <th className="py-3 px-4">Action</th>
                <th className="py-3 px-4">Module & Entity ID</th>
                <th className="py-3 px-4">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {logs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50">
                  <td className="py-2.5 px-4 font-mono text-slate-500">{log.timestamp?.replace('T', ' ').substring(0, 19)}</td>
                  <td className="py-2.5 px-4 font-bold text-slate-800">
                    @{log.username} <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-teal-800">{log.userRole}</span>
                  </td>
                  <td className="py-2.5 px-4">
                    <span className="px-2 py-0.5 rounded font-bold bg-teal-50 text-teal-700">{log.action}</span>
                  </td>
                  <td className="py-2.5 px-4 font-mono">{log.module} • {log.entityId}</td>
                  <td className="py-2.5 px-4 text-slate-600">{log.details}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
