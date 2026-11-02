# ============================================================================
# MAHALAKSHMI HOSPITAL HMS — DATABASE & VAULT RESTORE SCRIPT
# Usage: .\scripts\restore-db.ps1 -SqlFile .\backups\mahalakshmi_hms_YYYYMMDD.sql
# ============================================================================
param(
    [Parameter(Mandatory=$true)][string]$SqlFile,
    [string]$PgBin = "C:\Program Files\PostgreSQL\18\bin",
    [string]$DbName = "mahalakshmi_hms",
    [string]$DbUser = "postgres"
)

if (-not (Test-Path $SqlFile)) {
    Write-Error "Backup SQL file not found: $SqlFile"
    exit 1
}

Write-Host "Restoring PostgreSQL database '$DbName' from $SqlFile ..." -ForegroundColor Yellow
$env:PGPASSWORD = if ($env:DB_PASSWORD) { $env:DB_PASSWORD } else { "root" }
& "$PgBin\psql.exe" -U $DbUser -d $DbName -f $SqlFile
Write-Host "Database restore complete." -ForegroundColor Green
