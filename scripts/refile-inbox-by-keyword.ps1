# Route knowledge/_inbox files by filename patterns (after large Drive ingests with many .docx variants).
# Usage: powershell -ExecutionPolicy Bypass -File scripts/refile-inbox-by-keyword.ps1
$ErrorActionPreference = "Stop"
$root = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path
$k = Join-Path $root "knowledge"
$inbox = Join-Path $k "_inbox"

if (-not (Test-Path -LiteralPath $inbox)) {
  Write-Error "Inbox not found: $inbox"
}

function Ensure-Dir([string]$p) {
  if (-not (Test-Path $p)) { New-Item -ItemType Directory -Path $p -Force | Out-Null }
}

function Move-UniqueFile {
  param(
    [Parameter(Mandatory)][string]$SourcePath,
    [Parameter(Mandatory)][string]$DestDir
  )
  if (-not (Test-Path -LiteralPath $SourcePath)) { return }
  Ensure-Dir $DestDir
  $name = Split-Path $SourcePath -Leaf
  $dest = Join-Path $DestDir $name
  if (-not (Test-Path -LiteralPath $dest)) {
    Move-Item -LiteralPath $SourcePath -Destination $dest
    return
  }
  $h1 = (Get-FileHash -LiteralPath $SourcePath -Algorithm SHA256).Hash
  $h2 = (Get-FileHash -LiteralPath $dest -Algorithm SHA256).Hash
  if ($h1 -eq $h2) {
    Remove-Item -LiteralPath $SourcePath -Force
    return
  }
  $base = [IO.Path]::GetFileNameWithoutExtension($name)
  $ext = [IO.Path]::GetExtension($name)
  $i = 2
  $candidate = Join-Path $DestDir "${base} (drive-import $i)$ext"
  while (Test-Path -LiteralPath $candidate) { $i++; $candidate = Join-Path $DestDir "${base} (drive-import $i)$ext" }
  Move-Item -LiteralPath $SourcePath -Destination $candidate
}

function Dest([string]$rel) { Join-Path $k $rel }

# Ordered rules: first match wins. { Test = { param($n) ... }; Rel = 'path' }
$rules = @(
  @{ Test = { param($n) $n -like '0001 -*' -or $n -eq '00_DOSSIER_INDEX.txt' }; Rel = 'archive/legal-litigation' }
  @{ Test = { param($n) $n -eq '3 Merged .txt' -or $n -like '3 Merged*' }; Rel = 'archive/legal-litigation' }
  @{ Test = { param($n) $n -like '*Arbitration*' -or $n -like '*ANNEXURE A*' -or $n -like 'Actionable Legal Steps*' -or $n -like 'Allegations Legal Analysis*' }; Rel = 'archive/legal-litigation' }
  @{ Test = { param($n) $n -like 'Advanced Labour Arbitration*' -or $n -like 'AI Legal Strategy_*' -or $n -like 'AI Hallucinations in Disciplinary*' }; Rel = 'archive/legal-litigation' }
  @{ Test = { param($n) $n -like 'ATT Adriaan_*' }; Rel = 'archive/legal-litigation' }

  @{ Test = { param($n) $n -match '^APEX_FORENSIC|^API_CHANGES|^2_Suspicious_Items|^Aboutus\.txt$' }; Rel = 'archive/past-employers/global-batteries' }
  @{ Test = { param($n) $n -like '*Scrap*' -or $n -like '*Trojan*' -or $n -like '*Enertec*' -or $n -like '*Golf Cart Battery*' }; Rel = 'archive/past-employers/global-batteries' }
  @{ Test = { param($n) $n -like 'ACKNOWLEDGEMENT OF DEBT*' -or $n -like 'Acknowledgement of debt*' -or $n -eq 'Absa.docx' }; Rel = 'archive/past-employers/global-batteries' }

  @{ Test = { param($n) $n -like 'Alberton Car Battery*' -or $n -like '*Car Battery Alberton*' }; Rel = 'clients/alberton-battery-mart' }
  @{ Test = { param($n) $n -like 'AI Sales Scripting_*NEPQ*' -or $n -like 'ABM Google Ads Strategy For Battery Business*' -or $n -like 'ABM To do*' }; Rel = 'industry/automotive-batteries' }

  @{ Test = { param($n) $n -like '0000* Meta*' -or $n -like '0000*Meta*' -or $n -like '*Meta Business Suite*' -or $n -like '*Optimizing Facebook*' -or $n -eq '0001 Facebook.docx' }; Rel = 'channels/facebook-ads' }
  @{ Test = { param($n) $n -like 'Advanced Meta Ad Management*' -or $n -like '*Elite AI-driven Facebook*' -or $n -like '*Expert Facebook Ads Campaign*' }; Rel = 'channels/facebook-ads' }

  @{ Test = { param($n) $n -like '*Next.js*' -or $n -like '*React, Tailwind*' -or $n -like '*Setting Up a Next*' -or $n -like '*Front-End Tech Stack*' -or $n -like '*FinTech Backend*' -or $n -like '*identity_and_core_profile*' }; Rel = 'web-development' }
  @{ Test = { param($n) $n -like '*Advanced Next.js SEO*' -or $n -like '*Advanced Technical SEO for Next*' -or $n -like '*Web Design Blueprint*' -or $n -like 'AI-Driven Web Design*' }; Rel = 'web-development' }
  @{ Test = { param($n) $n -like 'AGENTS0001*' -or $n -like 'Agentic *' -or $n -like 'AI Drop-Servicing*' -or $n -like 'AI Detection*' }; Rel = 'web-development' }
  @{ Test = { param($n) $n -match '^\d{3} 040625 ' }; Rel = 'web-development' }
  @{ Test = { param($n) $n -like 'Alberton Web Design Dominance*' }; Rel = 'web-development' }

  @{ Test = { param($n) $n -like 'Apple Ad Style*' -or $n -like 'Apple_s Marketing*' }; Rel = 'creative-direction' }
  @{ Test = { param($n) $n -like 'Aetheria*' -or $n -like 'Advanced Creative Strategy*' -or $n -like 'Adobe Creative Cloud*' }; Rel = 'creative-direction' }
  @{ Test = { param($n) $n -like 'Advertising Creative Strategies*' -or $n -like 'Advertising Research and Strategy*' -or $n -like 'Advertising_ Creativity*' -or $n -like 'Advertising_s Creative*' }; Rel = 'creative-direction' }
  @{ Test = { param($n) $n -like 'Apex Collective 3*' -or $n -like 'Apex Drive*' }; Rel = 'creative-direction' }

  @{ Test = { param($n) $n -like 'African Game Tracking*' -or $n -like 'Ant Colony*' -or $n -like 'Ant Fungus*' -or $n -like 'Aggressive Game Farm SEO*' }; Rel = 'clients/miwesu/farm' }

  @{ Test = { param($n) $n -like 'Alberton_Germiston Used Car*' }; Rel = 'industry/misc-brand-social' }

  @{ Test = { param($n) $n -match '^0003[a-z]\.txt$|^0004[a-z]\.txt$|^0005[a-z]\.txt$|^0008\.txt$|^777[b-f]\.txt$' }; Rel = 'archive/misc' }
  @{ Test = { param($n) $n -match '^(012|013|015|016|017|018|019|020)\.txt$' }; Rel = 'archive/misc' }
  @{ Test = { param($n) $n -eq '00002_own_words.txt' }; Rel = 'archive/misc' }

  @{ Test = { param($n) $n -like 'Advanced 2026 Ecosystem*' }; Rel = 'web-development' }
  @{ Test = { param($n) $n -like 'Advanced Roulette*' }; Rel = 'archive/misc' }
  @{ Test = { param($n) $n -like 'Attracting Women*' -or $n -like 'Alex *' -or $n -like 'Alistair*' -or $n -like 'All American Muscle*' -or $n -like 'All the significant ones*' }; Rel = 'archive/misc' }
  @{ Test = { param($n) $n -like 'Also add my banking*' -or $n -like 'Add the original numbers*' -or $n -like '3 black 3 red*' -or $n -like 'Assembly line*' -or $n -eq 'Aria.docx' }; Rel = 'archive/misc' }
  @{ Test = { param($n) $n -like 'Analyzing Psychological Profiles*' -or $n -like 'Albert_10.03*' -or $n -like '058526Intro*' }; Rel = 'archive/misc' }
  @{ Test = { param($n) $n -like 'Summary & Current Status*' -or $n -like '# tactiq*' -or $n -like '10.06.25 TWO*' }; Rel = 'archive/misc' }

  @{ Test = { param($n) $n -eq '007.docx' }; Rel = 'archive/personal/wellbeing-research' }
  @{ Test = { param($n) $n -match '^0(10|11|12|13|14|15|16|17)\.docx$|^006(\(1\))?\.docx$|^008\.docx$|^009\.docx$|^002\.docx$|^003\.docx$|^004\.docx$|^005\.docx$' }; Rel = 'archive/misc' }
)

$dirs = @(
  "archive/legal-litigation", "archive/past-employers/global-batteries", "archive/misc",
  "archive/personal/wellbeing-research",
  "channels/facebook-ads", "web-development", "creative-direction",
  "clients/miwesu/farm", "clients/alberton-battery-mart",
  "industry/automotive-batteries", "industry/misc-brand-social"
)
foreach ($d in $dirs) { Ensure-Dir (Dest $d) }

Get-ChildItem -LiteralPath $inbox -File | Where-Object { $_.Name -ne '.gitkeep' } | ForEach-Object {
  $n = $_.Name
  $matched = $false
  foreach ($r in $rules) {
    if (& $r.Test $n) {
      Move-UniqueFile -SourcePath $_.FullName -DestDir (Dest $r.Rel)
      $matched = $true
      break
    }
  }
  if (-not $matched) {
    Write-Warning "No rule for: $n"
  }
}

$left = Get-ChildItem -LiteralPath $inbox -File -ErrorAction SilentlyContinue | Where-Object { $_.Name -ne '.gitkeep' }
if ($left) {
  Write-Host "Still in _inbox:" ($left.Name -join "`n")
} else {
  Write-Host "_inbox cleared (except .gitkeep)."
}
Write-Host "Keyword refile done."
