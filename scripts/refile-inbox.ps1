# Move known filenames from knowledge/_inbox into the taxonomy (same rules as ingest-drive-download).
# Use after an ingest left straggers, or when mappings were added retroactively.
# Usage: powershell -File scripts/refile-inbox.ps1
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

function Refile-List {
  param([string]$DestRel, [string[]]$Names)
  $dest = Join-Path $k $DestRel
  foreach ($n in $Names) {
    Move-UniqueFile -SourcePath (Join-Path $inbox $n) -DestDir $dest
  }
}

Refile-List "clients/absolute-offroad" @(
  "EFS Toyota Suspension Research South Africa.docx",
  "EFS Toyota Suspension Research South Africa.txt",
  "EFS Toyota Suspension Research South Africa (docx).txt",
  "EFS Suspension Shock Absorber Research.docx",
  "EFS Suspension Shock Absorber Research.txt",
  "EFS Suspension Shock Absorber Research (docx).txt",
  "991782 EFS Suspension Shock Absorber Research.docx",
  "991782 EFS Suspension Shock Absorber Research.txt",
  "991782 EFS Suspension Shock Absorber Research (docx).txt",
  "EFS Marketing Research Strategy Outline.docx",
  "EFS Marketing Research Strategy Outline.txt",
  "EFS Marketing Research Strategy Outline (docx).txt",
  "4x4 Social Media Plan Development.docx",
  "4x4 Social Media Plan Development.txt",
  "4x4 Social Media Plan Development (docx).txt",
  "Social Media Calendar For Offroad Business.docx",
  "Social Media Calendar For Offroad Business.txt",
  "Social Media Calendar For Offroad Business (docx).txt"
)

Refile-List "clients/alberton-tyre-clinic" @(
  "South African Tire Stock Research.docx",
  "South African Tire Stock Research.txt",
  "South African Tire Stock Research (docx).txt",
  "Tire Brand Deep Dive for Social Media.docx",
  "Tire Brand Deep Dive for Social Media.txt",
  "Tire Brand Deep Dive for Social Media (docx).txt"
)

Refile-List "web-development" @(
  "AI Agency Research for Gauteng.docx",
  "AI Agency Research for Gauteng.txt",
  "AI Agency Research for Gauteng (docx).txt",
  "AI Agency Growth Strategy for Gauteng.docx",
  "AI Agency Growth Strategy for Gauteng.txt",
  "AI Agency Growth Strategy for Gauteng (docx).txt",
  "AI Agents for Flawless Website SEO.docx",
  "AI Agents for Flawless Website SEO.txt",
  "AI Agents for Flawless Website SEO (docx).txt",
  "AI Business Offers for Gauteng.docx",
  "AI Business Offers for Gauteng.txt",
  "AI Business Offers for Gauteng (docx).txt",
  "AI Social Media Content Generation System.docx",
  "AI Social Media Content Generation System.txt",
  "AI Social Media Content Generation System (docx).txt",
  "AI-Human Content Generation Research Plan.docx",
  "AI-Human Content Generation Research Plan.txt",
  "AI-Human Content Generation Research Plan (docx).txt",
  "Building The Ultimate Marketing Brain.docx",
  "Building The Ultimate Marketing Brain.txt",
  "Building The Ultimate Marketing Brain (docx).txt",
  "Next Level UI_UX Design Research.docx",
  "Next Level UI_UX Design Research.txt",
  "Next Level UI_UX Design Research (docx).txt",
  "Premium Social Dashboard Architecture.docx",
  "Premium Social Dashboard Architecture.txt",
  "Premium Social Dashboard Architecture (docx).txt",
  "Workshop App Development Plan.docx",
  "Workshop App Development Plan.txt",
  "Workshop App Development Plan (docx).txt"
)

Refile-List "channels/seo" @(
  "AI SEO Strategy for Financial Services.docx",
  "AI SEO Strategy for Financial Services.txt",
  "AI SEO Strategy for Financial Services (docx).txt"
)

Refile-List "creative-direction" @(
  "AI Image Generation Product Fidelity.docx",
  "AI Image Generation Product Fidelity.txt",
  "AI Image Generation Product Fidelity (docx).txt",
  "Visual Asset Research Prioritization.docx",
  "Visual Asset Research Prioritization.txt",
  "Visual Asset Research Prioritization (docx).txt",
  "South African Underworld Investigation.docx",
  "South African Underworld Investigation.txt",
  "South African Underworld Investigation (docx).txt"
)

Refile-List "clients/miwesu/farm" @(
  "Red Hartebeest Research for Game Reserve.docx",
  "Red Hartebeest Research for Game Reserve.txt",
  "Red Hartebeest Research for Game Reserve (docx).txt",
  "South Africa Lodge Competition Analysis.docx",
  "South Africa Lodge Competition Analysis.txt",
  "South Africa Lodge Competition Analysis (docx).txt"
)

Refile-List "clients/as-brokers" @(
  "Website Redesign Research for AS Brokers.docx",
  "Website Redesign Research for AS Brokers.txt",
  "Website Redesign Research for AS Brokers (docx).txt",
  "Website Redesign Research for AS Brokers(1).docx",
  "Website Redesign Research for AS Brokers (1).txt",
  "Website Redesign Research for AS Brokers(1).txt",
  "Website Redesign Research for AS Brokers (1) (docx).txt"
)

Refile-List "clients/alberton-tyre-clinic" @(
  "Dunlop Tyres South Africa Social Media Plan.docx",
  "Dunlop Tyres South Africa Social Media Plan.txt",
  "Dunlop Tyres South Africa Social Media Plan (2).txt",
  "Dunlop Tyres South Africa Social Media Plan (docx).txt",
  "Social Media Plan for Tire Store.docx",
  "Social Media Plan for Tire Store.txt",
  "Social Media Plan for Tire Store (1).txt",
  "Social Media Plan for Tire Store (docx).txt",
  "Social Media Plan For Tyre Clinic.docx",
  "Social Media Plan For Tyre Clinic.txt",
  "Social Media Plan For Tyre Clinic (1).txt",
  "Social Media Plan For Tyre Clinic (docx).txt"
)

Refile-List "clients/alberton-battery-mart" @(
  "Social Media Plan For Battery Mart (1).docx"
)

Refile-List "clients/absolute-offroad" @(
  "South African 4x4 Market Research.docx",
  "South African 4x4 Market Research.txt",
  "South African 4x4 Market Research (docx).txt"
)

Refile-List "web-development" @(
  "AI Agents for Flawless SEO Audits.docx",
  "AI Tools for Agency Growth.docx",
  "Building Hierarchical AI Agents.docx",
  "Building Rolls Royce Website with Cursor.docx",
  "Cursor Rules and AI Agents.docx",
  "Generative UI Chatbot Implementation Plan.docx",
  "Micro-SaaS Roadmap for South Africa.docx",
  "Next.js SEO & Schema Implementation Plan.docx"
)

Refile-List "archive/legal-litigation" @(
  "Arbitration Case Strategy_ Drikus Botha.docx",
  "LRA-7.11-Referring-a-dispute-to-the-DRC.docx"
)

Refile-List "clients/as-brokers" @(
  "Building a Custom Brokerage Chatbot.docx",
  "Facebook Ad Strategy for AS Brokers.docx"
)

Refile-List "clients/maverick-painting-contractors" @(
  "Facebook Ads Strategy For Painting Company.docx"
)

Refile-List "clients/miwesu/farm" @(
  "Hunting Safari Digital Strategy Research.docx"
)

Refile-List "clients/alberton-tyre-clinic" @(
  "Competitor Research for Alberton Website.docx"
)

Refile-List "creative-direction" @(
  "South African Underworld Connections Explored.docx"
)

Refile-List "archive/misc" @(
  "Everest Wealth Product Analysis.docx",
  "Website Revamp Research and Strategy.docx",
  "Unconventional AI Money-Making Strategies.docx",
  "Unconventional AI Money-Making Strategies(1).docx",
  "Unconventional AI Money-Making Strategies(2).docx"
)

Refile-List "web-development" @(
  "2026.03.29 AI Web Design Refinement Strategy.docx",
  "2026.03.29 Elite Full-Stack Development Blueprint.docx"
)

Refile-List "clients/miwesu/farm" @(
  "Animal Shot Placement Illustrations.docx",
  "Blesbok Research for Game Reserve.docx",
  "Cape Buffalo Deep Dive Research.docx",
  "Golden Wildebeest Research for Game Reserve.docx"
)

Refile-List "creative-direction" @(
  "Apple Ad Style Analysis and Replication (2).docx",
  "Apple_s Marketing_ Research Framework_.docx"
)

$left = Get-ChildItem -LiteralPath $inbox -File -ErrorAction SilentlyContinue
if ($left.Count -gt 0) {
  Write-Host "Still in _inbox:" ($left.Name -join ", ")
} else {
  Write-Host "_inbox is empty."
}
Write-Host "Refile done."
