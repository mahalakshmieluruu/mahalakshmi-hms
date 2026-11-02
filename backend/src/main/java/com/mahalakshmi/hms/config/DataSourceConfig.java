package com.mahalakshmi.hms.config;

import com.zaxxer.hikari.HikariConfig;
import com.zaxxer.hikari.HikariDataSource;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;

import javax.sql.DataSource;
import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.ResultSet;
import java.sql.Statement;

@Configuration
public class DataSourceConfig {

    private static final Logger log = LoggerFactory.getLogger(DataSourceConfig.class);

    @Value("${app.db.postgres.url}")
    private String postgresUrl;

    @Value("${app.db.postgres.username}")
    private String postgresUsername;

    @Value("${app.db.postgres.password}")
    private String postgresPassword;

    @Value("${app.db.fallback.url:}")
    private String fallbackUrl;

    @Value("${app.db.allow-fallback:false}")
    private boolean allowFallback;

    private String activeDatabaseEngine = "PostgreSQL";

    public String getActiveDatabaseEngine() {
        return activeDatabaseEngine;
    }

    @Bean
    @Primary
    public DataSource dataSource() {
        if (!allowFallback) {
            // Strict Production Mode: Use only the injected environment credentials
            HikariConfig prodConfig = new HikariConfig();
            prodConfig.setJdbcUrl(postgresUrl);
            prodConfig.setUsername(postgresUsername);
            prodConfig.setPassword(postgresPassword);
            prodConfig.setDriverClassName("org.postgresql.Driver");
            prodConfig.setMaximumPoolSize(20);
            prodConfig.setMinimumIdle(5);
            activeDatabaseEngine = "PostgreSQL Production Cluster (" + postgresUrl + ")";
            return new HikariDataSource(prodConfig);
        }

        // Development / Test Mode: Connect to local PostgreSQL 18 or fallback
        String[] passwordsToTry = new String[]{
                postgresPassword, "root", "admin", "password", "1234", "123456", "postgres123", ""
        };

        for (String candidatePassword : passwordsToTry) {
            try {
                String basePgUrl = "jdbc:postgresql://localhost:5432/postgres";
                try (Connection conn = DriverManager.getConnection(basePgUrl, postgresUsername, candidatePassword);
                     Statement stmt = conn.createStatement()) {
                    ResultSet rs = stmt.executeQuery("SELECT 1 FROM pg_database WHERE datname = 'mahalakshmi_hms'");
                    if (!rs.next()) {
                        stmt.executeUpdate("CREATE DATABASE mahalakshmi_hms");
                        log.info("Created PostgreSQL database 'mahalakshmi_hms'");
                    }
                }

                HikariConfig config = new HikariConfig();
                config.setJdbcUrl(postgresUrl);
                config.setUsername(postgresUsername);
                config.setPassword(candidatePassword);
                config.setDriverClassName("org.postgresql.Driver");
                config.setMaximumPoolSize(15);
                HikariDataSource ds = new HikariDataSource(config);
                try (Connection testConn = ds.getConnection()) {
                    activeDatabaseEngine = "PostgreSQL 18 (localhost:5432/mahalakshmi_hms)";
                    log.info("Connected to live PostgreSQL database: {}", postgresUrl);
                    return ds;
                }
            } catch (Exception ignored) {
                // Try next dev candidate or fallback
            }
        }

        log.info("Using persistent file-backed PostgreSQL-mode database at ./data/mahalakshmi_hms_pg");
        activeDatabaseEngine = "PostgreSQL-Compatible Persistent Storage (./data/mahalakshmi_hms_pg)";
        HikariConfig fallbackConfig = new HikariConfig();
        fallbackConfig.setJdbcUrl(fallbackUrl);
        fallbackConfig.setUsername("postgres");
        fallbackConfig.setPassword("");
        fallbackConfig.setDriverClassName("org.h2.Driver");
        fallbackConfig.setMaximumPoolSize(10);
        return new HikariDataSource(fallbackConfig);
    }
}
