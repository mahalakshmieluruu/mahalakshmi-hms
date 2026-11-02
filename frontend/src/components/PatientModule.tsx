import React, { useEffect, useState } from 'react';
import {
  UserPlus, Search, Edit3, Trash2, Eye, Phone, MapPin, AlertCircle,
  FileText, FlaskConical, Activity, BedDouble, Scissors, IndianRupee,
  CalendarClock, Download, X, CheckCircle
} from 'lucide-react';
import { api } from '../services/api';
import {
  Patient, Doctor, HOSPITAL_SERVICES, Appointment, MedicalRecord,
  LabReport, DiagnosticImaging, Admission, Surgery, Invoice, OrthopaedicCase
} from '../types/hms';

interface PatientModuleProps {
  doctors: Doctor[];
  onDataChange: () => void;
  onNavigateModule: (mod: string) => void;
}

interface Patient360Profile {
  patient: Patient;
  appointments: Appointment[];
  medicalRecords: MedicalRecord[];
  labReports: LabReport[];
  imagingReports: DiagnosticImaging[];
  admissions: Admission[];
  surgeries: Surgery[];
  invoices: Invoice[];
  orthoCases: OrthopaedicCase[];
}

const emptyPatient = (): Patient => ({
  fullName: '',
  dateOfBirth: '1985-06-15',
  age: 41,
  gender: 'Male',
  bloodGroup: 'O+',
  phone: '+91 ',
  address: 'Eluru, Andhra Pradesh 534002',
  emergencyContactName: '',
  emergencyContactPhone: '+91 ',
  emergencyContactRelation: 'Spouse',
  allergies: 'None known',
  medicalHistory: '',
  primaryService: 'Orthopaedics',
  assignedDoctorName: 'Dr. K. Venkata Rama Rao',
  status: 'OUTPATIENT',
  registrationDate: new Date().toISOString().split('T')[0],
});

export const PatientModule: React.FC<PatientModuleProps> = ({ doctors, onDataChange, onNavigateModule }) => {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [showModal, setShowModal] = useState(false);
  const [editingPatient, setEditingPatient] = useState<Patient>(emptyPatient());
  const [selectedProfile, setSelectedProfile] = useState<Patient360Profile | null>(null);
  const [activeTab, setActiveTab] = useState<string>('visits');
  const [saving, setSaving] = useState(false);

  const loadPatients = async () => {
    const list = await api.get<Patient[]>('/patients');
    setPatients(list);
    if (selectedProfile?.patient?.id) {
      openProfile(selectedProfile.patient.id);
    }
  };

  useEffect(() => {
    loadPatients();
  }, []);

  const openProfile = async (patientId: number) => {
    const data = await api.get<Patient360Profile>(`/patients/${patientId}/profile`);
    setSelectedProfile(data);
  };

  const handleOpenCreate = () => {
    setEditingPatient(emptyPatient());
    setShowModal(true);
  };

  const handleOpenEdit = (p: Patient) => {
    setEditingPatient({ ...p });
    setShowModal(true);
  };

  const handleDelete = async (p: Patient) => {
    if (!p.id) return;
    if (!window.confirm(`Delete patient record ${p.fullName} (${p.patientUid})?`)) return;
    await api.delete(`/patients/${p.id}`);
    if (selectedProfile?.patient.id === p.id) {
      setSelectedProfile(null);
    }
    await loadPatients();
    onDataChange();
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editingPatient.id) {
        await api.put(`/patients/${editingPatient.id}`, editingPatient);
      } else {
        await api.post('/patients', editingPatient);
      }
      setShowModal(false);
      await loadPatients();
      onDataChange();
    } finally {
      setSaving(false);
    }
  };

  const handleDobChange = (dob: string) => {
    const birthYear = new Date(dob).getFullYear();
    const currentYear = new Date().getFullYear();
    const calculatedAge = !isNaN(birthYear) ? Math.max(0, currentYear - birthYear) : editingPatient.age;
    setEditingPatient({ ...editingPatient, dateOfBirth: dob, age: calculatedAge });
  };

  const filtered = patients.filter((p) => {
    const matchesSearch =
      p.fullName?.toLowerCase().includes(search.toLowerCase()) ||
      p.patientUid?.toLowerCase().includes(search.toLowerCase()) ||
      p.phone?.toLowerCase().includes(search.toLowerCase()) ||
      p.primaryService?.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || p.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const statusBadge = (status: string) => {
    switch (status) {
      case 'ADMITTED':
        return 'bg-indigo-100 text-indigo-800 border-indigo-200';
      case 'EMERGENCY':
        return 'bg-rose-100 text-rose-800 border-rose-200';
      case 'DISCHARGED':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      default:
        return 'bg-teal-100 text-teal-800 border-teal-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">
            Patient Registration & 360° Longitudinal Profiles
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Register new patients, edit any patient field, or inspect complete clinical history across 9 tabs.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search ID, name, phone, service..."
              className="pl-9 pr-4 py-2 rounded-xl border border-slate-300 text-xs w-64 focus:border-teal-600 outline-none"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-300 text-xs bg-white"
          >
            <option value="ALL">All Statuses</option>
            <option value="OUTPATIENT">Outpatient (OPD)</option>
            <option value="ADMITTED">Admitted (IPD)</option>
            <option value="EMERGENCY">Emergency</option>
            <option value="DISCHARGED">Discharged</option>
          </select>
          <button
            onClick={handleOpenCreate}
            className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs flex items-center gap-1.5 shadow cursor-pointer"
          >
            <UserPlus className="w-4 h-4" /> + Register Patient
          </button>
        </div>
      </div>

      {/* Patient Directory Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                <th className="py-3.5 px-4">Patient ID</th>
                <th className="py-3.5 px-4">Full Name & Demographics</th>
                <th className="py-3.5 px-4">Contact & Address</th>
                <th className="py-3.5 px-4">Service & Consultant</th>
                <th className="py-3.5 px-4">Allergies / Medical History</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Actions (View / Edit / Delete)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-xs">
              {filtered.map((p) => (
                <tr
                  key={p.id}
                  className={`hover:bg-teal-50/40 transition ${
                    selectedProfile?.patient.id === p.id ? 'bg-teal-50/70' : ''
                  }`}
                >
                  <td className="py-3.5 px-4 font-mono font-bold text-teal-700">
                    {p.patientUid}
                    <div className="text-[11px] text-slate-400 font-sans font-normal">
                      Reg: {p.registrationDate}
                    </div>
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="font-bold text-slate-900 text-sm">{p.fullName}</div>
                    <div className="text-slate-500">
                      {p.age} yrs • {p.gender} • Blood: <strong className="text-rose-600">{p.bloodGroup}</strong> • DOB: {p.dateOfBirth}
                    </div>
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="font-medium text-slate-800 flex items-center gap-1">
                      <Phone className="w-3 h-3 text-teal-600" /> {p.phone}
                    </div>
                    <div className="text-slate-500 truncate max-w-xs flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3 h-3 text-slate-400 shrink-0" /> {p.address}
                    </div>
                    <div className="text-[11px] text-slate-500 mt-0.5">
                      Emergency: {p.emergencyContactName} ({p.emergencyContactPhone})
                    </div>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="px-2 py-0.5 rounded-md bg-sky-50 text-sky-800 border border-sky-200 font-semibold">
                      {p.primaryService}
                    </span>
                    <div className="text-slate-600 mt-1 font-medium">{p.assignedDoctorName}</div>
                  </td>
                  <td className="py-3.5 px-4 max-w-xs">
                    {p.allergies && p.allergies !== 'None' && p.allergies !== 'None known' ? (
                      <span className="inline-flex items-center gap-1 text-rose-700 font-semibold bg-rose-50 px-2 py-0.5 rounded border border-rose-200 mb-1">
                        <AlertCircle className="w-3 h-3" /> Allergy: {p.allergies}
                      </span>
                    ) : (
                      <span className="text-slate-400 block mb-0.5">No Known Allergies</span>
                    )}
                    <div className="text-slate-600 line-clamp-2">{p.medicalHistory}</div>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold border ${statusBadge(p.status)}`}>
                      {p.status}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <div className="inline-flex items-center gap-1.5">
                      <button
                        onClick={() => p.id && openProfile(p.id)}
                        className="px-2.5 py-1.5 rounded-lg bg-teal-600 text-white hover:bg-teal-700 font-semibold flex items-center gap-1 cursor-pointer"
                        title="Open 9-Tab Patient Profile"
                      >
                        <Eye className="w-3.5 h-3.5" /> 360° Profile
                      </button>
                      <button
                        onClick={() => handleOpenEdit(p)}
                        className="p-1.5 rounded-lg bg-slate-100 hover:bg-amber-100 text-slate-700 hover:text-amber-800 cursor-pointer"
                        title="Edit Patient"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(p)}
                        className="p-1.5 rounded-lg bg-slate-100 hover:bg-rose-100 text-slate-700 hover:text-rose-700 cursor-pointer"
                        title="Delete Patient"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 360-DEGREE 9-TAB PATIENT PROFILE VIEW */}
      {selectedProfile && (
        <div className="bg-white rounded-2xl border-2 border-teal-600 shadow-xl overflow-hidden">
          <div className="bg-gradient-to-r from-teal-900 to-slate-900 text-white p-5 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <div className="flex items-center gap-2.5">
                <span className="px-2.5 py-0.5 rounded bg-teal-400/20 border border-teal-300/40 text-teal-200 font-mono text-xs font-bold">
                  {selectedProfile.patient.patientUid}
                </span>
                <h3 className="text-xl font-extrabold">{selectedProfile.patient.fullName}</h3>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-white/15">
                  {selectedProfile.patient.status}
                </span>
              </div>
              <p className="text-xs text-teal-100 mt-1">
                {selectedProfile.patient.age} yrs ({selectedProfile.patient.gender}) • Blood Group: <strong>{selectedProfile.patient.bloodGroup}</strong> • Phone: {selectedProfile.patient.phone} • Address: {selectedProfile.patient.address}
              </p>
              <p className="text-xs text-amber-200 mt-1">
                Allergies: <strong>{selectedProfile.patient.allergies || 'None'}</strong> | Medical History: {selectedProfile.patient.medicalHistory}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleOpenEdit(selectedProfile.patient)}
                className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs flex items-center gap-1 cursor-pointer"
              >
                <Edit3 className="w-3.5 h-3.5" /> Edit Patient Info
              </button>
              <button
                onClick={() => setSelectedProfile(null)}
                className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* 9 Profile Tabs */}
          <div className="flex overflow-x-auto border-b border-slate-200 bg-slate-50 px-4 pt-2 gap-1">
            {[
              { id: 'visits', label: `Visits (${selectedProfile.appointments.length})`, icon: CalendarClock },
              { id: 'consultations', label: `Consultations & EMR (${selectedProfile.medicalRecords.length})`, icon: FileText },
              { id: 'prescriptions', label: `Prescriptions (${selectedProfile.medicalRecords.length})`, icon: CheckCircle },
              { id: 'blood', label: `Blood Reports (${selectedProfile.labReports.length})`, icon: FlaskConical },
              { id: 'diagnostic', label: `Diagnostic Reports (${selectedProfile.imagingReports.length + selectedProfile.orthoCases.length})`, icon: Activity },
              { id: 'admissions', label: `Admissions (${selectedProfile.admissions.length})`, icon: BedDouble },
              { id: 'surgeries', label: `Surgeries (${selectedProfile.surgeries.length})`, icon: Scissors },
              { id: 'billing', label: `Billing (${selectedProfile.invoices.length})`, icon: IndianRupee },
              { id: 'followups', label: 'Follow-ups', icon: CalendarClock },
            ].map((t) => {
              const Icon = t.icon;
              return (
                <button
                  key={t.id}
                  onClick={() => setActiveTab(t.id)}
                  className={`px-3.5 py-2.5 text-xs font-bold rounded-t-xl flex items-center gap-1.5 whitespace-nowrap border-b-2 transition cursor-pointer ${
                    activeTab === t.id
                      ? 'bg-white text-teal-700 border-teal-600 shadow-sm'
                      : 'text-slate-600 border-transparent hover:text-slate-900'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" /> {t.label}
                </button>
              );
            })}
          </div>

          {/* Tab Content Area */}
          <div className="p-5">
            {activeTab === 'visits' && (
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <h4 className="text-sm font-bold text-slate-800">Outpatient & Inpatient Visits</h4>
                  <button
                    onClick={() => onNavigateModule('appointments')}
                    className="text-xs font-semibold text-teal-700 hover:underline cursor-pointer"
                  >
                    + Add / Edit Visits in Appointments →
                  </button>
                </div>
                {selectedProfile.appointments.map((a) => (
                  <div key={a.id} className="p-3.5 rounded-xl border border-slate-200 flex justify-between items-center">
                    <div>
                      <div className="text-xs font-bold text-slate-900">
                        {a.appointmentUid} • {a.visitType} — {a.serviceCategory}
                      </div>
                      <div className="text-xs text-slate-600">
                        Doctor: {a.doctorName} | Reason: {a.reason}
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-semibold text-slate-800 block">{a.appointmentDate} {a.appointmentTime}</span>
                      <span className="px-2 py-0.5 rounded bg-teal-50 text-teal-700 text-[11px] font-bold">{a.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'consultations' && (
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <h4 className="text-sm font-bold text-slate-800">Clinical Consultations & Vitals</h4>
                  <button
                    onClick={() => onNavigateModule('emr')}
                    className="text-xs font-semibold text-teal-700 hover:underline cursor-pointer"
                  >
                    + Add / Edit in EMR Module →
                  </button>
                </div>
                {selectedProfile.medicalRecords.map((m) => (
                  <div key={m.id} className="p-4 rounded-xl border border-slate-200 space-y-1.5">
                    <div className="flex justify-between">
                      <span className="text-xs font-bold text-teal-700">{m.recordUid} • {m.serviceCategory} ({m.doctorName})</span>
                      <span className="text-xs text-slate-500">{m.visitDate}</span>
                    </div>
                    <div className="text-xs"><strong>Chief Complaint:</strong> {m.chiefComplaint}</div>
                    <div className="text-xs"><strong>Diagnosis:</strong> {m.diagnosis}</div>
                    <div className="text-xs text-slate-600"><strong>Clinical Notes:</strong> {m.clinicalNotes}</div>
                    <div className="text-[11px] bg-slate-50 p-2 rounded-lg text-slate-700">
                      Vitals — BP: {m.vitalsBp} | Pulse: {m.vitalsPulse} | Temp: {m.vitalsTemp} | SpO2: {m.vitalsSpo2} | Weight: {m.vitalsWeight}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'prescriptions' && (
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <h4 className="text-sm font-bold text-slate-800">Active & Historical Prescriptions (Rx)</h4>
                  <button
                    onClick={() => onNavigateModule('emr')}
                    className="text-xs font-semibold text-teal-700 hover:underline cursor-pointer"
                  >
                    + Edit Prescriptions →
                  </button>
                </div>
                {selectedProfile.medicalRecords.map((m) => (
                  <div key={m.id} className="p-4 rounded-xl border border-teal-200 bg-teal-50/30">
                    <div className="text-xs font-bold text-slate-800 mb-1">
                      Prescribed by {m.doctorName} on {m.visitDate} ({m.diagnosis})
                    </div>
                    <pre className="text-xs font-mono text-slate-800 whitespace-pre-wrap bg-white p-3 rounded-lg border border-slate-200">
                      {m.prescription}
                    </pre>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'blood' && (
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <h4 className="text-sm font-bold text-slate-800">Laboratory & Blood Test Reports</h4>
                  <button
                    onClick={() => onNavigateModule('lab')}
                    className="text-xs font-semibold text-teal-700 hover:underline cursor-pointer"
                  >
                    + Order / Edit / Verify Blood Reports →
                  </button>
                </div>
                {selectedProfile.labReports.map((l) => (
                  <div key={l.id} className="p-3.5 rounded-xl border border-slate-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                    <div>
                      <div className="text-xs font-bold text-slate-900">
                        {l.reportUid} — {l.testName} ({l.testCategory})
                      </div>
                      <div className="text-xs text-slate-700 mt-0.5">
                        Result: <strong>{l.resultValue} {l.unit}</strong> (Ref: {l.referenceRange})
                      </div>
                      <div className="text-[11px] text-slate-500">
                        Ordered: {l.orderedDate} | Verified By: {l.verifiedBy || 'Pending Verification'}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-teal-100 text-teal-800">
                        {l.status}
                      </span>
                      {l.id && (
                        <a
                          href={api.getPdfDownloadUrl(l.id)}
                          target="_blank"
                          rel="noreferrer"
                          className="px-3 py-1.5 rounded-lg bg-slate-900 text-white text-xs font-semibold flex items-center gap-1 hover:bg-slate-700"
                        >
                          <Download className="w-3.5 h-3.5" /> PDF
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'diagnostic' && (
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <h4 className="text-sm font-bold text-slate-800">Diagnostic Imaging & Orthopaedic Evaluations</h4>
                  <button
                    onClick={() => onNavigateModule('imaging')}
                    className="text-xs font-semibold text-teal-700 hover:underline cursor-pointer"
                  >
                    + Edit Imaging / Ortho Reports →
                  </button>
                </div>
                {selectedProfile.imagingReports.map((img) => (
                  <div key={img.id} className="p-3.5 rounded-xl border border-slate-200">
                    <div className="text-xs font-bold text-slate-900">
                      {img.imagingUid} • {img.modality} — {img.bodyPart} ({img.scanDate})
                    </div>
                    <div className="text-xs text-slate-600 mt-1"><strong>Findings:</strong> {img.findings}</div>
                    <div className="text-xs text-teal-800 font-semibold mt-0.5"><strong>Impression:</strong> {img.impression}</div>
                  </div>
                ))}
                {selectedProfile.orthoCases.map((o) => (
                  <div key={o.id} className="p-3.5 rounded-xl border border-sky-200 bg-sky-50/40">
                    <div className="text-xs font-bold text-sky-900">
                      {o.caseUid} • Orthopaedic {o.subSpecialty} — {o.affectedSite}
                    </div>
                    <div className="text-xs text-slate-700 mt-1">
                      <strong>Plan:</strong> {o.treatmentPlan} | <strong>Implant:</strong> {o.implantOrFixation}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'admissions' && (
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <h4 className="text-sm font-bold text-slate-800">Inpatient Admissions & Discharge Summaries</h4>
                  <button
                    onClick={() => onNavigateModule('admissions')}
                    className="text-xs font-semibold text-teal-700 hover:underline cursor-pointer"
                  >
                    + Manage Admissions & Beds →
                  </button>
                </div>
                {selectedProfile.admissions.map((adm) => (
                  <div key={adm.id} className="p-3.5 rounded-xl border border-slate-200">
                    <div className="flex justify-between">
                      <span className="text-xs font-bold text-slate-900">
                        {adm.admissionUid} • Bed {adm.bedNumber} ({adm.wardName})
                      </span>
                      <span className="text-xs font-bold text-indigo-700">{adm.status}</span>
                    </div>
                    <div className="text-xs text-slate-600 mt-1">
                      Admitted: {adm.admissionDate} | Discharged: {adm.dischargeDate || 'Currently Admitted'}
                    </div>
                    <div className="text-xs text-slate-700 mt-1">
                      <strong>Diagnosis:</strong> {adm.diagnosisOnAdmission} — {adm.dischargeSummary}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'surgeries' && (
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <h4 className="text-sm font-bold text-slate-800">Surgical Procedures & Anaesthesia Records</h4>
                  <button
                    onClick={() => onNavigateModule('surgeries')}
                    className="text-xs font-semibold text-teal-700 hover:underline cursor-pointer"
                  >
                    + Edit OT Surgeries →
                  </button>
                </div>
                {selectedProfile.surgeries.map((s) => (
                  <div key={s.id} className="p-3.5 rounded-xl border border-slate-200">
                    <div className="flex justify-between">
                      <span className="text-xs font-bold text-slate-900">{s.surgeryUid} — {s.procedureName}</span>
                      <span className="text-xs font-bold text-purple-700">{s.status}</span>
                    </div>
                    <div className="text-xs text-slate-600 mt-1">
                      Surgeon: {s.leadSurgeonName} | Anaesthetist: {s.anaesthetistName} ({s.anaesthesiaType}) | {s.operationTheatre}
                    </div>
                    <div className="text-xs text-slate-700 mt-1">{s.operativeNotes}</div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'billing' && (
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <h4 className="text-sm font-bold text-slate-800">Patient Invoices & Payment History</h4>
                  <button
                    onClick={() => onNavigateModule('billing')}
                    className="text-xs font-semibold text-teal-700 hover:underline cursor-pointer"
                  >
                    + Create / Edit Invoices →
                  </button>
                </div>
                {selectedProfile.invoices.map((inv) => (
                  <div key={inv.id} className="p-3.5 rounded-xl border border-slate-200 flex justify-between items-center">
                    <div>
                      <div className="text-xs font-bold text-slate-900">
                        {inv.invoiceUid} • {inv.billingCategory} ({inv.billingDate})
                      </div>
                      <div className="text-xs text-slate-600">{inv.description}</div>
                    </div>
                    <div className="text-right text-xs">
                      <div>Total: <strong>₹{inv.totalAmount?.toLocaleString('en-IN')}</strong></div>
                      <div className="text-emerald-700">Paid: ₹{inv.paidAmount?.toLocaleString('en-IN')}</div>
                      <div className="text-rose-600 font-bold">Balance: ₹{inv.balanceAmount?.toLocaleString('en-IN')}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'followups' && (
              <div className="space-y-3">
                <h4 className="text-sm font-bold text-slate-800">Scheduled Follow-Up Plan & Rehabilitation</h4>
                {selectedProfile.medicalRecords.map((m) => (
                  <div key={m.id} className="p-3.5 rounded-xl border border-slate-200 flex justify-between items-center">
                    <div>
                      <div className="text-xs font-bold text-slate-900">
                        Next Follow-Up Date: <span className="text-teal-700">{m.followUpDate || 'As Required'}</span>
                      </div>
                      <div className="text-xs text-slate-600 mt-0.5">
                        Instructions: {m.followUpInstructions} (Advisor: {m.doctorName})
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* CREATE / EDIT PATIENT MODAL */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-3xl w-full p-6 shadow-2xl border border-slate-200 my-8">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200">
              <h3 className="text-lg font-bold text-slate-900">
                {editingPatient.id ? `Edit Patient — ${editingPatient.patientUid}` : 'Register New Patient — Mahalakshmi Hospital'}
              </h3>
              <button onClick={() => setShowModal(false)} className="p-1 rounded-lg hover:bg-slate-100 cursor-pointer">
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>

            <form onSubmit={handleSave} className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div className="md:col-span-2">
                <label className="font-semibold text-slate-700 block mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  value={editingPatient.fullName}
                  onChange={(e) => setEditingPatient({ ...editingPatient, fullName: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300"
                />
              </div>
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Patient Status</label>
                <select
                  value={editingPatient.status}
                  onChange={(e) => setEditingPatient({ ...editingPatient, status: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white"
                >
                  <option value="OUTPATIENT">OUTPATIENT</option>
                  <option value="ADMITTED">ADMITTED</option>
                  <option value="EMERGENCY">EMERGENCY</option>
                  <option value="DISCHARGED">DISCHARGED</option>
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Date of Birth</label>
                <input
                  type="date"
                  value={editingPatient.dateOfBirth}
                  onChange={(e) => handleDobChange(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300"
                />
              </div>
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Age (Years)</label>
                <input
                  type="number"
                  value={editingPatient.age}
                  onChange={(e) => setEditingPatient({ ...editingPatient, age: Number(e.target.value) })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300"
                />
              </div>
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Gender & Blood Group</label>
                <div className="flex gap-2">
                  <select
                    value={editingPatient.gender}
                    onChange={(e) => setEditingPatient({ ...editingPatient, gender: e.target.value })}
                    className="w-1/2 px-2 py-2 rounded-xl border border-slate-300 bg-white"
                  >
                    <option>Male</option>
                    <option>Female</option>
                    <option>Other</option>
                  </select>
                  <select
                    value={editingPatient.bloodGroup}
                    onChange={(e) => setEditingPatient({ ...editingPatient, bloodGroup: e.target.value })}
                    className="w-1/2 px-2 py-2 rounded-xl border border-slate-300 bg-white"
                  >
                    {['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'].map((bg) => (
                      <option key={bg}>{bg}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Contact Number *</label>
                <input
                  type="text"
                  required
                  value={editingPatient.phone}
                  onChange={(e) => setEditingPatient({ ...editingPatient, phone: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300"
                />
              </div>
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Hospital Service</label>
                <select
                  value={editingPatient.primaryService}
                  onChange={(e) => setEditingPatient({ ...editingPatient, primaryService: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white"
                >
                  {HOSPITAL_SERVICES.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Assigned Consultant</label>
                <select
                  value={editingPatient.assignedDoctorName}
                  onChange={(e) => setEditingPatient({ ...editingPatient, assignedDoctorName: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white"
                >
                  {doctors.map((d) => (
                    <option key={d.id} value={d.fullName}>{d.fullName} ({d.department})</option>
                  ))}
                </select>
              </div>

              <div className="md:col-span-3">
                <label className="font-semibold text-slate-700 block mb-1">Residential Address</label>
                <input
                  type="text"
                  value={editingPatient.address}
                  onChange={(e) => setEditingPatient({ ...editingPatient, address: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Emergency Contact Name</label>
                <input
                  type="text"
                  value={editingPatient.emergencyContactName}
                  onChange={(e) => setEditingPatient({ ...editingPatient, emergencyContactName: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300"
                />
              </div>
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Emergency Contact Phone</label>
                <input
                  type="text"
                  value={editingPatient.emergencyContactPhone}
                  onChange={(e) => setEditingPatient({ ...editingPatient, emergencyContactPhone: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300"
                />
              </div>
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Registration Date</label>
                <input
                  type="date"
                  value={editingPatient.registrationDate}
                  onChange={(e) => setEditingPatient({ ...editingPatient, registrationDate: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300"
                />
              </div>

              <div className="md:col-span-3">
                <label className="font-semibold text-slate-700 block mb-1">Known Drug / Food Allergies</label>
                <input
                  type="text"
                  value={editingPatient.allergies}
                  onChange={(e) => setEditingPatient({ ...editingPatient, allergies: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300"
                />
              </div>

              <div className="md:col-span-3">
                <label className="font-semibold text-slate-700 block mb-1">Medical & Surgical History</label>
                <textarea
                  rows={2}
                  value={editingPatient.medicalHistory}
                  onChange={(e) => setEditingPatient({ ...editingPatient, medicalHistory: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300"
                />
              </div>

              <div className="md:col-span-3 flex justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-semibold shadow cursor-pointer"
                >
                  {saving ? 'Saving...' : editingPatient.id ? 'Save Patient Changes' : 'Complete Registration'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
