-- ============================================================================
-- MAHALAKSHMI HOSPITAL MANAGEMENT SYSTEM (ELURU, AP 534002)
-- V1 Production PostgreSQL Schema Migration Baseline
-- ============================================================================

CREATE TABLE IF NOT EXISTS user_accounts (
    id BIGSERIAL PRIMARY KEY,
    username VARCHAR(120) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    role VARCHAR(60) NOT NULL,
    department VARCHAR(150),
    designation VARCHAR(150),
    phone VARCHAR(60),
    email VARCHAR(150),
    shift_timing VARCHAR(120),
    active BOOLEAN DEFAULT TRUE,
    last_login_at TIMESTAMP,
    last_login_device VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS doctors (
    id BIGSERIAL PRIMARY KEY,
    doctor_code VARCHAR(80) UNIQUE NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    specialization VARCHAR(255) NOT NULL,
    department VARCHAR(150) NOT NULL,
    qualification VARCHAR(255),
    license_number VARCHAR(100),
    experience_years INT DEFAULT 0,
    phone VARCHAR(60),
    email VARCHAR(150),
    consultation_fee DOUBLE PRECISION DEFAULT 500,
    availability_schedule VARCHAR(255),
    room_number VARCHAR(60),
    available BOOLEAN DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS patients (
    id BIGSERIAL PRIMARY KEY,
    patient_uid VARCHAR(80) UNIQUE NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    date_of_birth DATE,
    age INT DEFAULT 0,
    gender VARCHAR(40),
    blood_group VARCHAR(20),
    phone VARCHAR(60),
    address VARCHAR(1000),
    emergency_contact_name VARCHAR(255),
    emergency_contact_phone VARCHAR(60),
    emergency_contact_relation VARCHAR(80),
    allergies VARCHAR(2000),
    medical_history VARCHAR(3000),
    primary_service VARCHAR(150),
    assigned_doctor_name VARCHAR(255),
    status VARCHAR(60) DEFAULT 'OUTPATIENT',
    registration_date DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    version BIGINT DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_patients_uid ON patients(patient_uid);
CREATE INDEX IF NOT EXISTS idx_patients_phone ON patients(phone);
CREATE INDEX IF NOT EXISTS idx_patients_name ON patients(full_name);

CREATE TABLE IF NOT EXISTS audit_logs (
    id BIGSERIAL PRIMARY KEY,
    username VARCHAR(120),
    user_role VARCHAR(60),
    action VARCHAR(80),
    module VARCHAR(80),
    entity_id VARCHAR(120),
    details VARCHAR(2000),
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
