package com.mahalakshmi.hms.controller;

import com.mahalakshmi.hms.model.AuditLog;
import com.mahalakshmi.hms.model.HospitalSettings;
import com.mahalakshmi.hms.model.UserAccount;
import com.mahalakshmi.hms.repository.AuditLogRepository;
import com.mahalakshmi.hms.repository.HospitalSettingsRepository;
import com.mahalakshmi.hms.repository.UserAccountRepository;
import com.mahalakshmi.hms.service.AuditService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
public class AdminController {

    private final UserAccountRepository userAccountRepository;
    private final HospitalSettingsRepository settingsRepository;
    private final AuditLogRepository auditLogRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuditService auditService;

    public AdminController(UserAccountRepository userAccountRepository,
                           HospitalSettingsRepository settingsRepository,
                           AuditLogRepository auditLogRepository,
                           PasswordEncoder passwordEncoder,
                           AuditService auditService) {
        this.userAccountRepository = userAccountRepository;
        this.settingsRepository = settingsRepository;
        this.auditLogRepository = auditLogRepository;
        this.passwordEncoder = passwordEncoder;
        this.auditService = auditService;
    }

    // ==================== STAFF & USER ROLE MANAGEMENT ====================
    @GetMapping("/users")
    public List<UserAccount> getAllUsers() {
        return userAccountRepository.findAll();
    }

    @PostMapping("/users")
    public UserAccount createUser(@RequestBody UserAccount user) {
        String rawPw = (user.getPlainPassword() != null && !user.getPlainPassword().isBlank())
                ? user.getPlainPassword()
                : "Hospital@2026";
        user.setPasswordHash(passwordEncoder.encode(rawPw));
        UserAccount saved = userAccountRepository.save(user);
        auditService.log("CREATE", "STAFF_USERS", saved.getUsername(), "Created staff user " + saved.getFullName() + " with role " + saved.getRole());
        return saved;
    }

    @PutMapping("/users/{id}")
    public ResponseEntity<UserAccount> updateUser(@PathVariable Long id, @RequestBody UserAccount updated) {
        return userAccountRepository.findById(id).map(existing -> {
            existing.setUsername(updated.getUsername());
            existing.setFullName(updated.getFullName());
            existing.setRole(updated.getRole());
            existing.setDepartment(updated.getDepartment());
            existing.setDesignation(updated.getDesignation());
            existing.setPhone(updated.getPhone());
            existing.setEmail(updated.getEmail());
            existing.setShiftTiming(updated.getShiftTiming());
            existing.setActive(updated.isActive());
            if (updated.getPlainPassword() != null && !updated.getPlainPassword().isBlank()) {
                existing.setPasswordHash(passwordEncoder.encode(updated.getPlainPassword()));
            }
            UserAccount saved = userAccountRepository.save(existing);
            auditService.log("UPDATE", "STAFF_USERS", saved.getUsername(), "Updated staff user " + saved.getFullName() + " [" + saved.getRole() + "]");
            return ResponseEntity.ok(saved);
        }).orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/users/{id}/toggle-active")
    public ResponseEntity<UserAccount> toggleUserActive(@PathVariable Long id) {
        return userAccountRepository.findById(id).map(existing -> {
            existing.setActive(!existing.isActive());
            UserAccount saved = userAccountRepository.save(existing);
            auditService.log(
                    saved.isActive() ? "ACTIVATE_USER" : "DEACTIVATE_USER",
                    "STAFF_USERS",
                    saved.getUsername(),
                    (saved.isActive() ? "Activated" : "Deactivated") + " account for " + saved.getFullName()
            );
            return ResponseEntity.ok(saved);
        }).orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/users/{id}/reset-password")
    public ResponseEntity<?> resetStaffPassword(@PathVariable Long id, @RequestBody Map<String, String> body) {
        String newPassword = body.getOrDefault("newPassword", "").trim();
        if (newPassword.length() < 6) {
            return ResponseEntity.badRequest().body(Map.of("error", "New password must be at least 6 characters"));
        }
        return userAccountRepository.findById(id).map(existing -> {
            existing.setPasswordHash(passwordEncoder.encode(newPassword));
            userAccountRepository.save(existing);
            auditService.log("PASSWORD_RESET", "STAFF_USERS", existing.getUsername(), "Password reset performed for staff user " + existing.getFullName());
            return ResponseEntity.ok(Map.of("reset", true, "username", existing.getUsername()));
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/users/{id}")
    public ResponseEntity<?> deleteUser(@PathVariable Long id) {
        return userAccountRepository.findById(id).map(existing -> {
            userAccountRepository.delete(existing);
            auditService.log("DELETE", "STAFF_USERS", existing.getUsername(), "Removed staff user " + existing.getFullName());
            return ResponseEntity.ok(Map.of("deleted", true));
        }).orElse(ResponseEntity.notFound().build());
    }

    // ==================== HOSPITAL SETTINGS ====================
    @GetMapping("/settings")
    public HospitalSettings getSettings() {
        return settingsRepository.findAll().stream().findFirst().orElseGet(() -> settingsRepository.save(new HospitalSettings()));
    }

    @PutMapping("/settings")
    public HospitalSettings updateSettings(@RequestBody HospitalSettings updated) {
        HospitalSettings existing = settingsRepository.findAll().stream().findFirst().orElse(new HospitalSettings());
        existing.setHospitalName(updated.getHospitalName());
        existing.setSubtitle(updated.getSubtitle());
        existing.setAddressLine1(updated.getAddressLine1());
        existing.setAddressLine2(updated.getAddressLine2());
        existing.setCity(updated.getCity());
        existing.setState(updated.getState());
        existing.setPincode(updated.getPincode());
        existing.setPrimaryPhone(updated.getPrimaryPhone());
        existing.setEmergencyPhone(updated.getEmergencyPhone());
        existing.setEmail(updated.getEmail());
        existing.setRegistrationNumber(updated.getRegistrationNumber());
        existing.setGstNumber(updated.getGstNumber());
        existing.setOwnerName(updated.getOwnerName());
        existing.setOperatingHours(updated.getOperatingHours());
        existing.setConfiguredServices(updated.getConfiguredServices());
        HospitalSettings saved = settingsRepository.save(existing);
        auditService.log("UPDATE", "SETTINGS", "HOSPITAL_CONFIG", "Updated hospital configuration & services");
        return saved;
    }

    // ==================== AUDIT LOGS ====================
    @GetMapping("/audit-logs")
    public List<AuditLog> getAuditLogs() {
        return auditLogRepository.findTop200ByOrderByTimestampDesc();
    }

    @DeleteMapping("/audit-logs/{id}")
    public ResponseEntity<?> deleteAuditLog(@PathVariable Long id) {
        auditLogRepository.deleteById(id);
        return ResponseEntity.ok(Map.of("deleted", true));
    }
}
