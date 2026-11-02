package com.mahalakshmi.hms.controller;

import com.mahalakshmi.hms.config.JwtUtil;
import com.mahalakshmi.hms.model.UserAccount;
import com.mahalakshmi.hms.repository.UserAccountRepository;
import com.mahalakshmi.hms.service.AuditService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final UserAccountRepository userAccountRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final AuditService auditService;

    @Value("${app.environment:development}")
    private String appEnvironment;

    public AuthController(UserAccountRepository userAccountRepository,
                          PasswordEncoder passwordEncoder,
                          JwtUtil jwtUtil,
                          AuditService auditService) {
        this.userAccountRepository = userAccountRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtil = jwtUtil;
        this.auditService = auditService;
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> credentials, HttpServletRequest request) {
        String username = credentials.getOrDefault("username", "").trim();
        String password = credentials.getOrDefault("password", "");

        Optional<UserAccount> userOpt = userAccountRepository.findByUsername(username);
        if (userOpt.isEmpty()) {
            return ResponseEntity.status(401).body(Map.of("error", "Invalid username or password"));
        }

        UserAccount user = userOpt.get();
        if (!user.isActive()) {
            return ResponseEntity.status(403).body(Map.of("error", "Account is deactivated. Contact Hospital Owner."));
        }

        if (!passwordEncoder.matches(password, user.getPasswordHash())) {
            return ResponseEntity.status(401).body(Map.of("error", "Invalid username or password"));
        }

        String userAgent = request.getHeader("User-Agent");
        String deviceSummary = summarizeDevice(userAgent);
        user.setLastLoginAt(LocalDateTime.now());
        user.setLastLoginDevice(deviceSummary);
        userAccountRepository.save(user);

        String token = jwtUtil.generateToken(user.getUsername(), user.getRole(), user.getFullName(), user.getId());
        auditService.log("LOGIN", "AUTH", user.getUsername(), "User logged in as " + user.getRole() + " from " + deviceSummary);

        Map<String, Object> response = new LinkedHashMap<>();
        response.put("token", token);
        response.put("user", user);
        return ResponseEntity.ok(response);
    }

    private String summarizeDevice(String ua) {
        if (ua == null || ua.isBlank()) return "Browser Client";
        if (ua.contains("iPhone")) return "iPhone (iOS Safari/Web)";
        if (ua.contains("iPad")) return "iPad (iPadOS)";
        if (ua.contains("Android")) return "Android Device";
        if (ua.contains("Macintosh")) return "MacBook / macOS";
        if (ua.contains("Windows")) return "Windows PC / Laptop";
        return "Web Browser Client";
    }

    @GetMapping("/me")
    public ResponseEntity<?> currentUser(Authentication authentication) {
        if (authentication == null) {
            return ResponseEntity.status(401).body(Map.of("error", "Not authenticated"));
        }
        return userAccountRepository.findByUsername(authentication.getName())
                .<ResponseEntity<?>>map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.status(404).body(Map.of("error", "User not found")));
    }

    @PutMapping("/change-password")
    public ResponseEntity<?> changeOwnPassword(Authentication authentication, @RequestBody Map<String, String> payload) {
        if (authentication == null) {
            return ResponseEntity.status(401).body(Map.of("error", "Not authenticated"));
        }
        String newPassword = payload.getOrDefault("newPassword", "").trim();
        if (newPassword.length() < 8) {
            return ResponseEntity.badRequest().body(Map.of("error", "Password must be at least 8 characters"));
        }
        return userAccountRepository.findByUsername(authentication.getName()).map(user -> {
            user.setPasswordHash(passwordEncoder.encode(newPassword));
            userAccountRepository.save(user);
            auditService.log("PASSWORD_CHANGE", "AUTH", user.getUsername(), "Staff member updated their password");
            return ResponseEntity.ok(Map.of("updated", true));
        }).orElseGet(() -> ResponseEntity.notFound().build());
    }

    @GetMapping("/demo-accounts")
    public List<Map<String, String>> getDemoAccounts() {
        if ("production".equalsIgnoreCase(appEnvironment)) {
            return Collections.emptyList();
        }
        return List.of(
                Map.of("role", "Owner / Super Admin", "username", "owner", "password", "Mahalakshmi@2026", "name", "Dr. K. Venkata Rama Rao"),
                Map.of("role", "Hospital Administrator", "username", "admin", "password", "Admin@2026", "name", "Smt. M. Padmavathi"),
                Map.of("role", "Senior Orthopaedic Surgeon", "username", "doctor", "password", "Doctor@2026", "name", "Dr. N. Srinivasa Chakravarthy"),
                Map.of("role", "Head Nurse (IPD/ICU)", "username", "nurse", "password", "Nurse@2026", "name", "Sr. P.Jhansi Lakshmi"),
                Map.of("role", "Front Desk Receptionist", "username", "reception", "password", "Reception@2026", "name", "K. Sai Kiran"),
                Map.of("role", "Chief Lab Technician", "username", "lab", "password", "Lab@2026", "name", "V. Satyanarayana"),
                Map.of("role", "Billing & Insurance Desk", "username", "billing", "password", "Billing@2026", "name", "G. Naga Raju")
        );
    }
}
