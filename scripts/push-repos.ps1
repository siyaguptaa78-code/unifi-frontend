# UniCafe Dual-Repository Git Push Helper Script
# This script pushes both Frontend and Backend to their respective GitHub repositories.

param (
    [string]$GitHubToken = ""
)

$RootDir = "$PSScriptRoot\.."
$GitExe = "$RootDir\.tools\mingit\cmd\git.exe"

if (-not (Test-Path $GitExe)) {
    $GitExe = "git"
}

Write-Host "=======================================================" -ForegroundColor Cyan
Write-Host "       ☕ UNICAFE DUAL-REPOSITORY GITHUB PUSH" -ForegroundColor Cyan
Write-Host "=======================================================" -ForegroundColor Cyan

if ($GitHubToken -ne "") {
    $FrontendUrl = "https://$($GitHubToken)@github.com/anuraagmishra21-spec/unificafe_-Frontend.git"
    $BackendUrl = "https://$($GitHubToken)@github.com/anuraagmishra21-spec/unificafe_backend.git"
} else {
    $FrontendUrl = "origin"
    $BackendUrl = "origin"
}

Write-Host "`n[1/2] Pushing Frontend Repository to GitHub..." -ForegroundColor Yellow
Set-Location $RootDir
& $GitExe push -u $FrontendUrl main
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Frontend successfully pushed to https://github.com/anuraagmishra21-spec/unificafe_-Frontend" -ForegroundColor Green
} else {
    Write-Host "❌ Frontend push failed. If authentication was required, provide your GitHub PAT:" -ForegroundColor Red
    Write-Host "   powershell -File scripts/push-repos.ps1 -GitHubToken <YOUR_GITHUB_TOKEN>" -ForegroundColor Yellow
}

Write-Host "`n[2/2] Pushing Backend Repository to GitHub..." -ForegroundColor Yellow
Set-Location "$RootDir\backend"
& $GitExe push -u $BackendUrl main
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Backend successfully pushed to https://github.com/anuraagmishra21-spec/unificafe_backend" -ForegroundColor Green
} else {
    Write-Host "❌ Backend push failed. If authentication was required, provide your GitHub PAT:" -ForegroundColor Red
    Write-Host "   powershell -File scripts/push-repos.ps1 -GitHubToken <YOUR_GITHUB_TOKEN>" -ForegroundColor Yellow
}

Set-Location $RootDir
Write-Host "`nPush sequence completed." -ForegroundColor Cyan
