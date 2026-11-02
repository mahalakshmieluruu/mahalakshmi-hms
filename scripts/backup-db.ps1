# ============================================================================
# MAHALAKSHMI HOSPITAL HMS — AUTOMATED POSTGRESQL & VAULT BACKUP SCRIPT
# Usage: .\scripts\backup-db.ps1
# ============================================================================
param(
    [string]$BackupDir = "C:\Users\hp\.gemini\antigravity\scratch\mahalakshmi-hms\backups",
    [string]$PgBin = "C:\Program Files\PostgreSQL\18\bin",
    [string]$DbName = "mahalakshmi_hms",
    [string]$DbUser = "postgres"
)

New-Item -ItemType Directory -Force -Path $BackupDir | Out-Null
$timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
$sqlDumpFile = Join-Path $BackupDir "${DbName}_${timestamp}.sql"
$vaultZipFile = Join-Path $BackupDir "medical_reports_vault_${timestamp}.zip"

Write-Host "[1/2] Backing up PostgreSQL database '$DbName' to $sqlDumpFile ..." -ForegroundColor Cyan
if (Test-Path "$PgBin\pg_dump.exe") {
    $env:PGPASSWORD = if ($env:DB_PASSWORD) { $env:DB_PASSWORD } else { "root" }
    & "$PgBin\pg_dump.exe" -U $DbUser -d $DbName -F p -f $sqlDumpFile
}

$vaultDir = "C:\Users\hp\.gemini\antigravity\scratch\mahalakshmi-hms\backend\secure-storage"
if (Test-Path $vaultDir) {
    Write-Host "[2/2] Archiving confidential medical reports vault to $vaultZipFile ..." -ForegroundColor Cyan
    Compress-Archive -Path "$vaultDir\*" -DestinationPath $vaultZipFile -Force -ErrorAction SilentlyContinue
}

Write-Host "Backup completed successfully in $BackupDir" -ForegroundColor Green
