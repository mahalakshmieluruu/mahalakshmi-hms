export type UserRole = 'OWNER' | 'ADMIN' | 'DOCTOR' | 'NURSE' | 'RECEPTIONIST' | 'LAB_TECH' | 'BILLING';

export const HOSPITAL_SERVICES = [
  'Anaesthesiology',
  'Diagnostic Imaging',
  'Emergency Care',
  'General Checkups',
  'General Surgery',
  'Hospice Care',
  'Orthopaedics',
  'Outpatient Services',
  'Joint Replacement',
  'Fractures',
  'Spine Surgeries',
  'Trauma',
  'Joint Inflammation',
  'Ligament Tears',
  'Keyhole Surgeries',
];

export interface UserAccount {
  id?: number;
  username: string;
  plainPassword?: string;
  fullName: string;
  role: UserRole;
  department: string;
  designation: string;
  phone: string;
  email: string;
  shiftTiming: string;
  active: boolean;
  lastLoginAt?: string;
  lastLoginDevice?: string;
  createdAt?: string;
}

export interface SyncStatus {
  serverTimestamp: string;
  databaseEngine: string;
  environment: string;
  watermarkId: number;
  lastChangeAction: string;
  lastChangeBy: string;
  lastChangeTime: string;
  counts: {
    patients: number;
    appointments: number;
    admissions: number;
    availableBeds: number;
    labReports: number;
    emergencies: number;
    surgeries: number;
    invoices: number;
  };
}

export interface Doctor {
  id?: number;
  doctorCode: string;
  fullName: string;
  specialization: string;
  department: string;
  qualification: string;
  licenseNumber: string;
  experienceYears: number;
  phone: string;
  email: string;
  consultationFee: number;
  availabilitySchedule: string;
  roomNumber: string;
  available: boolean;
}

export interface Patient {
  id?: number;
  patientUid?: string;
  fullName: string;
  dateOfBirth: string;
  age: number;
  gender: string;
  bloodGroup: string;
  phone: string;
  address: string;
  emergencyContactName: string;
  emergencyContactPhone: string;
  emergencyContactRelation: string;
  allergies: string;
  medicalHistory: string;
  primaryService: string;
  assignedDoctorName: string;
  status: string;
  registrationDate: string;
}

export interface Appointment {
  id?: number;
  appointmentUid?: string;
  patientId?: number;
  patientName: string;
  patientUid?: string;
  doctorId?: number;
  doctorName: string;
  department: string;
  serviceCategory: string;
  appointmentDate: string;
  appointmentTime: string;
  visitType: string;
  status: string;
  reason: string;
  notes: string;
  tokenNumber: number;
}

export interface MedicalRecord {
  id?: number;
  recordUid?: string;
  patientId?: number;
  patientName: string;
  patientUid?: string;
  doctorId?: number;
  doctorName: string;
  department: string;
  serviceCategory: string;
  visitType: string;
  chiefComplaint: string;
  diagnosis: string;
  clinicalNotes: string;
  prescription: string;
  vitalsBp: string;
  vitalsPulse: string;
  vitalsTemp: string;
  vitalsSpo2: string;
  vitalsWeight: string;
  visitDate: string;
  followUpDate: string;
  followUpInstructions: string;
}

export interface WardBed {
  id?: number;
  bedNumber: string;
  wardName: string;
  bedType: string;
  floor: string;
  status: string;
  dailyCharge: number;
  currentPatientId?: number | null;
  currentPatientName?: string | null;
  currentPatientUid?: string | null;
  notes: string;
}

export interface Admission {
  id?: number;
  admissionUid?: string;
  patientId?: number;
  patientName: string;
  patientUid?: string;
  doctorId?: number;
  doctorName: string;
  department: string;
  bedId?: number;
  bedNumber: string;
  wardName: string;
  admissionReason: string;
  diagnosisOnAdmission: string;
  dischargeSummary: string;
  dischargeMedications: string;
  status: string;
  admissionDate: string;
  dischargeDate?: string;
}

export interface LabReport {
  id?: number;
  reportUid?: string;
  patientId?: number;
  patientName: string;
  patientUid?: string;
  orderedByDoctorId?: number;
  orderedByDoctorName: string;
  testName: string;
  testCategory: string;
  sampleType: string;
  resultValue: string;
  unit: string;
  referenceRange: string;
  abnormal: boolean;
  status: string;
  technicianName: string;
  verifiedBy?: string;
  orderedDate: string;
  completedDate?: string;
  verifiedDate?: string;
  pdfFileName?: string;
  pdfStoragePath?: string;
  testCost: number;
  clinicalRemarks: string;
}

export interface DiagnosticImaging {
  id?: number;
  imagingUid?: string;
  patientId?: number;
  patientName: string;
  patientUid?: string;
  orderedByDoctorName: string;
  modality: string;
  bodyPart: string;
  findings: string;
  impression: string;
  status: string;
  radiologistName: string;
  scanDate: string;
  cost: number;
}

export interface OrthopaedicCase {
  id?: number;
  caseUid?: string;
  patientId?: number;
  patientName: string;
  patientUid?: string;
  surgeonName: string;
  subSpecialty: string;
  affectedSite: string;
  mechanismOfInjury: string;
  severity: string;
  clinicalAssessment: string;
  treatmentPlan: string;
  implantOrFixation: string;
  physiotherapyPlan: string;
  status: string;
  evaluationDate: string;
}

export interface Surgery {
  id?: number;
  surgeryUid?: string;
  patientId?: number;
  patientName: string;
  patientUid?: string;
  leadSurgeonName: string;
  anaesthetistName: string;
  anaesthesiaType: string;
  procedureName: string;
  serviceCategory: string;
  operationTheatre: string;
  scheduledDate: string;
  scheduledTime: string;
  status: string;
  preOpChecklist: string;
  operativeNotes: string;
  estimatedCost: number;
}

export interface EmergencyCase {
  id?: number;
  emergencyUid?: string;
  patientId?: number | null;
  patientName: string;
  patientUid?: string;
  age: number;
  gender: string;
  contactPhone: string;
  triageLevel: string;
  traumaType: string;
  chiefComplaint: string;
  attendingDoctor: string;
  vitalsSummary: string;
  immediateActionTaken: string;
  status: string;
  arrivalTime?: string;
}

export interface Invoice {
  id?: number;
  invoiceUid?: string;
  patientId?: number;
  patientName: string;
  patientUid?: string;
  billingCategory: string;
  serviceDepartment: string;
  description: string;
  subtotal: number;
  discount: number;
  taxAmount: number;
  totalAmount?: number;
  paidAmount: number;
  balanceAmount?: number;
  paymentMethod: string;
  paymentStatus: string;
  billingDate: string;
  remarks: string;
}

export interface PharmacyItem {
  id?: number;
  itemCode?: string;
  medicineName: string;
  genericName: string;
  category: string;
  manufacturer: string;
  batchNumber: string;
  expiryDate: string;
  stockQuantity: number;
  reorderLevel: number;
  unitPrice: number;
  rackLocation: string;
}

export interface HospitalSettings {
  id?: number;
  hospitalName: string;
  subtitle: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  state: string;
  pincode: string;
  primaryPhone: string;
  emergencyPhone: string;
  email: string;
  registrationNumber: string;
  gstNumber: string;
  ownerName: string;
  operatingHours: string;
  configuredServices: string;
}

export interface AuditLog {
  id: number;
  username: string;
  userRole: string;
  action: string;
  module: string;
  entityId: string;
  details: string;
  timestamp: string;
}

export interface DashboardSummary {
  totalRegisteredPatients: number;
  todaysPatientVisits: number;
  currentlyAdmittedPatients: number;
  dischargedPatients: number;
  emergencyCases: number;
  totalBeds: number;
  occupiedBeds: number;
  availableBeds: number;
  maintenanceBeds: number;
  todaysAppointments: number;
  pendingLabReports: number;
  verifiedLabReports: number;
  scheduledSurgeries: number;
  dailyCollections: number;
  monthlyRevenue: number;
  outstandingPayments: number;
  totalDoctors: number;
  totalImagingScans: number;
  lowStockMedicines: number;
  databaseEngine: string;
  hospitalSettings: HospitalSettings;
  departmentAnalytics: { department: string; patients: number; revenue: number }[];
  revenueChartData: { category: string; collected: number; outstanding: number }[];
  orthoAnalytics: { specialty: string; cases: number }[];
  wardAnalytics: { ward: string; occupied: number; available: number; total: number }[];
  upcomingSurgeries: Surgery[];
  recentEmergencies: EmergencyCase[];
  todayAppointmentsList: Appointment[];
}
