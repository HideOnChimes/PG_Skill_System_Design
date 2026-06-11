# system-design-pg installer (Windows / PowerShell 5.1+)
# Run:  irm https://raw.githubusercontent.com/HideOnChimes/PG_Skill_System_Design/main/install.ps1 | iex
$ErrorActionPreference = 'Stop'

$Repo      = 'HideOnChimes/PG_Skill_System_Design'
$Branch    = 'main'
$SkillsDir = Join-Path $HOME '.claude\skills'
$Dest      = Join-Path $SkillsDir 'system-design-pg'

Write-Host ""
Write-Host "  system-design-pg  -- Claude Code skill installer" -ForegroundColor Cyan
Write-Host ""

# --- Node >= 18 ---
$node = Get-Command node -ErrorAction SilentlyContinue
if (-not $node) {
    Write-Host "  X  Node nao encontrado. Instale Node >= 18: https://nodejs.org" -ForegroundColor Red
    return
}
$ver = (& node --version) -replace 'v',''
$major = [int]($ver.Split('.')[0])
if ($major -lt 18) {
    Write-Host "  X  Node $ver muito antigo. Precisa >= 18." -ForegroundColor Red
    return
}
Write-Host "  ok  Node $ver" -ForegroundColor Green

# --- download tarball (sem precisar de git) ---
$tmp = Join-Path $env:TEMP ("sdpg-" + [System.Guid]::NewGuid().ToString('N'))
New-Item -ItemType Directory -Force -Path $tmp | Out-Null
$tarUrl = "https://github.com/$Repo/archive/refs/heads/$Branch.tar.gz"
Write-Host "  .. baixando skill de $Repo" -ForegroundColor Gray
Invoke-WebRequest -Uri $tarUrl -OutFile (Join-Path $tmp 'src.tar.gz')
tar -xzf (Join-Path $tmp 'src.tar.gz') -C $tmp

$repoName = ($Repo.Split('/')[-1])
$srcSkill = Join-Path $tmp "$repoName-$Branch\skill\system-design-pg"
if (-not (Test-Path $srcSkill)) {
    Write-Host "  X  Estrutura do repo inesperada: $srcSkill nao existe." -ForegroundColor Red
    Remove-Item $tmp -Recurse -Force
    return
}

# --- copiar pra ~/.claude/skills/system-design-pg ---
New-Item -ItemType Directory -Force -Path $SkillsDir | Out-Null
if (Test-Path $Dest) { Remove-Item $Dest -Recurse -Force }
Copy-Item $srcSkill $Dest -Recurse
Write-Host "  ok  skill copiada -> $Dest" -ForegroundColor Green

# --- npm install (sem baixar Chromium; usa Chrome do sistema) ---
Write-Host "  .. instalando dependencias do renderer (npm)" -ForegroundColor Gray
Push-Location (Join-Path $Dest 'scripts')
$env:PUPPETEER_SKIP_DOWNLOAD = 'true'
& npm install --silent --no-fund --no-audit
Pop-Location

Remove-Item $tmp -Recurse -Force

Write-Host ""
Write-Host "  Pronto!  Abra uma nova sessao do Claude Code e peca:" -ForegroundColor Cyan
Write-Host '    "Faca o design de um sistema X -- quero md, diagrama e PDF."' -ForegroundColor White
Write-Host ""
