import React, { useEffect, useState } from 'react';
import {
  Plus, Edit3, Trash2, X, BedDouble, FlaskConical, Upload, Download,
  CheckCircle2, ScanLine, IndianRupee, Pill, LogOut
} from 'lucide-react';
import { api } from '../services/api';
import {
  WardBed, Admission, LabReport, DiagnosticImaging, Invoice,
  PharmacyItem, Patient, Doctor, UserAccount, HOSPITAL_SERVICES
} from '../types/hms';

interface OpsProps {
  patients: Patient[];
  doctors: Doctor[];
  currentUser: UserAccount;
  onRefreshGlobal: () => void;
}

// ============================================================================
// MODULE 6 & 7: PATIENT ADMISSION, DISCHARGE & WARD / BED MANAGEMENT
// ============================================================================
export const AdmissionBedModule: React.FC<OpsProps> = ({ patients, doctors, onRefreshGlobal }) => {
  const [beds, setBeds] = useState<WardBed[]>([]);
  const [admissions, setAdmissions] = useState<Admission[]>([]);
  const [bedModal, setBedModal] = useState(false);
  const [editingBed, setEditingBed] = useState<WardBed>({
    bedNumber: 'ORT-105',
    wardName: 'Orthopaedic Ward',
    bedType: 'Standard Ortho Bed',
    floor: '1st Floor',
    status: 'AVAILABLE',
    dailyCharge: 1800,
    notes: 'Ready',
  });

  const [admModal, setAdmModal] = useState(false);
  const [editingAdm, setEditingAdm] = useState<Admission>({
    patientId: patients[0]?.id,
    patientName: patients[0]?.fullName || '',
    doctorName: doctors[0]?.fullName || 'Dr. K. Venkata Rama Rao',
    department: 'Orthopaedics',
    bedId: undefined,
    bedNumber: 'ORT-103',
    wardName: 'Orthopaedic Ward',
    admissionReason: '',
    diagnosisOnAdmission: '',
    dischargeSummary: '',
    dischargeMedications: '',
    status: 'ADMITTED',
    admissionDate: new Date().toISOString().split('T')[0],
  });

  const load = async () => {
    const [bList, aList] = await Promise.all([
      api.get<WardBed[]>('/beds'),
      api.get<Admission[]>('/admissions'),
    ]);
    setBeds(bList);
    setAdmissions(aList);
  };

  useEffect(() => { load(); }, []);

  const saveBed = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingBed.id) {
      await api.put(`/beds/${editingBed.id}`, editingBed);
    } else {
      await api.post('/beds', editingBed);
    }
    setBedModal(false);
    await load();
    onRefreshGlobal();
  };

  const deleteBed = async (id?: number) => {
    if (!id || !window.confirm('Delete this ward bed?')) return;
    await api.delete(`/beds/${id}`);
    await load();
    onRefreshGlobal();
  };

  const saveAdmission = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingAdm.id) {
      await api.put(`/admissions/${editingAdm.id}`, editingAdm);
    } else {
      await api.post('/admissions', editingAdm);
    }
    setAdmModal(false);
    await load();
    onRefreshGlobal();
  };

  const handleDischarge = async (adm: Admission) => {
    if (!adm.id) return;
    const summary = window.prompt('Enter Discharge Summary / Clinical Outcome:', adm.dischargeSummary || 'Discharged in stable condition.');
    if (summary === null) return;
    await api.put(`/admissions/${adm.id}/discharge`, {
      dischargeSummary: summary,
      dischargeMedications: adm.dischargeMedications || 'Continue prescribed oral medications for 7 days.',
    });
    await load();
    onRefreshGlobal();
  };

  const deleteAdmission = async (id?: number) => {
    if (!id || !window.confirm('Delete this admission record?')) return;
    await api.delete(`/admissions/${id}`);
    await load();
    onRefreshGlobal();
  };

  return (
    <div className="space-y-6">
      {/* Interactive Bed & Ward Grid */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <BedDouble className="w-5 h-5 text-teal-600" /> Ward & Bed Management Grid
            </h2>
            <p className="text-xs text-slate-500">Click any bed to edit its status, daily charge, or patient assignment.</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => {
                setEditingBed({
                  bedNumber: `ORT-${101 + beds.length}`,
                  wardName: 'Orthopaedic Ward',
                  bedType: 'Standard Ortho Bed',
                  floor: '1st Floor',
                  status: 'AVAILABLE',
                  dailyCharge: 1800,
                  notes: 'Sanitized & Ready',
                });
                setBedModal(true);
              }}
              className="px-3.5 py-2 rounded-xl bg-slate-900 text-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" /> + Add Ward Bed
            </button>
            <button
              onClick={() => {
                const availBed = beds.find((b) => b.status === 'AVAILABLE') || beds[0];
                setEditingAdm({
                  patientId: patients[0]?.id,
                  patientName: patients[0]?.fullName || '',
                  doctorName: doctors[0]?.fullName || 'Dr. K. Venkata Rama Rao',
                  department: 'Orthopaedics',
                  bedId: availBed?.id,
                  bedNumber: availBed?.bedNumber || 'ORT-103',
                  wardName: availBed?.wardName || 'Orthopaedic Ward',
                  admissionReason: '',
                  diagnosisOnAdmission: '',
                  dischargeSummary: '',
                  dischargeMedications: '',
                  status: 'ADMITTED',
                  admissionDate: new Date().toISOString().split('T')[0],
                });
                setAdmModal(true);
              }}
              className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" /> + New IPD Admission
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {beds.map((b) => {
            const isOcc = b.status === 'OCCUPIED';
            const isAvail = b.status === 'AVAILABLE';
            return (
              <div
                key={b.id}
                className={`p-3.5 rounded-2xl border-2 transition flex flex-col justify-between ${
                  isOcc
                    ? 'border-indigo-300 bg-indigo-50/40'
                    : isAvail
                    ? 'border-emerald-300 bg-emerald-50/40'
                    : 'border-amber-300 bg-amber-50/40'
                }`}
              >
                <div>
                  <div className="flex justify-between items-center">
                    <span className="font-mono font-extrabold text-sm text-slate-900">{b.bedNumber}</span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        isOcc ? 'bg-indigo-600 text-white' : isAvail ? 'bg-emerald-600 text-white' : 'bg-amber-500 text-white'
                      }`}
                    >
                      {b.status}
                    </span>
                  </div>
                  <div className="text-xs font-bold text-slate-700 mt-1">{b.wardName}</div>
                  <div className="text-[11px] text-slate-500">{b.bedType} • {b.floor} • ₹{b.dailyCharge}/day</div>
                  {b.currentPatientName ? (
                    <div className="mt-2 p-2 rounded-lg bg-white border border-indigo-200 text-xs">
                      <div className="font-bold text-indigo-950">{b.currentPatientName}</div>
                      <div className="text-[11px] text-slate-500">{b.currentPatientUid}</div>
                    </div>
                  ) : (
                    <div className="mt-2 text-[11px] text-emerald-800 italic">{b.notes || 'Ready for admission'}</div>
                  )}
                </div>
                <div className="mt-3 pt-2 border-t border-slate-200/70 flex justify-end gap-1.5">
                  <button
                    onClick={() => { setEditingBed({ ...b }); setBedModal(true); }}
                    className="px-2 py-1 rounded bg-white border border-slate-300 text-[11px] font-semibold flex items-center gap-1 cursor-pointer"
                  >
                    <Edit3 className="w-3 h-3" /> Edit Bed
                  </button>
                  <button
                    onClick={() => deleteBed(b.id)}
                    className="p-1 rounded bg-white border border-slate-300 text-rose-600 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Inpatient Admissions & Discharge Table */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-4">
        <h3 className="text-lg font-bold text-slate-900">Inpatient (IPD) Admissions & Discharge Register</h3>
        <div className="space-y-3">
          {admissions.map((a) => (
            <div key={a.id} className="p-4 rounded-xl border border-slate-200 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
              <div className="text-xs space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-teal-700">{a.admissionUid}</span>
                  <span className="px-2.5 py-0.5 rounded-full bg-indigo-100 text-indigo-900 font-bold">
                    Bed {a.bedNumber} ({a.wardName})
                  </span>
                  <span className={`px-2.5 py-0.5 rounded-full font-bold ${a.status === 'ADMITTED' ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'}`}>
                    {a.status}
                  </span>
                </div>
                <div className="text-sm font-bold text-slate-900">
                  {a.patientName} ({a.patientUid}) — Consultant: {a.doctorName} ({a.department})
                </div>
                <div className="text-slate-600">
                  <strong>Diagnosis on Admission:</strong> {a.diagnosisOnAdmission} | <strong>Reason:</strong> {a.admissionReason}
                </div>
                <div className="text-slate-700">
                  <strong>Clinical Course / Discharge Summary:</strong> {a.dischargeSummary}
                </div>
                <div className="text-teal-800">
                  <strong>Medications:</strong> {a.dischargeMedications}
                </div>
                <div className="text-slate-400">
                  Admitted: {a.admissionDate} {a.dischargeDate ? `• Discharged: ${a.dischargeDate}` : ''}
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-2 shrink-0">
                {a.status === 'ADMITTED' && (
                  <button
                    onClick={() => handleDischarge(a)}
                    className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center gap-1 cursor-pointer"
                  >
                    <LogOut className="w-3.5 h-3.5" /> Discharge Patient
                  </button>
                )}
                <button
                  onClick={() => { setEditingAdm({ ...a }); setAdmModal(true); }}
                  className="px-3 py-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 text-xs font-semibold flex items-center gap-1 cursor-pointer"
                >
                  <Edit3 className="w-3.5 h-3.5" /> Edit Admission
                </button>
                <button
                  onClick={() => deleteAdmission(a.id)}
                  className="p-1.5 rounded-lg bg-slate-100 hover:bg-rose-100 text-rose-600 cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Bed Edit Modal */}
      {bedModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl">
            <div className="flex justify-between items-center pb-3 border-b">
              <h3 className="text-lg font-bold">{editingBed.id ? `Edit Ward Bed ${editingBed.bedNumber}` : 'Add Ward Bed'}</h3>
              <button onClick={() => setBedModal(false)} className="cursor-pointer"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={saveBed} className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="font-semibold block mb-1">Bed Number *</label>
                <input type="text" required value={editingBed.bedNumber} onChange={(e) => setEditingBed({ ...editingBed, bedNumber: e.target.value })} className="w-full px-3 py-2 rounded-xl border border-slate-300" />
              </div>
              <div>
                <label className="font-semibold block mb-1">Ward Name *</label>
                <input type="text" required value={editingBed.wardName} onChange={(e) => setEditingBed({ ...editingBed, wardName: e.target.value })} className="w-full px-3 py-2 rounded-xl border border-slate-300" />
              </div>
              <div>
                <label className="font-semibold block mb-1">Bed Type</label>
                <input type="text" value={editingBed.bedType} onChange={(e) => setEditingBed({ ...editingBed, bedType: e.target.value })} className="w-full px-3 py-2 rounded-xl border border-slate-300" />
              </div>
              <div>
                <label className="font-semibold block mb-1">Floor</label>
                <input type="text" value={editingBed.floor} onChange={(e) => setEditingBed({ ...editingBed, floor: e.target.value })} className="w-full px-3 py-2 rounded-xl border border-slate-300" />
              </div>
              <div>
                <label className="font-semibold block mb-1">Status</label>
                <select value={editingBed.status} onChange={(e) => setEditingBed({ ...editingBed, status: e.target.value })} className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white">
                  <option value="AVAILABLE">AVAILABLE</option>
                  <option value="OCCUPIED">OCCUPIED</option>
                  <option value="MAINTENANCE">MAINTENANCE</option>
                </select>
              </div>
              <div>
                <label className="font-semibold block mb-1">Daily Tariff (₹)</label>
                <input type="number" value={editingBed.dailyCharge} onChange={(e) => setEditingBed({ ...editingBed, dailyCharge: Number(e.target.value) })} className="w-full px-3 py-2 rounded-xl border border-slate-300" />
              </div>
              <div className="sm:col-span-2">
                <label className="font-semibold block mb-1">Notes</label>
                <input type="text" value={editingBed.notes} onChange={(e) => setEditingBed({ ...editingBed, notes: e.target.value })} className="w-full px-3 py-2 rounded-xl border border-slate-300" />
              </div>
              <div className="sm:col-span-2 flex justify-end gap-2 pt-3 border-t">
                <button type="button" onClick={() => setBedModal(false)} className="px-4 py-2 rounded-xl border cursor-pointer">Cancel</button>
                <button type="submit" className="px-5 py-2 rounded-xl bg-teal-600 text-white font-semibold cursor-pointer">Save Bed</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Admission Edit Modal */}
      {admModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl my-8">
            <div className="flex justify-between items-center pb-3 border-b">
              <h3 className="text-lg font-bold">{editingAdm.id ? 'Edit Inpatient Admission' : 'New Inpatient Admission'}</h3>
              <button onClick={() => setAdmModal(false)} className="cursor-pointer"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={saveAdmission} className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="font-semibold block mb-1">Patient *</label>
                <select
                  value={editingAdm.patientId || ''}
                  onChange={(e) => {
                    const pid = Number(e.target.value);
                    const p = patients.find((x) => x.id === pid);
                    setEditingAdm({ ...editingAdm, patientId: pid, patientName: p?.fullName || editingAdm.patientName });
                  }}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white"
                >
                  {patients.map((p) => <option key={p.id} value={p.id}>{p.fullName} ({p.patientUid})</option>)}
                </select>
              </div>
              <div>
                <label className="font-semibold block mb-1">Assign Ward Bed *</label>
                <select
                  value={editingAdm.bedId || ''}
                  onChange={(e) => {
                    const bid = Number(e.target.value);
                    const b = beds.find((x) => x.id === bid);
                    setEditingAdm({
                      ...editingAdm,
                      bedId: bid,
                      bedNumber: b?.bedNumber || editingAdm.bedNumber,
                      wardName: b?.wardName || editingAdm.wardName,
                    });
                  }}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white"
                >
                  {beds.map((b) => (
                    <option key={b.id} value={b.id}>{b.bedNumber} — {b.wardName} ({b.status})</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="font-semibold block mb-1">Attending Consultant</label>
                <select value={editingAdm.doctorName} onChange={(e) => setEditingAdm({ ...editingAdm, doctorName: e.target.value })} className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white">
                  {doctors.map((d) => <option key={d.id} value={d.fullName}>{d.fullName}</option>)}
                </select>
              </div>
              <div>
                <label className="font-semibold block mb-1">Department & Status</label>
                <div className="flex gap-2">
                  <select value={editingAdm.department} onChange={(e) => setEditingAdm({ ...editingAdm, department: e.target.value })} className="w-1/2 px-2 py-2 rounded-xl border border-slate-300 bg-white">
                    {HOSPITAL_SERVICES.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                  <select value={editingAdm.status} onChange={(e) => setEditingAdm({ ...editingAdm, status: e.target.value })} className="w-1/2 px-2 py-2 rounded-xl border border-slate-300 bg-white">
                    <option value="ADMITTED">ADMITTED</option>
                    <option value="DISCHARGED">DISCHARGED</option>
                  </select>
                </div>
              </div>
              <div className="sm:col-span-2">
                <label className="font-semibold block mb-1">Admission Reason</label>
                <input type="text" required value={editingAdm.admissionReason} onChange={(e) => setEditingAdm({ ...editingAdm, admissionReason: e.target.value })} className="w-full px-3 py-2 rounded-xl border border-slate-300" />
              </div>
              <div className="sm:col-span-2">
                <label className="font-semibold block mb-1">Diagnosis on Admission</label>
                <input type="text" required value={editingAdm.diagnosisOnAdmission} onChange={(e) => setEditingAdm({ ...editingAdm, diagnosisOnAdmission: e.target.value })} className="w-full px-3 py-2 rounded-xl border border-slate-300" />
              </div>
              <div className="sm:col-span-2">
                <label className="font-semibold block mb-1">Inpatient Progress / Discharge Summary</label>
                <textarea rows={2} value={editingAdm.dischargeSummary} onChange={(e) => setEditingAdm({ ...editingAdm, dischargeSummary: e.target.value })} className="w-full px-3 py-2 rounded-xl border border-slate-300" />
              </div>
              <div className="sm:col-span-2">
                <label className="font-semibold block mb-1">Inpatient / Discharge Medications</label>
                <input type="text" value={editingAdm.dischargeMedications} onChange={(e) => setEditingAdm({ ...editingAdm, dischargeMedications: e.target.value })} className="w-full px-3 py-2 rounded-xl border border-slate-300" />
              </div>
              <div className="sm:col-span-2 flex justify-end gap-2 pt-3 border-t">
                <button type="button" onClick={() => setAdmModal(false)} className="px-4 py-2 rounded-xl border cursor-pointer">Cancel</button>
                <button type="submit" className="px-5 py-2 rounded-xl bg-teal-600 text-white font-semibold cursor-pointer">Save Admission</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

// ============================================================================
// MODULE 8: LABORATORY & BLOOD REPORT MANAGEMENT
// ============================================================================
export const LabReportModule: React.FC<OpsProps> = ({ patients, doctors, currentUser, onRefreshGlobal }) => {
  const [reports, setReports] = useState<LabReport[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<LabReport>({
    patientId: patients[0]?.id,
    patientName: patients[0]?.fullName || '',
    orderedByDoctorName: doctors[0]?.fullName || 'Dr. K. Venkata Rama Rao',
    testName: 'Complete Blood Picture (CBP)',
    testCategory: 'Hematology',
    sampleType: 'Whole Blood (EDTA)',
    resultValue: '',
    unit: 'g/dL',
    referenceRange: '13.0 - 17.0 g/dL',
    abnormal: false,
    status: 'PENDING',
    technicianName: 'V. Satyanarayana',
    orderedDate: new Date().toISOString().split('T')[0],
    testCost: 450,
    clinicalRemarks: '',
  });

  const canVerify = ['OWNER', 'ADMIN', 'DOCTOR', 'LAB_TECH'].includes(currentUser.role);

  const load = async () => setReports(await api.get<LabReport[]>('/lab-reports'));
  useEffect(() => { load(); }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editing.id) {
      await api.put(`/lab-reports/${editing.id}`, editing);
    } else {
      await api.post('/lab-reports', editing);
    }
    setModalOpen(false);
    await load();
    onRefreshGlobal();
  };

  const handleVerify = async (r: LabReport) => {
    if (!r.id) return;
    await api.put(`/lab-reports/${r.id}/verify`, { verifiedBy: currentUser.fullName });
    await load();
    onRefreshGlobal();
  };

  const handlePdfUpload = async (reportId: number, file: File) => {
    await api.uploadFile(`/lab-reports/${reportId}/upload-pdf`, file);
    await load();
  };

  const handleDelete = async (id?: number) => {
    if (!id || !window.confirm('Delete this blood / lab report?')) return;
    await api.delete(`/lab-reports/${id}`);
    await load();
    onRefreshGlobal();
  };

  return (
    <div className="space-y-5">
      <div className="bg-white rounded-2xl p-5 border border-slate-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <FlaskConical className="w-5 h-5 text-teal-600" /> Clinical Laboratory & Blood Report Management
          </h2>
          <p className="text-xs text-slate-500">
            Create lab test orders, record results, units & reference ranges, upload/download PDFs, and verify clinical results.
          </p>
        </div>
        <button
          onClick={() => {
            setEditing({
              patientId: patients[0]?.id,
              patientName: patients[0]?.fullName || '',
              orderedByDoctorName: doctors[0]?.fullName || 'Dr. K. Venkata Rama Rao',
              testName: '',
              testCategory: 'Hematology',
              sampleType: 'Whole Blood (EDTA)',
              resultValue: '',
              unit: 'mg/dL',
              referenceRange: '70 - 110 mg/dL',
              abnormal: false,
              status: 'PENDING',
              technicianName: 'V. Satyanarayana',
              orderedDate: new Date().toISOString().split('T')[0],
              testCost: 500,
              clinicalRemarks: '',
            });
            setModalOpen(true);
          }}
          className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
        >
          <Plus className="w-4 h-4" /> + Create Lab Test Order
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {reports.map((r) => (
          <div key={r.id} className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="space-y-1 text-xs">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-mono font-bold text-teal-700">{r.reportUid}</span>
                <span className="px-2.5 py-0.5 rounded-full bg-sky-100 text-sky-900 font-bold">{r.testCategory}</span>
                <span className={`px-2.5 py-0.5 rounded-full font-bold ${
                  r.status === 'VERIFIED' ? 'bg-emerald-100 text-emerald-800' : r.status === 'COMPLETED' ? 'bg-blue-100 text-blue-800' : 'bg-amber-100 text-amber-800'
                }`}>
                  {r.status}
                </span>
                {r.abnormal && (
                  <span className="px-2 py-0.5 rounded bg-rose-100 text-rose-800 font-bold border border-rose-300">
                    ABNORMAL FLAG
                  </span>
                )}
              </div>
              <h3 className="text-base font-bold text-slate-900">{r.testName}</h3>
              <div className="text-slate-700">
                Patient: <strong>{r.patientName}</strong> ({r.patientUid}) | Ordered By: {r.orderedByDoctorName} | Sample: {r.sampleType}
              </div>
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 grid grid-cols-1 sm:grid-cols-3 gap-2 mt-1">
                <div><strong>Observed Result:</strong> <span className="text-teal-900 font-bold">{r.resultValue || 'Pending'}</span></div>
                <div><strong>Unit:</strong> {r.unit}</div>
                <div><strong>Reference Range:</strong> {r.referenceRange}</div>
              </div>
              <div className="text-slate-500">
                Remarks: {r.clinicalRemarks} | Technician: {r.technicianName}
                {r.verifiedBy && <span className="text-emerald-700 font-semibold"> • Verified By: {r.verifiedBy} ({r.verifiedDate})</span>}
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 shrink-0">
              {canVerify && r.status !== 'VERIFIED' && (
                <button
                  onClick={() => handleVerify(r)}
                  className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center gap-1 cursor-pointer"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" /> Verify Clinical Result
                </button>
              )}

              {r.id && (
                <label className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold flex items-center gap-1 cursor-pointer">
                  <Upload className="w-3.5 h-3.5" /> Upload PDF
                  <input
                    type="file"
                    accept="application/pdf"
                    className="hidden"
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f && r.id) handlePdfUpload(r.id, f);
                    }}
                  />
                </label>
              )}

              {r.id && (
                <a
                  href={api.getPdfDownloadUrl(r.id)}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold flex items-center gap-1"
                >
                  <Download className="w-3.5 h-3.5" /> Download PDF
                </a>
              )}

              <button
                onClick={() => { setEditing({ ...r }); setModalOpen(true); }}
                className="px-3 py-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 text-xs font-semibold flex items-center gap-1 cursor-pointer"
              >
                <Edit3 className="w-3.5 h-3.5" /> Edit Result
              </button>
              <button
                onClick={() => handleDelete(r.id)}
                className="p-1.5 rounded-lg bg-slate-100 hover:bg-rose-100 text-rose-600 cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl my-8">
            <div className="flex justify-between items-center pb-3 border-b">
              <h3 className="text-lg font-bold">{editing.id ? `Edit Lab Report — ${editing.reportUid}` : 'Create Laboratory Test Order'}</h3>
              <button onClick={() => setModalOpen(false)} className="cursor-pointer"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleSave} className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="font-semibold block mb-1">Patient *</label>
                <select
                  value={editing.patientId || ''}
                  onChange={(e) => {
                    const pid = Number(e.target.value);
                    const p = patients.find((x) => x.id === pid);
                    setEditing({ ...editing, patientId: pid, patientName: p?.fullName || editing.patientName });
                  }}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white"
                >
                  {patients.map((p) => <option key={p.id} value={p.id}>{p.fullName} ({p.patientUid})</option>)}
                </select>
              </div>
              <div>
                <label className="font-semibold block mb-1">Ordering Doctor</label>
                <select value={editing.orderedByDoctorName} onChange={(e) => setEditing({ ...editing, orderedByDoctorName: e.target.value })} className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white">
                  {doctors.map((d) => <option key={d.id} value={d.fullName}>{d.fullName}</option>)}
                </select>
              </div>
              <div>
                <label className="font-semibold block mb-1">Test Name *</label>
                <input type="text" required value={editing.testName} onChange={(e) => setEditing({ ...editing, testName: e.target.value })} className="w-full px-3 py-2 rounded-xl border border-slate-300" placeholder="e.g. Complete Blood Picture (CBP), HbA1c, RA Factor" />
              </div>
              <div>
                <label className="font-semibold block mb-1">Category & Sample Type</label>
                <div className="flex gap-2">
                  <select value={editing.testCategory} onChange={(e) => setEditing({ ...editing, testCategory: e.target.value })} className="w-1/2 px-2 py-2 rounded-xl border border-slate-300 bg-white">
                    <option>Hematology</option>
                    <option>Biochemistry</option>
                    <option>Serology</option>
                    <option>Coagulation</option>
                    <option>Microbiology</option>
                  </select>
                  <input type="text" value={editing.sampleType} onChange={(e) => setEditing({ ...editing, sampleType: e.target.value })} className="w-1/2 px-2 py-2 rounded-xl border border-slate-300" />
                </div>
              </div>
              <div>
                <label className="font-semibold block mb-1">Observed Result Value</label>
                <input type="text" value={editing.resultValue} onChange={(e) => setEditing({ ...editing, resultValue: e.target.value })} className="w-full px-3 py-2 rounded-xl border border-slate-300" />
              </div>
              <div>
                <label className="font-semibold block mb-1">Units</label>
                <input type="text" value={editing.unit} onChange={(e) => setEditing({ ...editing, unit: e.target.value })} className="w-full px-3 py-2 rounded-xl border border-slate-300" />
              </div>
              <div>
                <label className="font-semibold block mb-1">Biological Reference Range</label>
                <input type="text" value={editing.referenceRange} onChange={(e) => setEditing({ ...editing, referenceRange: e.target.value })} className="w-full px-3 py-2 rounded-xl border border-slate-300" />
              </div>
              <div>
                <label className="font-semibold block mb-1">Report Status & Abnormal Flag</label>
                <div className="flex gap-2 items-center">
                  <select value={editing.status} onChange={(e) => setEditing({ ...editing, status: e.target.value })} className="w-1/2 px-2 py-2 rounded-xl border border-slate-300 bg-white">
                    <option value="PENDING">PENDING</option>
                    <option value="COMPLETED">COMPLETED</option>
                    <option value="VERIFIED">VERIFIED</option>
                  </select>
                  <label className="flex items-center gap-1.5 font-semibold text-rose-700 cursor-pointer">
                    <input type="checkbox" checked={editing.abnormal} onChange={(e) => setEditing({ ...editing, abnormal: e.target.checked })} />
                    Abnormal Result
                  </label>
                </div>
              </div>
              <div className="sm:col-span-2">
                <label className="font-semibold block mb-1">Clinical Remarks / Pathologist Interpretation</label>
                <input type="text" value={editing.clinicalRemarks} onChange={(e) => setEditing({ ...editing, clinicalRemarks: e.target.value })} className="w-full px-3 py-2 rounded-xl border border-slate-300" />
              </div>
              <div className="sm:col-span-2 flex justify-end gap-2 pt-3 border-t">
                <button type="button" onClick={() => setModalOpen(false)} className="px-4 py-2 rounded-xl border cursor-pointer">Cancel</button>
                <button type="submit" className="px-5 py-2 rounded-xl bg-teal-600 text-white font-semibold cursor-pointer">Save Lab Report</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

// ============================================================================
// MODULE 9: DIAGNOSTIC IMAGING (Digital X-Ray, MRI 1.5T, CT, Ultrasound, DEXA)
// ============================================================================
export const ImagingModule: React.FC<OpsProps> = ({ patients, doctors, onRefreshGlobal }) => {
  const [scans, setScans] = useState<DiagnosticImaging[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<DiagnosticImaging>({
    patientId: patients[0]?.id,
    patientName: patients[0]?.fullName || '',
    orderedByDoctorName: doctors[0]?.fullName || 'Dr. K. Venkata Rama Rao',
    modality: 'Digital X-Ray',
    bodyPart: 'Right Knee AP & Lateral',
    findings: '',
    impression: '',
    status: 'REPORT_READY',
    radiologistName: 'Dr. Ch. Aparna Priya',
    scanDate: new Date().toISOString().split('T')[0],
    cost: 800,
  });

  const load = async () => setScans(await api.get<DiagnosticImaging[]>('/imaging'));
  useEffect(() => { load(); }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editing.id) {
      await api.put(`/imaging/${editing.id}`, editing);
    } else {
      await api.post('/imaging', editing);
    }
    setModalOpen(false);
    await load();
    onRefreshGlobal();
  };

  const handleDelete = async (id?: number) => {
    if (!id || !window.confirm('Delete this imaging scan?')) return;
    await api.delete(`/imaging/${id}`);
    await load();
    onRefreshGlobal();
  };

  return (
    <div className="space-y-5">
      <div className="bg-white rounded-2xl p-5 border border-slate-200 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <ScanLine className="w-5 h-5 text-teal-600" /> Diagnostic Imaging & Radiology Centre
          </h2>
          <p className="text-xs text-slate-500">Digital X-Ray, 1.5T MRI, CT Scan, Ultrasound & DEXA Bone Densitometry reports.</p>
        </div>
        <button
          onClick={() => {
            setEditing({
              patientId: patients[0]?.id,
              patientName: patients[0]?.fullName || '',
              orderedByDoctorName: doctors[0]?.fullName || 'Dr. K. Venkata Rama Rao',
              modality: 'Digital X-Ray',
              bodyPart: '',
              findings: '',
              impression: '',
              status: 'ORDERED',
              radiologistName: 'Dr. Ch. Aparna Priya',
              scanDate: new Date().toISOString().split('T')[0],
              cost: 800,
            });
            setModalOpen(true);
          }}
          className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
        >
          <Plus className="w-4 h-4" /> + Order Imaging Scan
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {scans.map((s) => (
          <div key={s.id} className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-2 text-xs">
            <div className="flex justify-between items-start">
              <div>
                <span className="font-mono font-bold text-teal-700">{s.imagingUid}</span>
                <span className="ml-2 px-2.5 py-0.5 rounded-full bg-sky-100 text-sky-900 font-bold">{s.modality}</span>
                <h3 className="text-base font-bold text-slate-900 mt-1">{s.bodyPart} — {s.patientName}</h3>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="px-2.5 py-1 rounded-full bg-teal-50 text-teal-800 font-bold">{s.status}</span>
                <button onClick={() => { setEditing({ ...s }); setModalOpen(true); }} className="p-1.5 rounded-lg bg-slate-100 hover:bg-amber-100 cursor-pointer"><Edit3 className="w-4 h-4" /></button>
                <button onClick={() => handleDelete(s.id)} className="p-1.5 rounded-lg bg-slate-100 hover:bg-rose-100 cursor-pointer"><Trash2 className="w-4 h-4" /></button>
              </div>
            </div>
            <div><strong>Radiological Findings:</strong> {s.findings}</div>
            <div className="p-2.5 rounded-xl bg-teal-50/60 border border-teal-200 text-teal-950 font-semibold">
              <strong>Impression:</strong> {s.impression}
            </div>
            <div className="text-slate-500 flex justify-between pt-1">
              <span>Radiologist: {s.radiologistName}</span>
              <span>Date: {s.scanDate} • ₹{s.cost}</span>
            </div>
          </div>
        ))}
      </div>

      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl">
            <div className="flex justify-between items-center pb-3 border-b">
              <h3 className="text-lg font-bold">{editing.id ? 'Edit Imaging Report' : 'Order Diagnostic Imaging'}</h3>
              <button onClick={() => setModalOpen(false)} className="cursor-pointer"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleSave} className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="font-semibold block mb-1">Patient *</label>
                <select
                  value={editing.patientId || ''}
                  onChange={(e) => {
                    const pid = Number(e.target.value);
                    const p = patients.find((x) => x.id === pid);
                    setEditing({ ...editing, patientId: pid, patientName: p?.fullName || editing.patientName });
                  }}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white"
                >
                  {patients.map((p) => <option key={p.id} value={p.id}>{p.fullName} ({p.patientUid})</option>)}
                </select>
              </div>
              <div>
                <label className="font-semibold block mb-1">Modality</label>
                <select value={editing.modality} onChange={(e) => setEditing({ ...editing, modality: e.target.value })} className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white">
                  <option>Digital X-Ray</option>
                  <option>MRI 1.5T</option>
                  <option>CT Scan</option>
                  <option>Ultrasound</option>
                  <option>DEXA Bone Densitometry</option>
                  <option>C-Arm Fluoroscopy</option>
                </select>
              </div>
              <div>
                <label className="font-semibold block mb-1">Body Part / Study *</label>
                <input type="text" required value={editing.bodyPart} onChange={(e) => setEditing({ ...editing, bodyPart: e.target.value })} className="w-full px-3 py-2 rounded-xl border border-slate-300" />
              </div>
              <div>
                <label className="font-semibold block mb-1">Status & Cost (₹)</label>
                <div className="flex gap-2">
                  <select value={editing.status} onChange={(e) => setEditing({ ...editing, status: e.target.value })} className="w-1/2 px-2 py-2 rounded-xl border border-slate-300 bg-white">
                    <option value="ORDERED">ORDERED</option>
                    <option value="IN_PROGRESS">IN_PROGRESS</option>
                    <option value="REPORT_READY">REPORT_READY</option>
                    <option value="VERIFIED">VERIFIED</option>
                  </select>
                  <input type="number" value={editing.cost} onChange={(e) => setEditing({ ...editing, cost: Number(e.target.value) })} className="w-1/2 px-2 py-2 rounded-xl border border-slate-300" />
                </div>
              </div>
              <div className="sm:col-span-2">
                <label className="font-semibold block mb-1">Radiological Findings</label>
                <textarea rows={2} value={editing.findings} onChange={(e) => setEditing({ ...editing, findings: e.target.value })} className="w-full px-3 py-2 rounded-xl border border-slate-300" />
              </div>
              <div className="sm:col-span-2">
                <label className="font-semibold block mb-1">Final Radiological Impression</label>
                <input type="text" value={editing.impression} onChange={(e) => setEditing({ ...editing, impression: e.target.value })} className="w-full px-3 py-2 rounded-xl border border-slate-300" />
              </div>
              <div className="sm:col-span-2 flex justify-end gap-2 pt-3 border-t">
                <button type="button" onClick={() => setModalOpen(false)} className="px-4 py-2 rounded-xl border cursor-pointer">Cancel</button>
                <button type="submit" className="px-5 py-2 rounded-xl bg-teal-600 text-white font-semibold cursor-pointer">Save Imaging Report</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

// ============================================================================
// MODULE 13: BILLING, INVOICES & PAYMENTS
// ============================================================================
export const BillingModule: React.FC<OpsProps> = ({ patients, onRefreshGlobal }) => {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Invoice>({
    patientId: patients[0]?.id,
    patientName: patients[0]?.fullName || '',
    billingCategory: 'OPD Consultation',
    serviceDepartment: 'Orthopaedics',
    description: '',
    subtotal: 1500,
    discount: 0,
    taxAmount: 0,
    paidAmount: 1500,
    paymentMethod: 'UPI',
    paymentStatus: 'PAID',
    billingDate: new Date().toISOString().split('T')[0],
    remarks: '',
  });

  const load = async () => setInvoices(await api.get<Invoice[]>('/invoices'));
  useEffect(() => { load(); }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editing.id) {
      await api.put(`/invoices/${editing.id}`, editing);
    } else {
      await api.post('/invoices', editing);
    }
    setModalOpen(false);
    await load();
    onRefreshGlobal();
  };

  const handleDelete = async (id?: number) => {
    if (!id || !window.confirm('Delete this invoice?')) return;
    await api.delete(`/invoices/${id}`);
    await load();
    onRefreshGlobal();
  };

  return (
    <div className="space-y-5">
      <div className="bg-white rounded-2xl p-5 border border-slate-200 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <IndianRupee className="w-5 h-5 text-teal-600" /> Hospital Billing, Invoices & Payment Collections
          </h2>
          <p className="text-xs text-slate-500">
            Generate or edit bills, record partial/full payments, discounts, and Arogyasri / Insurance settlements.
          </p>
        </div>
        <button
          onClick={() => {
            setEditing({
              patientId: patients[0]?.id,
              patientName: patients[0]?.fullName || '',
              billingCategory: 'OPD Consultation',
              serviceDepartment: 'Orthopaedics',
              description: 'Consultation + Digital X-Ray + Pharmacy',
              subtotal: 1800,
              discount: 0,
              taxAmount: 0,
              paidAmount: 1800,
              paymentMethod: 'UPI',
              paymentStatus: 'PAID',
              billingDate: new Date().toISOString().split('T')[0],
              remarks: '',
            });
            setModalOpen(true);
          }}
          className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
        >
          <Plus className="w-4 h-4" /> + Create New Invoice
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold uppercase text-slate-500">
              <th className="py-3 px-4">Invoice No & Date</th>
              <th className="py-3 px-4">Patient</th>
              <th className="py-3 px-4">Category & Description</th>
              <th className="py-3 px-4">Total (₹)</th>
              <th className="py-3 px-4">Paid (₹)</th>
              <th className="py-3 px-4">Balance Due (₹)</th>
              <th className="py-3 px-4">Status & Mode</th>
              <th className="py-3 px-4 text-right">Edit / Delete</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {invoices.map((inv) => (
              <tr key={inv.id} className="hover:bg-slate-50">
                <td className="py-3.5 px-4 font-mono font-bold text-teal-700">
                  {inv.invoiceUid}
                  <div className="text-[11px] text-slate-400 font-sans font-normal">{inv.billingDate}</div>
                </td>
                <td className="py-3.5 px-4 font-bold text-slate-900">
                  {inv.patientName}
                  <div className="text-[11px] text-slate-400 font-normal">{inv.patientUid}</div>
                </td>
                <td className="py-3.5 px-4 max-w-md">
                  <span className="font-semibold text-sky-800">{inv.billingCategory} • {inv.serviceDepartment}</span>
                  <div className="text-slate-600">{inv.description}</div>
                </td>
                <td className="py-3.5 px-4 font-bold text-slate-900">₹{inv.totalAmount?.toLocaleString('en-IN')}</td>
                <td className="py-3.5 px-4 font-bold text-emerald-700">₹{inv.paidAmount?.toLocaleString('en-IN')}</td>
                <td className="py-3.5 px-4 font-bold text-rose-600">₹{inv.balanceAmount?.toLocaleString('en-IN')}</td>
                <td className="py-3.5 px-4">
                  <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                    inv.paymentStatus === 'PAID' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                  }`}>
                    {inv.paymentStatus}
                  </span>
                  <div className="text-[11px] text-slate-500 mt-0.5">{inv.paymentMethod}</div>
                </td>
                <td className="py-3.5 px-4 text-right">
                  <div className="inline-flex gap-1.5">
                    <button onClick={() => { setEditing({ ...inv }); setModalOpen(true); }} className="px-2.5 py-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 font-semibold flex items-center gap-1 cursor-pointer">
                      <Edit3 className="w-3.5 h-3.5" /> Edit Bill
                    </button>
                    <button onClick={() => handleDelete(inv.id)} className="p-1.5 rounded-lg bg-slate-100 hover:bg-rose-100 text-rose-600 cursor-pointer"><Trash2 className="w-4 h-4" /></button>
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
              <h3 className="text-lg font-bold">{editing.id ? `Edit Invoice — ${editing.invoiceUid}` : 'Generate Hospital Invoice'}</h3>
              <button onClick={() => setModalOpen(false)} className="cursor-pointer"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleSave} className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="font-semibold block mb-1">Patient *</label>
                <select
                  value={editing.patientId || ''}
                  onChange={(e) => {
                    const pid = Number(e.target.value);
                    const p = patients.find((x) => x.id === pid);
                    setEditing({ ...editing, patientId: pid, patientName: p?.fullName || editing.patientName });
                  }}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white"
                >
                  {patients.map((p) => <option key={p.id} value={p.id}>{p.fullName} ({p.patientUid})</option>)}
                </select>
              </div>
              <div>
                <label className="font-semibold block mb-1">Billing Category</label>
                <select value={editing.billingCategory} onChange={(e) => setEditing({ ...editing, billingCategory: e.target.value })} className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white">
                  <option>OPD Consultation</option>
                  <option>IPD Admission</option>
                  <option>Orthopaedic Surgery</option>
                  <option>Lab & Blood Reports</option>
                  <option>Diagnostic Imaging</option>
                  <option>Emergency Care</option>
                  <option>Pharmacy</option>
                </select>
              </div>
              <div>
                <label className="font-semibold block mb-1">Hospital Service Department</label>
                <select value={editing.serviceDepartment} onChange={(e) => setEditing({ ...editing, serviceDepartment: e.target.value })} className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white">
                  {HOSPITAL_SERVICES.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label className="font-semibold block mb-1">Payment Mode</label>
                <select value={editing.paymentMethod} onChange={(e) => setEditing({ ...editing, paymentMethod: e.target.value })} className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white">
                  <option>UPI</option>
                  <option>Cash</option>
                  <option>Card</option>
                  <option>UPI / NEFT</option>
                  <option>Arogyasri / Insurance</option>
                </select>
              </div>
              <div className="sm:col-span-2">
                <label className="font-semibold block mb-1">Itemized Description *</label>
                <input type="text" required value={editing.description} onChange={(e) => setEditing({ ...editing, description: e.target.value })} className="w-full px-3 py-2 rounded-xl border border-slate-300" />
              </div>
              <div>
                <label className="font-semibold block mb-1">Subtotal Amount (₹) *</label>
                <input type="number" required value={editing.subtotal} onChange={(e) => setEditing({ ...editing, subtotal: Number(e.target.value) })} className="w-full px-3 py-2 rounded-xl border border-slate-300" />
              </div>
              <div>
                <label className="font-semibold block mb-1">Discount (₹)</label>
                <input type="number" value={editing.discount} onChange={(e) => setEditing({ ...editing, discount: Number(e.target.value) })} className="w-full px-3 py-2 rounded-xl border border-slate-300" />
              </div>
              <div>
                <label className="font-semibold block mb-1">Amount Paid So Far (₹) *</label>
                <input type="number" required value={editing.paidAmount} onChange={(e) => setEditing({ ...editing, paidAmount: Number(e.target.value) })} className="w-full px-3 py-2 rounded-xl border border-slate-300" />
              </div>
              <div>
                <label className="font-semibold block mb-1">Billing Date</label>
                <input type="date" value={editing.billingDate} onChange={(e) => setEditing({ ...editing, billingDate: e.target.value })} className="w-full px-3 py-2 rounded-xl border border-slate-300" />
              </div>
              <div className="sm:col-span-2">
                <label className="font-semibold block mb-1">Remarks</label>
                <input type="text" value={editing.remarks} onChange={(e) => setEditing({ ...editing, remarks: e.target.value })} className="w-full px-3 py-2 rounded-xl border border-slate-300" />
              </div>
              <div className="sm:col-span-2 flex justify-end gap-2 pt-3 border-t">
                <button type="button" onClick={() => setModalOpen(false)} className="px-4 py-2 rounded-xl border cursor-pointer">Cancel</button>
                <button type="submit" className="px-5 py-2 rounded-xl bg-teal-600 text-white font-semibold cursor-pointer">Save Invoice</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

// ============================================================================
// MODULE 15: PHARMACY & ORTHOPAEDIC IMPLANT INVENTORY
// ============================================================================
export const PharmacyModule: React.FC<{ onRefreshGlobal: () => void }> = ({ onRefreshGlobal }) => {
  const [items, setItems] = useState<PharmacyItem[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<PharmacyItem>({
    medicineName: '',
    genericName: '',
    category: 'Analgesics/NSAIDs',
    manufacturer: '',
    batchNumber: 'B26-',
    expiryDate: '2028-06-30',
    stockQuantity: 100,
    reorderLevel: 25,
    unitPrice: 25,
    rackLocation: 'Rack A-02',
  });

  const load = async () => setItems(await api.get<PharmacyItem[]>('/pharmacy'));
  useEffect(() => { load(); }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editing.id) {
      await api.put(`/pharmacy/${editing.id}`, editing);
    } else {
      await api.post('/pharmacy', editing);
    }
    setModalOpen(false);
    await load();
    onRefreshGlobal();
  };

  const handleDelete = async (id?: number) => {
    if (!id || !window.confirm('Delete this pharmacy/implant item?')) return;
    await api.delete(`/pharmacy/${id}`);
    await load();
    onRefreshGlobal();
  };

  return (
    <div className="space-y-5">
      <div className="bg-white rounded-2xl p-5 border border-slate-200 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Pill className="w-5 h-5 text-teal-600" /> Hospital Pharmacy & Orthopaedic Implant Inventory
          </h2>
          <p className="text-xs text-slate-500">Manage medicines, surgical consumables, knee/spine prostheses, and stock levels.</p>
        </div>
        <button
          onClick={() => {
            setEditing({
              medicineName: '',
              genericName: '',
              category: 'Analgesics/NSAIDs',
              manufacturer: 'Sun Pharma',
              batchNumber: 'B26-NEW',
              expiryDate: '2028-12-31',
              stockQuantity: 100,
              reorderLevel: 20,
              unitPrice: 45,
              rackLocation: 'Rack A-01',
            });
            setModalOpen(true);
          }}
          className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
        >
          <Plus className="w-4 h-4" /> + Add Medicine / Implant
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold uppercase text-slate-500">
              <th className="py-3 px-4">Code</th>
              <th className="py-3 px-4">Medicine / Implant Name</th>
              <th className="py-3 px-4">Category & Mfg</th>
              <th className="py-3 px-4">Batch & Expiry</th>
              <th className="py-3 px-4">Stock Level</th>
              <th className="py-3 px-4">Unit Price (₹)</th>
              <th className="py-3 px-4 text-right">Edit / Delete</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {items.map((item) => {
              const low = item.stockQuantity <= item.reorderLevel;
              return (
                <tr key={item.id} className="hover:bg-slate-50">
                  <td className="py-3 px-4 font-mono font-bold text-teal-700">{item.itemCode}</td>
                  <td className="py-3 px-4">
                    <div className="font-bold text-slate-900">{item.medicineName}</div>
                    <div className="text-slate-500">{item.genericName} • {item.rackLocation}</div>
                  </td>
                  <td className="py-3 px-4">
                    <span className="font-semibold text-sky-800">{item.category}</span>
                    <div className="text-slate-500">{item.manufacturer}</div>
                  </td>
                  <td className="py-3 px-4">
                    <div>Batch: {item.batchNumber}</div>
                    <div className="text-slate-500">Exp: {item.expiryDate}</div>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`px-2.5 py-1 rounded-full font-bold ${low ? 'bg-rose-100 text-rose-800' : 'bg-emerald-100 text-emerald-800'}`}>
                      {item.stockQuantity} units {low ? '(LOW)' : ''}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-bold">₹{item.unitPrice.toLocaleString('en-IN')}</td>
                  <td className="py-3 px-4 text-right">
                    <div className="inline-flex gap-1.5">
                      <button onClick={() => { setEditing({ ...item }); setModalOpen(true); }} className="p-1.5 rounded-lg bg-slate-100 hover:bg-amber-100 cursor-pointer"><Edit3 className="w-4 h-4" /></button>
                      <button onClick={() => handleDelete(item.id)} className="p-1.5 rounded-lg bg-slate-100 hover:bg-rose-100 text-rose-600 cursor-pointer"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl">
            <div className="flex justify-between items-center pb-3 border-b">
              <h3 className="text-lg font-bold">{editing.id ? 'Edit Inventory Item' : 'Add Pharmacy / Implant Item'}</h3>
              <button onClick={() => setModalOpen(false)} className="cursor-pointer"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleSave} className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="font-semibold block mb-1">Medicine / Implant Name *</label>
                <input type="text" required value={editing.medicineName} onChange={(e) => setEditing({ ...editing, medicineName: e.target.value })} className="w-full px-3 py-2 rounded-xl border border-slate-300" />
              </div>
              <div>
                <label className="font-semibold block mb-1">Generic / Composition</label>
                <input type="text" value={editing.genericName} onChange={(e) => setEditing({ ...editing, genericName: e.target.value })} className="w-full px-3 py-2 rounded-xl border border-slate-300" />
              </div>
              <div>
                <label className="font-semibold block mb-1">Category</label>
                <select value={editing.category} onChange={(e) => setEditing({ ...editing, category: e.target.value })} className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white">
                  <option>Analgesics/NSAIDs</option>
                  <option>Antibiotics</option>
                  <option>Orthopaedic Implants</option>
                  <option>Anaesthetics</option>
                  <option>Anticoagulants</option>
                  <option>Bone Supplements</option>
                </select>
              </div>
              <div>
                <label className="font-semibold block mb-1">Manufacturer</label>
                <input type="text" value={editing.manufacturer} onChange={(e) => setEditing({ ...editing, manufacturer: e.target.value })} className="w-full px-3 py-2 rounded-xl border border-slate-300" />
              </div>
              <div>
                <label className="font-semibold block mb-1">Stock Quantity & Reorder Level</label>
                <div className="flex gap-2">
                  <input type="number" value={editing.stockQuantity} onChange={(e) => setEditing({ ...editing, stockQuantity: Number(e.target.value) })} className="w-1/2 px-2 py-2 rounded-xl border border-slate-300" />
                  <input type="number" value={editing.reorderLevel} onChange={(e) => setEditing({ ...editing, reorderLevel: Number(e.target.value) })} className="w-1/2 px-2 py-2 rounded-xl border border-slate-300" />
                </div>
              </div>
              <div>
                <label className="font-semibold block mb-1">Unit Price (₹) & Rack</label>
                <div className="flex gap-2">
                  <input type="number" step="0.5" value={editing.unitPrice} onChange={(e) => setEditing({ ...editing, unitPrice: Number(e.target.value) })} className="w-1/2 px-2 py-2 rounded-xl border border-slate-300" />
                  <input type="text" value={editing.rackLocation} onChange={(e) => setEditing({ ...editing, rackLocation: e.target.value })} className="w-1/2 px-2 py-2 rounded-xl border border-slate-300" />
                </div>
              </div>
              <div>
                <label className="font-semibold block mb-1">Batch Number</label>
                <input type="text" value={editing.batchNumber} onChange={(e) => setEditing({ ...editing, batchNumber: e.target.value })} className="w-full px-3 py-2 rounded-xl border border-slate-300" />
              </div>
              <div>
                <label className="font-semibold block mb-1">Expiry Date</label>
                <input type="date" value={editing.expiryDate} onChange={(e) => setEditing({ ...editing, expiryDate: e.target.value })} className="w-full px-3 py-2 rounded-xl border border-slate-300" />
              </div>
              <div className="sm:col-span-2 flex justify-end gap-2 pt-3 border-t">
                <button type="button" onClick={() => setModalOpen(false)} className="px-4 py-2 rounded-xl border cursor-pointer">Cancel</button>
                <button type="submit" className="px-5 py-2 rounded-xl bg-teal-600 text-white font-semibold cursor-pointer">Save Item</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
