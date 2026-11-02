package com.mahalakshmi.hms;

import com.mahalakshmi.hms.controller.DashboardController;
import com.mahalakshmi.hms.controller.HealthSyncController;
import com.mahalakshmi.hms.controller.OnboardingExportController;
import com.mahalakshmi.hms.model.Patient;
import com.mahalakshmi.hms.repository.PatientRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.ResponseEntity;
import org.springframework.test.context.ActiveProfiles;

import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@ActiveProfiles("test")
class MahalakshmiHmsIntegrationTests {

    @Autowired
    private DashboardController dashboardController;

    @Autowired
    private HealthSyncController healthSyncController;

    @Autowired
    private OnboardingExportController onboardingController;

    @Autowired
    private PatientRepository patientRepository;

    @Test
    void contextLoadsAndDatabaseSeedsCorrectly() {
        Map<String, Object> summary = dashboardController.getSummary();
        assertNotNull(summary);
        assertTrue(((Number) summary.get("totalRegisteredPatients")).longValue() >= 7);
        assertTrue(((Number) summary.get("totalBeds")).longValue() >= 11);

        List<Patient> patients = patientRepository.findAll();
        assertFalse(patients.isEmpty());
    }

    @Test
    void healthAndMultiDeviceSyncStatusWork() {
        Map<String, Object> health = healthSyncController.healthCheck();
        assertEquals("UP", health.get("status"));

        Map<String, Object> sync = healthSyncController.syncStatus();
        assertNotNull(sync.get("serverTimestamp"));
        assertNotNull(sync.get("counts"));
    }

    @Test
    void onboardingPreviewValidationAndDuplicateProtectionWork() {
        String testCsv =
                "patientUid,fullName,dateOfBirth,age,gender,bloodGroup,phone,address,emergencyContactName,emergencyContactPhone,allergies,medicalHistory,primaryService,assignedDoctorName,status\n" +
                "MHL-2026-9901,Test Onboarding Patient,1985-04-10,41,Male,O+,+91 98480-99001,Eluru AP,Contact,9848099002,None,None,Orthopaedics,Dr. K. Venkata Rama Rao,OUTPATIENT\n" +
                "MHL-2026-1001,D. Suryanarayana Murthy,1962-04-15,64,Male,B+,+91 98483-10293,Eluru,Son,9848399881,Sulfa,Duplicate Check,Joint Replacement,Dr. K. Venkata Rama Rao,ADMITTED\n" +
                "MHL-2026-9902,,1990-01-01,36,Female,A+,12,Invalid Row,,,,,,OUTPATIENT\n";

        Map<String, Object> preview = onboardingController.previewImport("patients", Map.of("csvContent", testCsv));
        assertEquals(3, preview.get("totalRows"));
        assertEquals(1, preview.get("validCount"));
        assertEquals(1, preview.get("duplicateCount"));
        assertEquals(1, preview.get("invalidCount"));

        ResponseEntity<byte[]> exported = onboardingController.exportData("patients");
        assertEquals(200, exported.getStatusCode().value());
        assertNotNull(exported.getBody());
        assertTrue(exported.getBody().length > 100);
    }
}
