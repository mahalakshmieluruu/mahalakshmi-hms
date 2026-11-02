import React, { useEffect, useState } from 'react';
import {
  Plus, Edit3, Trash2, X, Stethoscope, Calendar, FileText,
  Bone, Scissors, AlertTriangle, Search
} from 'lucide-react';
import { api } from '../services/api';
import {
  Doctor, Appointment, MedicalRecord, OrthopaedicCase,
  Surgery, EmergencyCase, Patient, HOSPITAL_SERVICES
} from '../types/hms';

interface ClinicalProps {
  patients: Patient[];
  doctors: Doctor[];
  onRefreshGlobal: () => void;
}

// ============================================================================
// MODULE 3: ELECTRONIC MEDICAL RECORDS (EMR) & PRESCRIPTIONS
// ============================================================================
export const EmrModule: React.FC<ClinicalProps> = ({ patients, doctors, onRefreshGlobal }) => {
  const [records, setRecords] = useState<MedicalRecord[]>([]);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<MedicalRecord>({
    patientId: patients[0]?.id,
    patientName: patients[0]?.fullName || '',
    doctorName: doctors[0]?.fullName || 'Dr. K. Venkata Rama Rao',
    department: 'Orthopaedics',
    serviceCategory: 'Orthopaedics',
    visitType: 'CONSULTATION',
    chiefComplaint: '',
    diagnosis: '',
    clinicalNotes: '',
    prescription: '',
    vitalsBp: '120/80 mmHg',
    vitalsPulse: '74 bpm',
    vitalsTemp: '98.4 F',
    vitalsSpo2: '99%',
    vitalsWeight: '68 kg',
    visitDate: new Date().toISOString().split('T')[0],
    followUpDate: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
    followUpInstructions: 'Review in OPD with reports',
  });

  const load = async () => {
    setRecords(await api.get<MedicalRecord[]>('/emr'));
  };

  useEffect(() => {
    load();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editing.id) {
      await api.put(`/emr/${editing.id}`, editing);
    } else {
      await api.post('/emr', editing);
    }
    setModalOpen(false);
    await load();
    onRefreshGlobal();
  };

  const handleDelete = async (id?: number) => {
    if (!id || !window.confirm('Delete this Electronic Medical Record?')) return;
    await api.delete(`/emr/${id}`);
    await load();
    onRefreshGlobal();
  };

  const filtered = records.filter(
    (r) =>
      r.patientName?.toLowerCase().includes(search.toLowerCase()) ||
      r.diagnosis?.toLowerCase().includes(search.toLowerCase()) ||
      r.recordUid?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-5">
      <div className="bg-white rounded-2xl p-5 border border-slate-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <FileText className="w-5 h-5 text-teal-600" /> Electronic Medical Records (EMR) & Prescriptions
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Create, edit, or update clinical notes, vitals, diagnoses, prescriptions, and follow-up schedules.
          </p>
        </div>
        <div className="flex gap-2">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search patient or diagnosis..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 pr-3 py-2 rounded-xl border border-slate-300 text-xs"
            />
          </div>
          <button
            onClick={() => {
              setEditing({
                patientId: patients[0]?.id,
                patientName: patients[0]?.fullName || '',
                doctorName: doctors[0]?.fullName || 'Dr. K. Venkata Rama Rao',
                department: 'Orthopaedics',
                serviceCategory: 'Orthopaedics',
                visitType: 'CONSULTATION',
                chiefComplaint: '',
                diagnosis: '',
                clinicalNotes: '',
                prescription: '1. Tab. Paracetamol 650mg BD\n2. Tab. Pantoprazole 40mg OD',
                vitalsBp: '120/80 mmHg',
                vitalsPulse: '76 bpm',
                vitalsTemp: '98.4 F',
                vitalsSpo2: '99%',
                vitalsWeight: '70 kg',
                visitDate: new Date().toISOString().split('T')[0],
                followUpDate: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
                followUpInstructions: 'Review after 7 days',
              });
              setModalOpen(true);
            }}
            className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" /> + New EMR Entry
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {filtered.map((r) => (
          <div key={r.id} className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
              <div>
                <span className="font-mono text-xs font-bold text-teal-700 mr-2">{r.recordUid}</span>
                <span className="text-base font-bold text-slate-900">{r.patientName}</span>
                <span className="text-xs text-slate-500 ml-2">({r.patientUid})</span>
                <span className="ml-3 px-2.5 py-0.5 rounded-full bg-sky-50 text-sky-800 border border-sky-200 text-xs font-semibold">
                  {r.serviceCategory} • {r.visitType}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-500">Date: {r.visitDate} | {r.doctorName}</span>
                <button
                  onClick={() => {
                    setEditing({ ...r });
                    setModalOpen(true);
                  }}
                  className="px-2.5 py-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 text-xs font-semibold flex items-center gap-1 cursor-pointer"
                >
                  <Edit3 className="w-3.5 h-3.5" /> Edit EMR
                </button>
                <button
                  onClick={() => handleDelete(r.id)}
                  className="p-1.5 rounded-lg bg-slate-100 hover:bg-rose-100 text-slate-600 hover:text-rose-700 cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 bg-slate-50 p-2.5 rounded-xl text-xs">
              <div><strong>BP:</strong> {r.vitalsBp}</div>
              <div><strong>Pulse:</strong> {r.vitalsPulse}</div>
              <div><strong>Temp:</strong> {r.vitalsTemp}</div>
              <div><strong>SpO2:</strong> {r.vitalsSpo2}</div>
              <div><strong>Weight:</strong> {r.vitalsWeight}</div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="space-y-1.5">
                <div><strong className="text-slate-700">Chief Complaint:</strong> {r.chiefComplaint}</div>
                <div><strong className="text-slate-700">Diagnosis:</strong> <span className="font-semibold text-teal-900">{r.diagnosis}</span></div>
                <div><strong className="text-slate-700">Clinical Findings:</strong> {r.clinicalNotes}</div>
                <div><strong className="text-slate-700">Follow-up:</strong> {r.followUpDate} — {r.followUpInstructions}</div>
              </div>
              <div>
                <div className="font-bold text-slate-700 mb-1">Prescription (Rx):</div>
                <pre className="p-3 rounded-xl bg-teal-50/50 border border-teal-200 font-mono text-xs whitespace-pre-wrap text-slate-800">
                  {r.prescription}
                </pre>
              </div>
            </div>
          </div>
        ))}
      </div>

      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-3xl w-full p-6 shadow-2xl my-8">
            <div className="flex justify-between items-center pb-3 border-b border-slate-200">
              <h3 className="text-lg font-bold">{editing.id ? `Edit EMR — ${editing.recordUid}` : 'Create Electronic Medical Record'}</h3>
              <button onClick={() => setModalOpen(false)} className="p-1 cursor-pointer"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleSave} className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
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
                  {patients.map((p) => (
                    <option key={p.id} value={p.id}>{p.fullName} ({p.patientUid})</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="font-semibold block mb-1">Consulting Doctor</label>
                <select
                  value={editing.doctorName}
                  onChange={(e) => setEditing({ ...editing, doctorName: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white"
                >
                  {doctors.map((d) => (
                    <option key={d.id} value={d.fullName}>{d.fullName}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="font-semibold block mb-1">Hospital Service</label>
                <select
                  value={editing.serviceCategory}
                  onChange={(e) => setEditing({ ...editing, serviceCategory: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white"
                >
                  {HOSPITAL_SERVICES.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-semibold block mb-1">BP</label>
                <input type="text" value={editing.vitalsBp} onChange={(e) => setEditing({ ...editing, vitalsBp: e.target.value })} className="w-full px-3 py-2 rounded-xl border border-slate-300" />
              </div>
              <div>
                <label className="font-semibold block mb-1">Pulse & SpO2</label>
                <div className="flex gap-2">
                  <input type="text" value={editing.vitalsPulse} onChange={(e) => setEditing({ ...editing, vitalsPulse: e.target.value })} placeholder="Pulse" className="w-1/2 px-2 py-2 rounded-xl border border-slate-300" />
                  <input type="text" value={editing.vitalsSpo2} onChange={(e) => setEditing({ ...editing, vitalsSpo2: e.target.value })} placeholder="SpO2" className="w-1/2 px-2 py-2 rounded-xl border border-slate-300" />
                </div>
              </div>
              <div>
                <label className="font-semibold block mb-1">Temp & Weight</label>
                <div className="flex gap-2">
                  <input type="text" value={editing.vitalsTemp} onChange={(e) => setEditing({ ...editing, vitalsTemp: e.target.value })} placeholder="Temp" className="w-1/2 px-2 py-2 rounded-xl border border-slate-300" />
                  <input type="text" value={editing.vitalsWeight} onChange={(e) => setEditing({ ...editing, vitalsWeight: e.target.value })} placeholder="Weight" className="w-1/2 px-2 py-2 rounded-xl border border-slate-300" />
                </div>
              </div>

              <div className="md:col-span-3">
                <label className="font-semibold block mb-1">Chief Complaint *</label>
                <input type="text" required value={editing.chiefComplaint} onChange={(e) => setEditing({ ...editing, chiefComplaint: e.target.value })} className="w-full px-3 py-2 rounded-xl border border-slate-300" />
              </div>
              <div className="md:col-span-3">
                <label className="font-semibold block mb-1">Clinical Diagnosis *</label>
                <input type="text" required value={editing.diagnosis} onChange={(e) => setEditing({ ...editing, diagnosis: e.target.value })} className="w-full px-3 py-2 rounded-xl border border-slate-300" />
              </div>
              <div className="md:col-span-3">
                <label className="font-semibold block mb-1">Clinical Examination & Notes</label>
                <textarea rows={2} value={editing.clinicalNotes} onChange={(e) => setEditing({ ...editing, clinicalNotes: e.target.value })} className="w-full px-3 py-2 rounded-xl border border-slate-300" />
              </div>
              <div className="md:col-span-3">
                <label className="font-semibold block mb-1">Prescription (Rx Medications & Dosage)</label>
                <textarea rows={3} value={editing.prescription} onChange={(e) => setEditing({ ...editing, prescription: e.target.value })} className="w-full px-3 py-2 rounded-xl border border-slate-300 font-mono" />
              </div>

              <div>
                <label className="font-semibold block mb-1">Visit Date</label>
                <input type="date" value={editing.visitDate} onChange={(e) => setEditing({ ...editing, visitDate: e.target.value })} className="w-full px-3 py-2 rounded-xl border border-slate-300" />
              </div>
              <div>
                <label className="font-semibold block mb-1">Follow-Up Date</label>
                <input type="date" value={editing.followUpDate} onChange={(e) => setEditing({ ...editing, followUpDate: e.target.value })} className="w-full px-3 py-2 rounded-xl border border-slate-300" />
              </div>
              <div>
                <label className="font-semibold block mb-1">Follow-Up Instructions</label>
                <input type="text" value={editing.followUpInstructions} onChange={(e) => setEditing({ ...editing, followUpInstructions: e.target.value })} className="w-full px-3 py-2 rounded-xl border border-slate-300" />
              </div>

              <div className="md:col-span-3 flex justify-end gap-2 pt-3 border-t border-slate-200">
                <button type="button" onClick={() => setModalOpen(false)} className="px-4 py-2 rounded-xl border border-slate-300 cursor-pointer">Cancel</button>
                <button type="submit" className="px-5 py-2 rounded-xl bg-teal-600 text-white font-semibold cursor-pointer">Save EMR Record</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

// ============================================================================
// MODULE 4: DOCTOR MANAGEMENT
// ============================================================================
export const DoctorModule: React.FC<{ onRefreshGlobal: () => void }> = ({ onRefreshGlobal }) => {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Doctor>({
    doctorCode: '',
    fullName: '',
    specialization: 'Orthopaedics & Joint Replacement',
    department: 'Orthopaedics',
    qualification: 'MBBS, MS (Ortho)',
    licenseNumber: 'APMC-',
    experienceYears: 10,
    phone: '+91 ',
    email: '',
    consultationFee: 500,
    availabilitySchedule: 'Mon-Sat: 09:30 AM - 02:30 PM',
    roomNumber: 'OPD-05',
    available: true,
  });

  const load = async () => setDoctors(await api.get<Doctor[]>('/doctors'));
  useEffect(() => { load(); }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editing.id) {
      await api.put(`/doctors/${editing.id}`, editing);
    } else {
      await api.post('/doctors', editing);
    }
    setModalOpen(false);
    await load();
    onRefreshGlobal();
  };

  const handleDelete = async (id?: number) => {
    if (!id || !window.confirm('Remove this doctor from the roster?')) return;
    await api.delete(`/doctors/${id}`);
    await load();
    onRefreshGlobal();
  };

  return (
    <div className="space-y-5">
      <div className="bg-white rounded-2xl p-5 border border-slate-200 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Stethoscope className="w-5 h-5 text-teal-600" /> Specialist Doctors & Consultants Roster
          </h2>
          <p className="text-xs text-slate-500">Add new specialists, edit consultation fees, schedules, or availability.</p>
        </div>
        <button
          onClick={() => {
            setEditing({
              doctorCode: '',
              fullName: 'Dr. ',
              specialization: 'Orthopaedics & Trauma',
              department: 'Orthopaedics',
              qualification: 'MBBS, MS (Ortho)',
              licenseNumber: 'APMC-65001',
              experienceYears: 8,
              phone: '+91 98480-',
              email: 'doctor@mahalakshmihospital-eluru.in',
              consultationFee: 500,
              availabilitySchedule: 'Mon-Sat: 10:00 AM - 04:00 PM',
              roomNumber: 'OPD-05',
              available: true,
            });
            setModalOpen(true);
          }}
          className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
        >
          <Plus className="w-4 h-4" /> + Add Doctor
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {doctors.map((d) => (
          <div key={d.id} className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-start">
                <span className="text-xs font-mono font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded">{d.doctorCode}</span>
                <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${d.available ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-600'}`}>
                  {d.available ? 'Available On-Duty' : 'Off-Duty'}
                </span>
              </div>
              <h3 className="text-base font-bold text-slate-900 mt-2">{d.fullName}</h3>
              <p className="text-xs font-semibold text-teal-700">{d.specialization}</p>
              <p className="text-xs text-slate-500 mt-0.5">{d.qualification} • {d.experienceYears} yrs exp • Reg: {d.licenseNumber}</p>

              <div className="mt-3 pt-3 border-t border-slate-100 text-xs space-y-1 text-slate-600">
                <div><strong>Department:</strong> {d.department} ({d.roomNumber})</div>
                <div><strong>Schedule:</strong> {d.availabilitySchedule}</div>
                <div><strong>Consultation Fee:</strong> <span className="text-slate-900 font-bold">₹{d.consultationFee}</span></div>
                <div><strong>Contact:</strong> {d.phone}</div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 flex justify-end gap-2">
              <button
                onClick={() => { setEditing({ ...d }); setModalOpen(true); }}
                className="px-3 py-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 text-xs font-semibold flex items-center gap-1 cursor-pointer"
              >
                <Edit3 className="w-3.5 h-3.5" /> Edit Doctor
              </button>
              <button
                onClick={() => handleDelete(d.id)}
                className="p-1.5 rounded-lg bg-slate-100 hover:bg-rose-100 text-slate-600 hover:text-rose-700 cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl">
            <div className="flex justify-between items-center pb-3 border-b">
              <h3 className="text-lg font-bold">{editing.id ? 'Edit Doctor Profile' : 'Add Specialist Doctor'}</h3>
              <button onClick={() => setModalOpen(false)} className="cursor-pointer"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleSave} className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="font-semibold block mb-1">Full Name *</label>
                <input type="text" required value={editing.fullName} onChange={(e) => setEditing({ ...editing, fullName: e.target.value })} className="w-full px-3 py-2 rounded-xl border border-slate-300" />
              </div>
              <div>
                <label className="font-semibold block mb-1">Department *</label>
                <select value={editing.department} onChange={(e) => setEditing({ ...editing, department: e.target.value })} className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white">
                  {HOSPITAL_SERVICES.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label className="font-semibold block mb-1">Specialization *</label>
                <input type="text" required value={editing.specialization} onChange={(e) => setEditing({ ...editing, specialization: e.target.value })} className="w-full px-3 py-2 rounded-xl border border-slate-300" />
              </div>
              <div>
                <label className="font-semibold block mb-1">Qualifications</label>
                <input type="text" value={editing.qualification} onChange={(e) => setEditing({ ...editing, qualification: e.target.value })} className="w-full px-3 py-2 rounded-xl border border-slate-300" />
              </div>
              <div>
                <label className="font-semibold block mb-1">Medical Council License No.</label>
                <input type="text" value={editing.licenseNumber} onChange={(e) => setEditing({ ...editing, licenseNumber: e.target.value })} className="w-full px-3 py-2 rounded-xl border border-slate-300" />
              </div>
              <div>
                <label className="font-semibold block mb-1">Experience (Years) & Fee (₹)</label>
                <div className="flex gap-2">
                  <input type="number" value={editing.experienceYears} onChange={(e) => setEditing({ ...editing, experienceYears: Number(e.target.value) })} className="w-1/2 px-2 py-2 rounded-xl border border-slate-300" />
                  <input type="number" value={editing.consultationFee} onChange={(e) => setEditing({ ...editing, consultationFee: Number(e.target.value) })} className="w-1/2 px-2 py-2 rounded-xl border border-slate-300" />
                </div>
              </div>
              <div>
                <label className="font-semibold block mb-1">Phone Number</label>
                <input type="text" value={editing.phone} onChange={(e) => setEditing({ ...editing, phone: e.target.value })} className="w-full px-3 py-2 rounded-xl border border-slate-300" />
              </div>
              <div>
                <label className="font-semibold block mb-1">OPD Room & Duty Status</label>
                <div className="flex gap-2">
                  <input type="text" value={editing.roomNumber} onChange={(e) => setEditing({ ...editing, roomNumber: e.target.value })} className="w-1/2 px-2 py-2 rounded-xl border border-slate-300" />
                  <select value={editing.available ? 'YES' : 'NO'} onChange={(e) => setEditing({ ...editing, available: e.target.value === 'YES' })} className="w-1/2 px-2 py-2 rounded-xl border border-slate-300 bg-white">
                    <option value="YES">Available</option>
                    <option value="NO">Off-Duty</option>
                  </select>
                </div>
              </div>
              <div className="md:col-span-2">
                <label className="font-semibold block mb-1">Availability Timings</label>
                <input type="text" value={editing.availabilitySchedule} onChange={(e) => setEditing({ ...editing, availabilitySchedule: e.target.value })} className="w-full px-3 py-2 rounded-xl border border-slate-300" />
              </div>
              <div className="md:col-span-2 flex justify-end gap-2 pt-3 border-t">
                <button type="button" onClick={() => setModalOpen(false)} className="px-4 py-2 rounded-xl border cursor-pointer">Cancel</button>
                <button type="submit" className="px-5 py-2 rounded-xl bg-teal-600 text-white font-semibold cursor-pointer">Save Doctor</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

// ============================================================================
// MODULE 5: APPOINTMENT MANAGEMENT
// ============================================================================
export const AppointmentModule: React.FC<ClinicalProps> = ({ patients, doctors, onRefreshGlobal }) => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Appointment>({
    patientId: patients[0]?.id,
    patientName: patients[0]?.fullName || '',
    doctorName: doctors[0]?.fullName || 'Dr. K. Venkata Rama Rao',
    department: 'Orthopaedics',
    serviceCategory: 'Orthopaedics',
    appointmentDate: new Date().toISOString().split('T')[0],
    appointmentTime: '10:30 AM',
    visitType: 'OPD',
    status: 'SCHEDULED',
    reason: '',
    notes: '',
    tokenNumber: 1,
  });

  const load = async () => setAppointments(await api.get<Appointment[]>('/appointments'));
  useEffect(() => { load(); }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editing.id) {
      await api.put(`/appointments/${editing.id}`, editing);
    } else {
      await api.post('/appointments', editing);
    }
    setModalOpen(false);
    await load();
    onRefreshGlobal();
  };

  const quickStatus = async (a: Appointment, status: string) => {
    if (!a.id) return;
    await api.put(`/appointments/${a.id}`, { ...a, status });
    await load();
    onRefreshGlobal();
  };

  const handleDelete = async (id?: number) => {
    if (!id || !window.confirm('Delete this appointment?')) return;
    await api.delete(`/appointments/${id}`);
    await load();
    onRefreshGlobal();
  };

  return (
    <div className="space-y-5">
      <div className="bg-white rounded-2xl p-5 border border-slate-200 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-teal-600" /> OPD & Specialist Appointment Management
          </h2>
          <p className="text-xs text-slate-500">Book tokens, edit appointment times, or update live queue status.</p>
        </div>
        <button
          onClick={() => {
            setEditing({
              patientId: patients[0]?.id,
              patientName: patients[0]?.fullName || '',
              doctorName: doctors[0]?.fullName || 'Dr. K. Venkata Rama Rao',
              department: 'Orthopaedics',
              serviceCategory: 'Orthopaedics',
              appointmentDate: new Date().toISOString().split('T')[0],
              appointmentTime: '10:30 AM',
              visitType: 'OPD',
              status: 'SCHEDULED',
              reason: '',
              notes: '',
              tokenNumber: appointments.length + 1,
            });
            setModalOpen(true);
          }}
          className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
        >
          <Plus className="w-4 h-4" /> + Book Appointment
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold uppercase text-slate-500">
              <th className="py-3 px-4">Token & ID</th>
              <th className="py-3 px-4">Patient</th>
              <th className="py-3 px-4">Consultant & Service</th>
              <th className="py-3 px-4">Date & Time</th>
              <th className="py-3 px-4">Reason / Notes</th>
              <th className="py-3 px-4">Queue Status</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {appointments.map((a) => (
              <tr key={a.id} className="hover:bg-slate-50">
                <td className="py-3 px-4 font-mono font-bold text-teal-700">
                  #{a.tokenNumber} • {a.appointmentUid}
                </td>
                <td className="py-3 px-4 font-bold text-slate-900">
                  {a.patientName}
                  <div className="text-[11px] text-slate-400 font-normal">{a.patientUid}</div>
                </td>
                <td className="py-3 px-4">
                  <div className="font-semibold text-slate-800">{a.doctorName}</div>
                  <span className="text-[11px] text-teal-700">{a.serviceCategory} ({a.visitType})</span>
                </td>
                <td className="py-3 px-4 font-medium">{a.appointmentDate} • {a.appointmentTime}</td>
                <td className="py-3 px-4 max-w-xs">
                  <div>{a.reason}</div>
                  <div className="text-slate-400">{a.notes}</div>
                </td>
                <td className="py-3 px-4">
                  <select
                    value={a.status}
                    onChange={(e) => quickStatus(a, e.target.value)}
                    className="px-2.5 py-1 rounded-lg border border-slate-300 font-bold text-[11px] bg-white cursor-pointer"
                  >
                    <option value="SCHEDULED">SCHEDULED</option>
                    <option value="CHECKED_IN">CHECKED_IN</option>
                    <option value="IN_PROGRESS">IN_PROGRESS</option>
                    <option value="COMPLETED">COMPLETED</option>
                    <option value="CANCELLED">CANCELLED</option>
                  </select>
                </td>
                <td className="py-3 px-4 text-right">
                  <div className="inline-flex gap-1.5">
                    <button onClick={() => { setEditing({ ...a }); setModalOpen(true); }} className="p-1.5 rounded-lg bg-slate-100 hover:bg-amber-100 text-slate-700 cursor-pointer"><Edit3 className="w-4 h-4" /></button>
                    <button onClick={() => handleDelete(a.id)} className="p-1.5 rounded-lg bg-slate-100 hover:bg-rose-100 text-slate-700 cursor-pointer"><Trash2 className="w-4 h-4" /></button>
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
              <h3 className="text-lg font-bold">{editing.id ? 'Edit Appointment' : 'Book New Appointment'}</h3>
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
                <label className="font-semibold block mb-1">Doctor *</label>
                <select value={editing.doctorName} onChange={(e) => setEditing({ ...editing, doctorName: e.target.value })} className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white">
                  {doctors.map((d) => <option key={d.id} value={d.fullName}>{d.fullName}</option>)}
                </select>
              </div>
              <div>
                <label className="font-semibold block mb-1">Hospital Service</label>
                <select value={editing.serviceCategory} onChange={(e) => setEditing({ ...editing, serviceCategory: e.target.value })} className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white">
                  {HOSPITAL_SERVICES.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label className="font-semibold block mb-1">Visit Type & Status</label>
                <div className="flex gap-2">
                  <select value={editing.visitType} onChange={(e) => setEditing({ ...editing, visitType: e.target.value })} className="w-1/2 px-2 py-2 rounded-xl border border-slate-300 bg-white">
                    <option value="OPD">OPD</option>
                    <option value="ORTHO_CONSULT">ORTHO_CONSULT</option>
                    <option value="FOLLOW_UP">FOLLOW_UP</option>
                    <option value="CHECKUP">CHECKUP</option>
                  </select>
                  <select value={editing.status} onChange={(e) => setEditing({ ...editing, status: e.target.value })} className="w-1/2 px-2 py-2 rounded-xl border border-slate-300 bg-white">
                    <option value="SCHEDULED">SCHEDULED</option>
                    <option value="CHECKED_IN">CHECKED_IN</option>
                    <option value="IN_PROGRESS">IN_PROGRESS</option>
                    <option value="COMPLETED">COMPLETED</option>
                    <option value="CANCELLED">CANCELLED</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="font-semibold block mb-1">Date</label>
                <input type="date" value={editing.appointmentDate} onChange={(e) => setEditing({ ...editing, appointmentDate: e.target.value })} className="w-full px-3 py-2 rounded-xl border border-slate-300" />
              </div>
              <div>
                <label className="font-semibold block mb-1">Time Slot</label>
                <input type="text" value={editing.appointmentTime} onChange={(e) => setEditing({ ...editing, appointmentTime: e.target.value })} className="w-full px-3 py-2 rounded-xl border border-slate-300" />
              </div>
              <div className="sm:col-span-2">
                <label className="font-semibold block mb-1">Reason for Visit</label>
                <input type="text" required value={editing.reason} onChange={(e) => setEditing({ ...editing, reason: e.target.value })} className="w-full px-3 py-2 rounded-xl border border-slate-300" />
              </div>
              <div className="sm:col-span-2">
                <label className="font-semibold block mb-1">Special Notes</label>
                <input type="text" value={editing.notes} onChange={(e) => setEditing({ ...editing, notes: e.target.value })} className="w-full px-3 py-2 rounded-xl border border-slate-300" />
              </div>
              <div className="sm:col-span-2 flex justify-end gap-2 pt-3 border-t">
                <button type="button" onClick={() => setModalOpen(false)} className="px-4 py-2 rounded-xl border cursor-pointer">Cancel</button>
                <button type="submit" className="px-5 py-2 rounded-xl bg-teal-600 text-white font-semibold cursor-pointer">Save Appointment</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

// ============================================================================
// MODULE 10: ORTHOPAEDIC DEPARTMENT (Joint Replacement, Spine, Fractures, etc.)
// ============================================================================
export const OrthopaedicModule: React.FC<ClinicalProps> = ({ patients, doctors, onRefreshGlobal }) => {
  const [cases, setCases] = useState<OrthopaedicCase[]>([]);
  const [filterSub, setFilterSub] = useState('ALL');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<OrthopaedicCase>({
    patientId: patients[0]?.id,
    patientName: patients[0]?.fullName || '',
    surgeonName: 'Dr. K. Venkata Rama Rao',
    subSpecialty: 'Joint Replacement',
    affectedSite: 'Right Knee Joint',
    mechanismOfInjury: 'Degenerative Osteoarthritis',
    severity: 'Severe (Grade IV)',
    clinicalAssessment: '',
    treatmentPlan: '',
    implantOrFixation: 'Zimmer Persona Total Knee System',
    physiotherapyPlan: 'CPM + Quadriceps Strengthening',
    status: 'ACTIVE_TREATMENT',
    evaluationDate: new Date().toISOString().split('T')[0],
  });

  const orthoSpecialties = [
    'Joint Replacement',
    'Fractures',
    'Spine Surgeries',
    'Trauma',
    'Joint Inflammation',
    'Ligament Tears',
    'Keyhole Surgeries',
  ];

  const load = async () => setCases(await api.get<OrthopaedicCase[]>('/ortho-cases'));
  useEffect(() => { load(); }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editing.id) {
      await api.put(`/ortho-cases/${editing.id}`, editing);
    } else {
      await api.post('/ortho-cases', editing);
    }
    setModalOpen(false);
    await load();
    onRefreshGlobal();
  };

  const handleDelete = async (id?: number) => {
    if (!id || !window.confirm('Delete this Orthopaedic case record?')) return;
    await api.delete(`/ortho-cases/${id}`);
    await load();
    onRefreshGlobal();
  };

  const filtered = filterSub === 'ALL' ? cases : cases.filter((c) => c.subSpecialty === filterSub);

  return (
    <div className="space-y-5">
      <div className="bg-white rounded-2xl p-5 border border-slate-200 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Bone className="w-5 h-5 text-teal-600" /> Department of Orthopaedics, Joint Replacement, Spine & Trauma
          </h2>
          <p className="text-xs text-slate-500">
            Dedicated registry for Joint Replacement, Fractures, Spine Surgeries, Trauma, Joint Inflammation, Ligament Tears & Keyhole Arthroscopy.
          </p>
        </div>
        <button
          onClick={() => {
            setEditing({
              patientId: patients[0]?.id,
              patientName: patients[0]?.fullName || '',
              surgeonName: 'Dr. K. Venkata Rama Rao',
              subSpecialty: 'Joint Replacement',
              affectedSite: '',
              mechanismOfInjury: '',
              severity: 'Moderate-Severe',
              clinicalAssessment: '',
              treatmentPlan: '',
              implantOrFixation: '',
              physiotherapyPlan: '',
              status: 'ACTIVE_TREATMENT',
              evaluationDate: new Date().toISOString().split('T')[0],
            });
            setModalOpen(true);
          }}
          className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
        >
          <Plus className="w-4 h-4" /> + New Orthopaedic Case
        </button>
      </div>

      {/* Filter pills for the 7 Orthopaedic services */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setFilterSub('ALL')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold cursor-pointer ${filterSub === 'ALL' ? 'bg-teal-700 text-white' : 'bg-white border border-slate-200 text-slate-700'}`}
        >
          All Ortho Specialties ({cases.length})
        </button>
        {orthoSpecialties.map((sp) => (
          <button
            key={sp}
            onClick={() => setFilterSub(sp)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold cursor-pointer ${filterSub === sp ? 'bg-teal-700 text-white' : 'bg-white border border-slate-200 text-slate-700'}`}
          >
            {sp}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map((c) => (
          <div key={c.id} className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-2.5">
            <div className="flex justify-between items-start">
              <div>
                <span className="font-mono text-xs font-bold text-teal-700">{c.caseUid}</span>
                <span className="ml-2 px-2.5 py-0.5 rounded-full text-xs font-bold bg-sky-100 text-sky-900">
                  {c.subSpecialty}
                </span>
                <h3 className="text-base font-bold text-slate-900 mt-1">{c.patientName} ({c.patientUid})</h3>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-teal-50 text-teal-800 border border-teal-200">
                  {c.status}
                </span>
                <button onClick={() => { setEditing({ ...c }); setModalOpen(true); }} className="p-1.5 rounded-lg bg-slate-100 hover:bg-amber-100 cursor-pointer"><Edit3 className="w-4 h-4" /></button>
                <button onClick={() => handleDelete(c.id)} className="p-1.5 rounded-lg bg-slate-100 hover:bg-rose-100 cursor-pointer"><Trash2 className="w-4 h-4" /></button>
              </div>
            </div>
            <div className="text-xs text-slate-700 space-y-1 bg-slate-50 p-3 rounded-xl">
              <div><strong>Anatomical Site:</strong> {c.affectedSite} | <strong>Severity:</strong> {c.severity}</div>
              <div><strong>Mechanism / Etiology:</strong> {c.mechanismOfInjury}</div>
              <div><strong>Assessment:</strong> {c.clinicalAssessment}</div>
              <div><strong>Treatment Plan:</strong> {c.treatmentPlan}</div>
              <div><strong>Implant / Prosthesis:</strong> <span className="text-teal-800 font-semibold">{c.implantOrFixation}</span></div>
              <div><strong>Rehab / Physiotherapy:</strong> {c.physiotherapyPlan}</div>
              <div className="text-slate-500 pt-1">Lead Surgeon: <strong>{c.surgeonName}</strong> • Date: {c.evaluationDate}</div>
            </div>
          </div>
        ))}
      </div>

      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl my-8">
            <div className="flex justify-between items-center pb-3 border-b">
              <h3 className="text-lg font-bold">{editing.id ? 'Edit Orthopaedic Case' : 'New Orthopaedic Case'}</h3>
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
                <label className="font-semibold block mb-1">Orthopaedic Sub-Specialty *</label>
                <select value={editing.subSpecialty} onChange={(e) => setEditing({ ...editing, subSpecialty: e.target.value })} className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white">
                  {orthoSpecialties.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label className="font-semibold block mb-1">Lead Orthopaedic Surgeon</label>
                <select value={editing.surgeonName} onChange={(e) => setEditing({ ...editing, surgeonName: e.target.value })} className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white">
                  {doctors.map((d) => <option key={d.id} value={d.fullName}>{d.fullName}</option>)}
                </select>
              </div>
              <div>
                <label className="font-semibold block mb-1">Affected Anatomical Site *</label>
                <input type="text" required value={editing.affectedSite} onChange={(e) => setEditing({ ...editing, affectedSite: e.target.value })} className="w-full px-3 py-2 rounded-xl border border-slate-300" placeholder="e.g., Right Knee, L4-L5 Spine, Distal Tibia" />
              </div>
              <div>
                <label className="font-semibold block mb-1">Mechanism / Etiology</label>
                <input type="text" value={editing.mechanismOfInjury} onChange={(e) => setEditing({ ...editing, mechanismOfInjury: e.target.value })} className="w-full px-3 py-2 rounded-xl border border-slate-300" />
              </div>
              <div>
                <label className="font-semibold block mb-1">Severity & Case Status</label>
                <div className="flex gap-2">
                  <input type="text" value={editing.severity} onChange={(e) => setEditing({ ...editing, severity: e.target.value })} className="w-1/2 px-2 py-2 rounded-xl border border-slate-300" />
                  <select value={editing.status} onChange={(e) => setEditing({ ...editing, status: e.target.value })} className="w-1/2 px-2 py-2 rounded-xl border border-slate-300 bg-white">
                    <option value="ACTIVE_TREATMENT">ACTIVE_TREATMENT</option>
                    <option value="SURGERY_SCHEDULED">SURGERY_SCHEDULED</option>
                    <option value="POST_OP_REHAB">POST_OP_REHAB</option>
                    <option value="RECOVERED">RECOVERED</option>
                  </select>
                </div>
              </div>
              <div className="sm:col-span-2">
                <label className="font-semibold block mb-1">Clinical & Radiological Assessment</label>
                <input type="text" value={editing.clinicalAssessment} onChange={(e) => setEditing({ ...editing, clinicalAssessment: e.target.value })} className="w-full px-3 py-2 rounded-xl border border-slate-300" />
              </div>
              <div className="sm:col-span-2">
                <label className="font-semibold block mb-1">Surgical / Conservative Treatment Plan</label>
                <input type="text" value={editing.treatmentPlan} onChange={(e) => setEditing({ ...editing, treatmentPlan: e.target.value })} className="w-full px-3 py-2 rounded-xl border border-slate-300" />
              </div>
              <div>
                <label className="font-semibold block mb-1">Implant / Prosthesis / Fixation Details</label>
                <input type="text" value={editing.implantOrFixation} onChange={(e) => setEditing({ ...editing, implantOrFixation: e.target.value })} className="w-full px-3 py-2 rounded-xl border border-slate-300" />
              </div>
              <div>
                <label className="font-semibold block mb-1">Physiotherapy & Rehab Protocol</label>
                <input type="text" value={editing.physiotherapyPlan} onChange={(e) => setEditing({ ...editing, physiotherapyPlan: e.target.value })} className="w-full px-3 py-2 rounded-xl border border-slate-300" />
              </div>
              <div className="sm:col-span-2 flex justify-end gap-2 pt-3 border-t">
                <button type="button" onClick={() => setModalOpen(false)} className="px-4 py-2 rounded-xl border cursor-pointer">Cancel</button>
                <button type="submit" className="px-5 py-2 rounded-xl bg-teal-600 text-white font-semibold cursor-pointer">Save Ortho Case</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

// ============================================================================
// MODULE 11: SURGERY, OPERATION THEATRE & ANAESTHESIOLOGY MANAGEMENT
// ============================================================================
export const SurgeryModule: React.FC<ClinicalProps> = ({ patients, doctors, onRefreshGlobal }) => {
  const [surgeries, setSurgeries] = useState<Surgery[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Surgery>({
    patientId: patients[0]?.id,
    patientName: patients[0]?.fullName || '',
    leadSurgeonName: 'Dr. K. Venkata Rama Rao',
    anaesthetistName: 'Dr. M. Rajasekhar Babu',
    anaesthesiaType: 'Combined Spinal + Epidural',
    procedureName: '',
    serviceCategory: 'Joint Replacement',
    operationTheatre: 'OT-1 (Modular Joint & Spine)',
    scheduledDate: new Date().toISOString().split('T')[0],
    scheduledTime: '09:00 AM',
    status: 'SCHEDULED',
    preOpChecklist: 'PAC Cleared, Consent Signed, Blood Cross-Matched',
    operativeNotes: '',
    estimatedCost: 85000,
  });

  const load = async () => setSurgeries(await api.get<Surgery[]>('/surgeries'));
  useEffect(() => { load(); }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editing.id) {
      await api.put(`/surgeries/${editing.id}`, editing);
    } else {
      await api.post('/surgeries', editing);
    }
    setModalOpen(false);
    await load();
    onRefreshGlobal();
  };

  const handleDelete = async (id?: number) => {
    if (!id || !window.confirm('Delete this surgery schedule?')) return;
    await api.delete(`/surgeries/${id}`);
    await load();
    onRefreshGlobal();
  };

  return (
    <div className="space-y-5">
      <div className="bg-white rounded-2xl p-5 border border-slate-200 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Scissors className="w-5 h-5 text-teal-600" /> Surgery, Modular OT & Anaesthesiology Management
          </h2>
          <p className="text-xs text-slate-500">Schedule operations, assign anaesthetists, update OT status, and record operative notes.</p>
        </div>
        <button
          onClick={() => {
            setEditing({
              patientId: patients[0]?.id,
              patientName: patients[0]?.fullName || '',
              leadSurgeonName: 'Dr. K. Venkata Rama Rao',
              anaesthetistName: 'Dr. M. Rajasekhar Babu',
              anaesthesiaType: 'Spinal Anaesthesia',
              procedureName: '',
              serviceCategory: 'Joint Replacement',
              operationTheatre: 'OT-1 (Modular Joint & Spine)',
              scheduledDate: new Date().toISOString().split('T')[0],
              scheduledTime: '09:30 AM',
              status: 'SCHEDULED',
              preOpChecklist: 'WHO Safety Checklist & PAC Verified',
              operativeNotes: '',
              estimatedCost: 90000,
            });
            setModalOpen(true);
          }}
          className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
        >
          <Plus className="w-4 h-4" /> + Schedule Surgery
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {surgeries.map((s) => (
          <div key={s.id} className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="space-y-1 text-xs">
              <div className="flex items-center gap-2">
                <span className="font-mono font-bold text-teal-700">{s.surgeryUid}</span>
                <span className="px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-800 font-bold">{s.operationTheatre}</span>
                <span className="px-2.5 py-0.5 rounded-full bg-sky-100 text-sky-800 font-semibold">{s.serviceCategory}</span>
              </div>
              <h3 className="text-base font-bold text-slate-900">{s.procedureName}</h3>
              <div className="text-slate-700">
                Patient: <strong>{s.patientName}</strong> ({s.patientUid}) | Surgeon: <strong>{s.leadSurgeonName}</strong>
              </div>
              <div className="text-slate-600">
                Anaesthetist: <strong>{s.anaesthetistName}</strong> ({s.anaesthesiaType}) | Cost Est: <strong>₹{s.estimatedCost.toLocaleString('en-IN')}</strong>
              </div>
              <div className="text-slate-500"><strong>Pre-Op:</strong> {s.preOpChecklist}</div>
              {s.operativeNotes && <div className="text-slate-700 bg-slate-50 p-2 rounded-lg"><strong>Operative Notes:</strong> {s.operativeNotes}</div>}
            </div>
            <div className="flex flex-col items-end gap-2 shrink-0">
              <div className="text-xs font-bold text-slate-800">{s.scheduledDate} • {s.scheduledTime}</div>
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-teal-100 text-teal-900">{s.status}</span>
              <div className="flex gap-1.5 mt-1">
                <button onClick={() => { setEditing({ ...s }); setModalOpen(true); }} className="px-3 py-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 text-xs font-semibold flex items-center gap-1 cursor-pointer">
                  <Edit3 className="w-3.5 h-3.5" /> Edit OT Record
                </button>
                <button onClick={() => handleDelete(s.id)} className="p-1.5 rounded-lg bg-slate-100 hover:bg-rose-100 cursor-pointer"><Trash2 className="w-4 h-4" /></button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl my-8">
            <div className="flex justify-between items-center pb-3 border-b">
              <h3 className="text-lg font-bold">{editing.id ? 'Edit Surgery & Anaesthesia Record' : 'Schedule New Surgery'}</h3>
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
                <label className="font-semibold block mb-1">Service Category</label>
                <select value={editing.serviceCategory} onChange={(e) => setEditing({ ...editing, serviceCategory: e.target.value })} className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white">
                  {HOSPITAL_SERVICES.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div className="sm:col-span-2">
                <label className="font-semibold block mb-1">Surgical Procedure Name *</label>
                <input type="text" required value={editing.procedureName} onChange={(e) => setEditing({ ...editing, procedureName: e.target.value })} className="w-full px-3 py-2 rounded-xl border border-slate-300" />
              </div>
              <div>
                <label className="font-semibold block mb-1">Lead Surgeon</label>
                <select value={editing.leadSurgeonName} onChange={(e) => setEditing({ ...editing, leadSurgeonName: e.target.value })} className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white">
                  {doctors.map((d) => <option key={d.id} value={d.fullName}>{d.fullName}</option>)}
                </select>
              </div>
              <div>
                <label className="font-semibold block mb-1">Anaesthetist</label>
                <input type="text" value={editing.anaesthetistName} onChange={(e) => setEditing({ ...editing, anaesthetistName: e.target.value })} className="w-full px-3 py-2 rounded-xl border border-slate-300" />
              </div>
              <div>
                <label className="font-semibold block mb-1">Anaesthesia Type</label>
                <select value={editing.anaesthesiaType} onChange={(e) => setEditing({ ...editing, anaesthesiaType: e.target.value })} className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white">
                  <option>Combined Spinal + Epidural</option>
                  <option>Spinal Anaesthesia</option>
                  <option>General Anaesthesia (Endotracheal)</option>
                  <option>Spinal + Adductor Canal Block</option>
                  <option>Regional Brachial Plexus Block</option>
                  <option>Local Anaesthesia + Sedation</option>
                </select>
              </div>
              <div>
                <label className="font-semibold block mb-1">Operation Theatre (OT)</label>
                <select value={editing.operationTheatre} onChange={(e) => setEditing({ ...editing, operationTheatre: e.target.value })} className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white">
                  <option>OT-1 (Modular Joint & Spine)</option>
                  <option>OT-2 (Keyhole & Arthroscopy)</option>
                  <option>OT-3 (General & Trauma)</option>
                </select>
              </div>
              <div>
                <label className="font-semibold block mb-1">Scheduled Date & Time</label>
                <div className="flex gap-2">
                  <input type="date" value={editing.scheduledDate} onChange={(e) => setEditing({ ...editing, scheduledDate: e.target.value })} className="w-1/2 px-2 py-2 rounded-xl border border-slate-300" />
                  <input type="text" value={editing.scheduledTime} onChange={(e) => setEditing({ ...editing, scheduledTime: e.target.value })} className="w-1/2 px-2 py-2 rounded-xl border border-slate-300" />
                </div>
              </div>
              <div>
                <label className="font-semibold block mb-1">Status & Est. Cost (₹)</label>
                <div className="flex gap-2">
                  <select value={editing.status} onChange={(e) => setEditing({ ...editing, status: e.target.value })} className="w-1/2 px-2 py-2 rounded-xl border border-slate-300 bg-white">
                    <option value="SCHEDULED">SCHEDULED</option>
                    <option value="PRE_OP">PRE_OP</option>
                    <option value="IN_SURGERY">IN_SURGERY</option>
                    <option value="POST_OP">POST_OP</option>
                    <option value="COMPLETED">COMPLETED</option>
                    <option value="CANCELLED">CANCELLED</option>
                  </select>
                  <input type="number" value={editing.estimatedCost} onChange={(e) => setEditing({ ...editing, estimatedCost: Number(e.target.value) })} className="w-1/2 px-2 py-2 rounded-xl border border-slate-300" />
                </div>
              </div>
              <div className="sm:col-span-2">
                <label className="font-semibold block mb-1">Pre-Op Safety Checklist</label>
                <input type="text" value={editing.preOpChecklist} onChange={(e) => setEditing({ ...editing, preOpChecklist: e.target.value })} className="w-full px-3 py-2 rounded-xl border border-slate-300" />
              </div>
              <div className="sm:col-span-2">
                <label className="font-semibold block mb-1">Operative & Post-Op Notes</label>
                <textarea rows={2} value={editing.operativeNotes} onChange={(e) => setEditing({ ...editing, operativeNotes: e.target.value })} className="w-full px-3 py-2 rounded-xl border border-slate-300" />
              </div>
              <div className="sm:col-span-2 flex justify-end gap-2 pt-3 border-t">
                <button type="button" onClick={() => setModalOpen(false)} className="px-4 py-2 rounded-xl border cursor-pointer">Cancel</button>
                <button type="submit" className="px-5 py-2 rounded-xl bg-teal-600 text-white font-semibold cursor-pointer">Save Surgery</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

// ============================================================================
// MODULE 12: 24x7 EMERGENCY PATIENT MANAGEMENT & TRIAGE
// ============================================================================
export const EmergencyModule: React.FC<ClinicalProps> = ({ doctors, onRefreshGlobal }) => {
  const [cases, setCases] = useState<EmergencyCase[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<EmergencyCase>({
    patientName: '',
    age: 35,
    gender: 'Male',
    contactPhone: '+91 ',
    triageLevel: 'CRITICAL_RED',
    traumaType: 'Road Traffic Accident (RTA)',
    chiefComplaint: '',
    attendingDoctor: doctors[0]?.fullName || 'Dr. Y. Phani Kumar',
    vitalsSummary: 'BP: 110/70 | HR: 104 | SpO2: 96%',
    immediateActionTaken: '',
    status: 'IN_TRIAGE',
  });

  const load = async () => setCases(await api.get<EmergencyCase[]>('/emergencies'));
  useEffect(() => { load(); }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editing.id) {
      await api.put(`/emergencies/${editing.id}`, editing);
    } else {
      await api.post('/emergencies', editing);
    }
    setModalOpen(false);
    await load();
    onRefreshGlobal();
  };

  const handleDelete = async (id?: number) => {
    if (!id || !window.confirm('Remove this emergency triage case?')) return;
    await api.delete(`/emergencies/${id}`);
    await load();
    onRefreshGlobal();
  };

  const triageColor = (lvl: string) => {
    if (lvl === 'CRITICAL_RED') return 'bg-rose-600 text-white';
    if (lvl === 'URGENT_ORANGE') return 'bg-orange-500 text-white';
    if (lvl === 'STABLE_YELLOW') return 'bg-amber-400 text-slate-950';
    return 'bg-emerald-600 text-white';
  };

  return (
    <div className="space-y-5">
      <div className="bg-gradient-to-r from-rose-700 to-rose-900 rounded-2xl p-5 text-white flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2">
            <AlertTriangle className="w-6 h-6 text-amber-300" /> 24x7 Emergency & Trauma Triage Command Board
          </h2>
          <p className="text-xs text-rose-100">
            Immediate casualty registration, trauma resuscitation tracking, and direct ICU/OT transfer.
          </p>
        </div>
        <button
          onClick={() => {
            setEditing({
              patientName: '',
              age: 35,
              gender: 'Male',
              contactPhone: '+91 ',
              triageLevel: 'CRITICAL_RED',
              traumaType: 'Road Traffic Accident (RTA)',
              chiefComplaint: '',
              attendingDoctor: 'Dr. Y. Phani Kumar',
              vitalsSummary: 'BP: 110/70 | HR: 105 | SpO2: 97%',
              immediateActionTaken: 'IV Line secured, Analgesics & Primary Splinting',
              status: 'IN_TRIAGE',
            });
            setModalOpen(true);
          }}
          className="px-4 py-2.5 rounded-xl bg-white text-rose-800 font-bold text-xs shadow cursor-pointer"
        >
          + Register Emergency Casualty
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {cases.map((c) => (
          <div key={c.id} className="bg-white rounded-2xl p-5 border-l-4 border-l-rose-600 border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="space-y-1 text-xs">
              <div className="flex items-center gap-2">
                <span className="font-mono font-bold text-slate-700">{c.emergencyUid}</span>
                <span className={`px-2.5 py-0.5 rounded-full font-bold ${triageColor(c.triageLevel)}`}>{c.triageLevel}</span>
                <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-800 font-bold">{c.status}</span>
              </div>
              <h3 className="text-base font-bold text-slate-900">
                {c.patientName} ({c.age}y / {c.gender}) — <span className="text-rose-700">{c.traumaType}</span>
              </h3>
              <div className="text-slate-700"><strong>Chief Complaint:</strong> {c.chiefComplaint}</div>
              <div className="text-slate-700"><strong>Vitals on Arrival:</strong> <span className="font-mono bg-slate-100 px-2 py-0.5 rounded">{c.vitalsSummary}</span></div>
              <div className="text-teal-800 font-medium"><strong>Immediate Action Taken:</strong> {c.immediateActionTaken}</div>
              <div className="text-slate-500">Attending: <strong>{c.attendingDoctor}</strong> • Contact: {c.contactPhone}</div>
            </div>
            <div className="flex gap-2 shrink-0">
              <button onClick={() => { setEditing({ ...c }); setModalOpen(true); }} className="px-3 py-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 text-xs font-semibold flex items-center gap-1 cursor-pointer">
                <Edit3 className="w-3.5 h-3.5" /> Edit Triage
              </button>
              <button onClick={() => handleDelete(c.id)} className="p-1.5 rounded-lg bg-slate-100 hover:bg-rose-100 cursor-pointer"><Trash2 className="w-4 h-4" /></button>
            </div>
          </div>
        ))}
      </div>

      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl">
            <div className="flex justify-between items-center pb-3 border-b">
              <h3 className="text-lg font-bold">{editing.id ? 'Edit Emergency Case' : 'Register Emergency Casualty'}</h3>
              <button onClick={() => setModalOpen(false)} className="cursor-pointer"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleSave} className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="font-semibold block mb-1">Patient Name *</label>
                <input type="text" required value={editing.patientName} onChange={(e) => setEditing({ ...editing, patientName: e.target.value })} className="w-full px-3 py-2 rounded-xl border border-slate-300" />
              </div>
              <div>
                <label className="font-semibold block mb-1">Age & Gender</label>
                <div className="flex gap-2">
                  <input type="number" value={editing.age} onChange={(e) => setEditing({ ...editing, age: Number(e.target.value) })} className="w-1/2 px-2 py-2 rounded-xl border border-slate-300" />
                  <select value={editing.gender} onChange={(e) => setEditing({ ...editing, gender: e.target.value })} className="w-1/2 px-2 py-2 rounded-xl border border-slate-300 bg-white">
                    <option>Male</option>
                    <option>Female</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="font-semibold block mb-1">Triage Priority Level</label>
                <select value={editing.triageLevel} onChange={(e) => setEditing({ ...editing, triageLevel: e.target.value })} className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white">
                  <option value="CRITICAL_RED">CRITICAL_RED (Immediate Resuscitation)</option>
                  <option value="URGENT_ORANGE">URGENT_ORANGE (Very Urgent)</option>
                  <option value="STABLE_YELLOW">STABLE_YELLOW (Urgent)</option>
                  <option value="MINOR_GREEN">MINOR_GREEN (Standard)</option>
                </select>
              </div>
              <div>
                <label className="font-semibold block mb-1">Current Disposition Status</label>
                <select value={editing.status} onChange={(e) => setEditing({ ...editing, status: e.target.value })} className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white">
                  <option value="IN_TRIAGE">IN_TRIAGE</option>
                  <option value="STABILIZING">STABILIZING</option>
                  <option value="TRANSFERRED_OT">TRANSFERRED_OT</option>
                  <option value="ADMITTED_ICU">ADMITTED_ICU</option>
                  <option value="DISCHARGED">DISCHARGED</option>
                </select>
              </div>
              <div>
                <label className="font-semibold block mb-1">Trauma / Emergency Category</label>
                <input type="text" required value={editing.traumaType} onChange={(e) => setEditing({ ...editing, traumaType: e.target.value })} className="w-full px-3 py-2 rounded-xl border border-slate-300" />
              </div>
              <div>
                <label className="font-semibold block mb-1">Attending Emergency Doctor</label>
                <input type="text" value={editing.attendingDoctor} onChange={(e) => setEditing({ ...editing, attendingDoctor: e.target.value })} className="w-full px-3 py-2 rounded-xl border border-slate-300" />
              </div>
              <div className="sm:col-span-2">
                <label className="font-semibold block mb-1">Vitals Summary</label>
                <input type="text" value={editing.vitalsSummary} onChange={(e) => setEditing({ ...editing, vitalsSummary: e.target.value })} className="w-full px-3 py-2 rounded-xl border border-slate-300" />
              </div>
              <div className="sm:col-span-2">
                <label className="font-semibold block mb-1">Chief Complaint & Injury Details</label>
                <input type="text" required value={editing.chiefComplaint} onChange={(e) => setEditing({ ...editing, chiefComplaint: e.target.value })} className="w-full px-3 py-2 rounded-xl border border-slate-300" />
              </div>
              <div className="sm:col-span-2">
                <label className="font-semibold block mb-1">Immediate Action / Resuscitation Taken</label>
                <textarea rows={2} value={editing.immediateActionTaken} onChange={(e) => setEditing({ ...editing, immediateActionTaken: e.target.value })} className="w-full px-3 py-2 rounded-xl border border-slate-300" />
              </div>
              <div className="sm:col-span-2 flex justify-end gap-2 pt-3 border-t">
                <button type="button" onClick={() => setModalOpen(false)} className="px-4 py-2 rounded-xl border cursor-pointer">Cancel</button>
                <button type="submit" className="px-5 py-2 rounded-xl bg-rose-600 text-white font-semibold cursor-pointer">Save Emergency Case</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
