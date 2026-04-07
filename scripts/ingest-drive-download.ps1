# Ingest Google Drive export: move files into knowledge/ taxonomy with dedupe-on-collision.
# Usage: powershell -File scripts/ingest-drive-download.ps1 drive-download-20260405T132518Z-1-001
[CmdletBinding()]
param(
  [Parameter(Position = 0, Mandatory = $true)]
  [string] $DriveFolderName
)
$ErrorActionPreference = "Stop"
$root = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path
$k = Join-Path $root "knowledge"
$src = Join-Path $k $DriveFolderName

if (-not (Test-Path -LiteralPath $src)) {
  Write-Error "Source folder not found: $src"
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

# --- dirs ---
$paths = @(
  "archive/legal-litigation",
  "archive/misc",
  "archive/personal/wellbeing-research",
  "archive/past-employers/global-batteries",
  "audiences",
  "channels/facebook-ads/data-exports",
  "channels/facebook-ads/reports",
  "channels/seo",
  "clients/absolute-offroad",
  "clients/absolute-offroad/media",
  "clients/alberton-battery-mart",
  "clients/alberton-tyre-clinic",
  "clients/rhino-panelbeaters",
  "clients/as-brokers",
  "clients/maverick-painting-contractors",
  "clients/xsphere",
  "clients/miwesu/farm",
  "clients/miwesu/wood",
  "clients/vaalpenskraal/wood",
  "industry/automotive-batteries",
  "industry/misc-brand-social",
  "web-development"
)
foreach ($p in $paths) { Ensure-Dir (Join-Path $k $p) }

# --- extensionless JSON → farm ---
$jsonPairs = @(
  @("Hyper-Realistic Luxury_ Miwesu Game Farm", "Hyper-Realistic Luxury_ Miwesu Game Farm.json"),
  @("Miwesu Game Farm Hunt Standards", "Miwesu Game Farm Hunt Standards.json")
)
foreach ($pair in $jsonPairs) {
  $old = Join-Path $src $pair[0]
  if (Test-Path -LiteralPath $old) {
    $newName = $pair[1]
    $tmp = Join-Path $src $newName
    Rename-Item -LiteralPath $old -NewName $newName
    Move-UniqueFile -SourcePath $tmp -DestDir (Join-Path $k "clients/miwesu/farm")
  }
}

# --- Named spreadsheets (before generic .csv/.xlsx → data-exports) ---
$namedSpreadsheetPairs = @(
  @("LAUNCH - Global Batteries - Battery Selection Guide.xlsx", "archive/past-employers/global-batteries"),
  @("CustomerTransactionsReport (33).csv", "archive/past-employers/global-batteries"),
  @("CustomerTransactionsReport (58).csv", "archive/past-employers/global-batteries"),
  @("Shipments.csv", "archive/past-employers/global-batteries"),
  @("FNB_catelogue_2017 (1).xlsx", "archive/misc"),
  @("TEST SHEET ONLINE PLATFORMS.xlsx", "web-development"),
  @("Learning and Goal Setting Principles by Justin Sung.xlsx", "archive/misc")
)
foreach ($pair in $namedSpreadsheetPairs) {
  Move-UniqueFile -SourcePath (Join-Path $src $pair[0]) -DestDir (Join-Path $k $pair[1])
}

# --- Absolute Offroad media (images / exports; extensionless ad asset) ---
$absMediaDest = Join-Path $k "clients/absolute-offroad/media"
Get-ChildItem -LiteralPath $src -File -ErrorAction SilentlyContinue | Where-Object {
  $_.Extension -match '^\.(jpg|jpeg|png|gif|webp)$' -or $_.Name -eq 'Rugged 4x4 Shock Absorber Ad'
} | ForEach-Object {
  Move-UniqueFile -SourcePath $_.FullName -DestDir $absMediaDest
}

# --- Meta / spreadsheet exports ---
Get-ChildItem -LiteralPath $src -File | Where-Object {
  $_.Extension -match '^\.(csv|xlsx)$'
} | ForEach-Object {
  Move-UniqueFile -SourcePath $_.FullName -DestDir (Join-Path $k "channels/facebook-ads/data-exports")
}

# --- Markdown reports ---
Get-ChildItem -LiteralPath $src -Filter "*.md" -File | ForEach-Object {
  Move-UniqueFile -SourcePath $_.FullName -DestDir (Join-Path $k "channels/facebook-ads/reports")
}

# --- Python → repo scripts ---
$py = Join-Path $src "build_miwesu_master.py"
if (Test-Path -LiteralPath $py) {
  Ensure-Dir (Join-Path $root "scripts")
  Move-UniqueFile -SourcePath $py -DestDir (Join-Path $root "scripts")
}

# --- Group: miwesu farm (game lodge / hunting SEO) ---
$farmNames = @(
  "Aggressive Game Farm SEO Strategy.docx",
  "Aggressive Game Farm SEO Strategy.txt",
  "Dominating Game Farm SEO Strategy.docx",
  "Dominating Game Farm SEO Strategy.txt",
  "Flawless Game Farm SEO Strategy.docx",
  "Flawless Game Farm SEO Strategy.txt",
  "Game Farm Research for Project.docx",
  "Game Farm Research for Project.txt",
  "Game Farm Research for Project (docx).txt",
  "Game Farm Off-Season Business Ideas.docx",
  "Game Farm Off-Season Business Ideas.txt",
  "Game Farm Off-Season Business Ideas (docx).txt",
  "Facebook Ads for Game Lodge.docx",
  "Facebook Ads for Game Lodge.txt",
  "Facebook Ads for Game Lodge (docx).txt",
  "SEO Strategy for Hunting Website.docx",
  "SEO Strategy for Hunting Website.txt",
  "SEO Strategy for Hunting Website (docx).txt",
  "Luxury Hunting Lodge Website Strategy.docx",
  "Luxury Hunting Lodge Website Strategy(1).docx",
  "Luxury Hunting Lodge Website Strategy.txt",
  "Luxury Hunting Lodge Website Strategy (docx).txt",
  "Luxury Hunting Lodge Website Strategy(1).txt",
  "Luxury Hunting Lodge Website Strategy(1) (docx).txt",
  "Deep Kudu Research for Game Reserve.docx",
  "Deep Kudu Research for Game Reserve.txt",
  "Deep Kudu Research for Game Reserve (docx).txt",
  "Red Hartebeest Research for Game Reserve.docx",
  "Red Hartebeest Research for Game Reserve.txt",
  "Red Hartebeest Research for Game Reserve (docx).txt",
  "South Africa Lodge Competition Analysis.docx",
  "South Africa Lodge Competition Analysis.txt",
  "South Africa Lodge Competition Analysis (docx).txt",
  "Warthog Hunting and Biology Details.docx",
  "Warthog Hunting and Biology Details.txt",
  "Warthog Hunting and Biology Details (docx).txt",
  "Next.js Hunting SEO Strategy.docx",
  "Next.js Hunting SEO Strategy.txt",
  "Next.js Hunting SEO Strategy (docx).txt",
  "African Game Species Biological Survey.docx",
  "African Game Species Biological Survey.txt",
  "African Game Species Biological Survey (docx).txt",
  "African Honey Bee Introduction.docx",
  "African Honey Bee Introduction.txt",
  "African Honey Bee Introduction (docx).txt",
  "Bushbuck Hunting Information Compilation.docx",
  "Bushbuck Hunting Information Compilation.txt",
  "Bushbuck Hunting Information Compilation (docx).txt",
  "Game Farm Year-Round Occupancy Strategies.docx",
  "Game Farm Year-Round Occupancy Strategies.txt",
  "Game Farm Year-Round Occupancy Strategies (docx).txt",
  "Gemsbok Research for Game Reserve.docx",
  "Gemsbok Research for Game Reserve.txt",
  "Gemsbok Research for Game Reserve (docx).txt",
  "Greater Kudu Hunting Information Guide.docx",
  "Greater Kudu Hunting Information Guide.txt",
  "Greater Kudu Hunting Information Guide (docx).txt",
  "Impala Research for Game Reserve.docx",
  "Impala Research for Game Reserve.txt",
  "Impala Research for Game Reserve (docx).txt",
  "Springbok Research for Game Reserve.docx",
  "Springbok Research for Game Reserve.txt",
  "Springbok Research for Game Reserve (docx).txt",
  "Warthog Research for Game Reserve Website.docx",
  "Warthog Research for Game Reserve Website.txt",
  "Warthog Research for Game Reserve Website (docx).txt",
  "Leafcutter Ant Colony Research.docx",
  "Leafcutter Ant Colony Research.txt",
  "Leafcutter Ant Colony Research(1).docx",
  "Leafcutter Ant Colony Research(1).txt",
  "Leafcutter Ant Colony Research (docx).txt",
  "Leafcutter Ant Colony Research(1) (docx).txt",
  "Limpopo Game Farm AI Image Prompts.docx",
  "Limpopo Game Farm AI Image Prompts.txt",
  "Limpopo Game Farm AI Image Prompts (docx).txt",
  "Livingstone Eland Research for Website.docx",
  "Livingstone Eland Research for Website.txt",
  "Livingstone Eland Research for Website (docx).txt",
  "Luxury Hotel Website Design Research.docx",
  "Luxury Hotel Website Design Research.txt",
  "Luxury Hotel Website Design Research (docx).txt",
  "AI Image Enhancement for Game Lodge.docx",
  "AI Image Enhancement for Game Lodge.txt",
  "AI Image Enhancement for Game Lodge (docx).txt",
  "South African Game Hunting Cheat Sheet.docx",
  "South African Game Hunting Cheat Sheet.txt",
  "South African Game Hunting Cheat Sheet (docx).txt",
  "South African Game Hunting Cheat Sheet (1).docx",
  "South African Game Hunting Cheat Sheet (1).txt",
  "South African Game Hunting Cheat Sheet (1) (docx).txt",
  "South African Safari Website Color Palettes.docx",
  "South African Safari Website Color Palettes.txt",
  "South African Safari Website Color Palettes (docx).txt",
  "South African Safari Website Color Palettes(1).docx",
  "South African Safari Website Color Palettes(1).txt",
  "South African Safari Website Color Palettes(1) (docx).txt",
  "Thabazimbi Lodge Branding Research.docx",
  "Thabazimbi Lodge Branding Research.txt",
  "Thabazimbi Lodge Branding Research (docx).txt",
  "Thabazimbi Lodge Branding Research(1).docx",
  "Thabazimbi Lodge Branding Research(1).txt",
  "Thabazimbi Lodge Branding Research(1) (docx).txt",
  "Thabazimbi_ History, Geography, and Tourism.docx",
  "Thabazimbi_ History, Geography, and Tourism.txt",
  "Thabazimbi_ History, Geography, and Tourism (docx).txt",
  "Thabazimbi_ History, Geography, and Tourism(1).docx",
  "Thabazimbi_ History, Geography, and Tourism(1).txt",
  "Thabazimbi_ History, Geography, and Tourism(1) (docx).txt",
  "The Leafcutter.txt",
  "Hunting Safari Digital Strategy Research.docx",
  "Animal Shot Placement Illustrations.docx",
  "Blesbok Research for Game Reserve.docx",
  "Cape Buffalo Deep Dive Research.docx",
  "Golden Wildebeest Research for Game Reserve.docx"
)
$farmDest = Join-Path $k "clients/miwesu/farm"
foreach ($n in $farmNames) {
  Move-UniqueFile -SourcePath (Join-Path $src $n) -DestDir $farmDest
}

# --- Miwesu wood (brand / holdings / prompts) ---
$woodNames = @(
  "0001miwesu-overview.txt",
  "Blog Strategy for Miwesu SEO.docx",
  "Blog Strategy for Miwesu SEO.txt",
  "MIWESU HOLDINGS 16.02.26.docx",
  "MIWESU HOLDINGS 16.02.26.txt",
  "MIWESU Luxury Brand Web Architecture.docx",
  "MIWESU Luxury Brand Web Architecture.txt",
  "MIWESU Luxury Brand Web Architecture (docx).txt",
  "Okay let_s start here. A complete detailed overvie.._(1).docx",
  "Okay let_s start here. A complete detailed overvie.._(1).txt",
  "Okay let_s start here. A complete detailed overvie.._(1) (docx).txt",
  "Okay let_s start here. A complete detailed overvie.._.docx",
  "Okay let_s start here. A complete detailed overvie.._.txt",
  "Okay let_s start here. A complete detailed overvie.._. (docx).txt",
  "Okay now lets look at each product again the 12 f.._.docx",
  "Okay now lets look at each product again the 12 f.._.txt",
  "Okay now lets look at each product again the 12 f.._. (docx).txt",
  "Miwesu New 2 Lifestyle Product Image Prompts.docx",
  "Miwesu New 2 Lifestyle Product Image Prompts.txt",
  "Miwesu new 3 Firewood Ad Lifestyle Image Concepts.docx",
  "Miwesu new 3 Firewood Ad Lifestyle Image Concepts.txt",
  "Miwesu New Firewood Ad Prompts_ Simplicity & Exclusivity.docx",
  "Miwesu New Firewood Ad Prompts_ Simplicity & Exclusivity.txt",
  "Miwesu_Master_Knowledge.txt"
)
$woodDest = Join-Path $k "clients/miwesu/wood"
foreach ($n in $woodNames) {
  Move-UniqueFile -SourcePath (Join-Path $src $n) -DestDir $woodDest
}

# --- Web development ---
$webNames = @(
  "Building a Custom CRM and Portal.docx",
  "Building a Custom CRM and Portal.txt",
  "Building a Custom CRM and Portal (docx).txt",
  "DNS Zone Data Cleanup and Formatting.docx",
  "DNS Zone Data Cleanup and Formatting.txt",
  "Environment Variables Retyped and Formatted.docx",
  "Environment Variables Retyped and Formatted.txt",
  "Next.js Email Delivery Troubleshooting Guide.docx",
  "Next.js Email Delivery Troubleshooting Guide.txt",
  "Deep Research Setup Guide Request.docx",
  "Deep Research Setup Guide Request.txt",
  "Next.js E-commerce Firewood Project.docx",
  "Next.js E-commerce Firewood Project.txt",
  "Next.js E-commerce Firewood Project (docx).txt",
  "Next.js Firewood SEO Strategy Research.docx",
  "Next.js Firewood SEO Strategy Research.txt",
  "Next.js Firewood SEO Strategy Research (docx).txt",
  "Firewood Landing Page Design Research.docx",
  "Firewood Landing Page Design Research.txt",
  "Firewood Landing Page Design Research (docx).txt",
  "remediation-report-20251226_165704_3e8b624e.txt",
  "AI Agency Research for Gauteng.docx",
  "AI Agency Research for Gauteng.txt",
  "AI Agency Research for Gauteng (docx).txt",
  "AI Agency Growth Strategy for Gauteng.docx",
  "AI Agency Growth Strategy for Gauteng.txt",
  "AI Agency Growth Strategy for Gauteng (docx).txt",
  "AI Agents for Flawless Website SEO.docx",
  "AI Agents for Flawless Website SEO.txt",
  "AI Agents for Flawless Website SEO (docx).txt",
  "AI Agents for Flawless SEO Audits.docx",
  "AI Tools for Agency Growth.docx",
  "Building Hierarchical AI Agents.docx",
  "Building Rolls Royce Website with Cursor.docx",
  "Cursor Rules and AI Agents.docx",
  "Generative UI Chatbot Implementation Plan.docx",
  "Micro-SaaS Roadmap for South Africa.docx",
  "Next.js SEO & Schema Implementation Plan.docx",
  "2026.03.29 AI Web Design Refinement Strategy.docx",
  "2026.03.29 Elite Full-Stack Development Blueprint.docx",
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
  "Workshop App Development Plan (docx).txt",
  "Automating Social Media for Freelancers.docx",
  "Automating Social Media for Freelancers.txt",
  "Automating Social Media for Freelancers (docx).txt",
  "Building a Social Media Management System.docx",
  "Building a Social Media Management System.txt",
  "Building a Social Media Management System (docx).txt",
  "Building a Social Media Management System (1).docx",
  "Building a Social Media Management System (1).txt",
  "Building a Social Media Management System (1) (docx).txt",
  "Detailed Social Media Plan Creation.docx",
  "Detailed Social Media Plan Creation.txt",
  "Detailed Social Media Plan Creation (docx).txt",
  "Social Strategy and App Development.docx",
  "Social Strategy and App Development.txt",
  "Social Strategy and App Development (docx).txt",
  "Debugging Next.js Vercel Deployment Issues.docx",
  "Debugging Next.js Vercel Deployment Issues.txt",
  "Debugging Next.js Vercel Deployment Issues (docx).txt",
  "Google Ads Traffic Decline Investigation.docx",
  "Google Ads Traffic Decline Investigation.txt",
  "Google Ads Traffic Decline Investigation (docx).txt",
  "SEO DEC 2025 PHASE 13 Next.js Entity Stronghold Strategy.docx",
  "SEO DEC 2025 PHASE 13 Next.js Entity Stronghold Strategy.txt",
  "SEO DEC 2025 PHASE 13 Next.js Entity Stronghold Strategy (docx).txt",
  "SEO DEC 2025 PHASE 18 Edge A_B Testing with Vercel.docx",
  "SEO DEC 2025 PHASE 18 Edge A_B Testing with Vercel.txt",
  "SEO DEC 2025 PHASE 18 Edge A_B Testing with Vercel (docx).txt",
  "Project Scanner.docx",
  "Project Scanner.txt",
  "Project Scanner (docx).txt",
  "Advanced Programmatic SEO Engine Blueprint.docx",
  "Advanced Programmatic SEO Engine Blueprint.txt",
  "Advanced Programmatic SEO Engine Blueprint (docx).txt",
  "Building a Custom SEO Keyword Tool.docx",
  "Building a Custom SEO Keyword Tool.txt",
  "Building a Custom SEO Keyword Tool (docx).txt",
  "Building an Autonomous Programmatic SEO Engine.docx",
  "Building an Autonomous Programmatic SEO Engine.txt",
  "Building an Autonomous Programmatic SEO Engine (docx).txt",
  "DD SEO0002 Advanced SEO Strategy Deep Dive.docx",
  "DD SEO0002 Advanced SEO Strategy Deep Dive.txt",
  "DD SEO0002 Advanced SEO Strategy Deep Dive (docx).txt",
  "Forcing Cursor AI for Flawless UI.docx",
  "Forcing Cursor AI for Flawless UI.txt",
  "Forcing Cursor AI for Flawless UI (docx).txt",
  "Google Oracle_ SEO Truths Revealed.docx",
  "Google Oracle_ SEO Truths Revealed.txt",
  "Google Oracle_ SEO Truths Revealed (docx).txt",
  "Keyword Research and SEO Guide_.docx",
  "Keyword Research and SEO Guide_.txt",
  "Keyword Research and SEO Guide_ (docx).txt",
  "Next.js SEO Launchpad Strategy.docx",
  "Next.js SEO Launchpad Strategy.txt",
  "Next.js SEO Launchpad Strategy (docx).txt",
  "Next.js SEO Strategy Implementation Guide.docx",
  "Next.js SEO Strategy Implementation Guide.txt",
  "Next.js SEO Strategy Implementation Guide (docx).txt",
  "AI for South African Content Generation.docx",
  "AI for South African Content Generation.txt",
  "AI for South African Content Generation (docx).txt",
  "Luxury Website Design Deep Dive.docx",
  "Luxury Website Design Deep Dive.txt",
  "Luxury Website Design Deep Dive (docx).txt"
)
$webDest = Join-Path $k "web-development"
foreach ($n in $webNames) {
  Move-UniqueFile -SourcePath (Join-Path $src $n) -DestDir $webDest
}

# --- Facebook ads (strategy / tables) ---
$fbNames = @(
  "Facebook Ad Audience Setup Table.docx",
  "Facebook Ad Audience Setup Table.txt",
  "Facebook Ad Audience Setup Table (docx).txt",
  "Facebook Ad Strategy for Businesses.docx",
  "Facebook Ad Strategy for Businesses.txt",
  "Facebook Ad Strategy for Businesses (docx).txt",
  "Facebook Ad Strategy for Premium Firewood.docx",
  "Facebook Ad Strategy for Premium Firewood.txt",
  "Facebook Ad Strategy_ Firewood Sales.docx",
  "Facebook Ad Strategy_ Firewood Sales.txt",
  "Facebook Ads Strategy for Pretoria.docx",
  "Facebook Ads Strategy for Pretoria.txt",
  "Facebook Ads Strategy for Pretoria (docx).txt",
  "Alberton Firewood Facebook Ad Strategy.docx",
  "Alberton Firewood Facebook Ad Strategy.txt",
  "Social Media & Ad Plan_ Firewood.docx",
  "Social Media & Ad Plan_ Firewood.txt",
  "Facebook Ad Plan for Braai Wood.docx",
  "Facebook Ad Plan for Braai Wood.txt",
  "Facebook Ad Plan for Braai Wood (docx).txt",
  "Facebook Braai Wood Ad Strategy.docx",
  "Facebook Braai Wood Ad Strategy.txt",
  "Facebook Braai Wood Ad Strategy (docx).txt",
  "Facebook Page Setup for Success.docx",
  "Facebook Page Setup for Success.txt",
  "Facebook Page Setup for Success (docx).txt",
  "Facebook Carousel Ads_ Ultimate Success Blueprint.docx",
  "Facebook Carousel Ads_ Ultimate Success Blueprint.txt",
  "Facebook Carousel Ads_ Ultimate Success Blueprint (docx).txt",
  "adset_images_findings.txt"
)
$fbDest = Join-Path $k "channels/facebook-ads"
foreach ($n in $fbNames) {
  Move-UniqueFile -SourcePath (Join-Path $src $n) -DestDir $fbDest
}

# --- SEO channel ---
$seoNames = @(
  "Aggressive SEO Strategy for Firewood Business.docx",
  "Aggressive SEO Strategy for Firewood Business.txt",
  "Aggressive SEO Strategy for Firewood Business (1).txt",
  "Aggressive SEO Strategy for Firewood Business(1).docx",
  "Aggressive SEO Strategy for Firewood Business(1).txt",
  "Aggressive SEO Strategy for Firewood Business (docx).txt",
  "Firewood SEO Strategy for Gauteng.docx",
  "Firewood SEO Strategy for Gauteng.txt",
  "Firewood SEO Strategy for Gauteng (docx).txt",
  "Firewood SEO Strategy_ Gauteng Dominance.docx",
  "Firewood SEO Strategy_ Gauteng Dominance.txt",
  "Firewood SEO Strategy_ Gauteng Dominance (1).txt",
  "Firewood SEO Strategy_ Gauteng Dominance (docx).txt",
  "AI SEO Strategy for Financial Services.docx",
  "AI SEO Strategy for Financial Services.txt",
  "AI SEO Strategy for Financial Services (docx).txt",
  "SEO Domination Research Plan.docx",
  "SEO Domination Research Plan.txt",
  "SEO Domination Research Plan (docx).txt"
)
$seoDest = Join-Path $k "channels/seo"
foreach ($n in $seoNames) {
  Move-UniqueFile -SourcePath (Join-Path $src $n) -DestDir $seoDest
}

# --- Creative direction ---
$crNames = @(
  "Creative Ad Concepts_ Apple x Samsung.docx",
  "Creative Ad Concepts_ Apple x Samsung.txt",
  "Firewood Reimagined_ Tech Fusion Campaign.docx",
  "Firewood Reimagined_ Tech Fusion Campaign.txt",
  "Firewood Reimagined_ Tech Fusion Campaign (1).txt",
  "Firewood Reimagined_ Tech Fusion Campaign(1).docx",
  "Firewood Reimagined_ Tech Fusion Campaign(1).txt",
  "Firewood Reimagined_ Tech Fusion Campaign (docx).txt",
  "AI Image Generation Product Fidelity.docx",
  "AI Image Generation Product Fidelity.txt",
  "AI Image Generation Product Fidelity (docx).txt",
  "Visual Asset Research Prioritization.docx",
  "Visual Asset Research Prioritization.txt",
  "Visual Asset Research Prioritization (docx).txt",
  "South African Underworld Investigation.docx",
  "South African Underworld Investigation.txt",
  "South African Underworld Investigation (docx).txt",
  "South African Underworld Connections Explored.docx",
  "Visual Alchemy Advertising Research Plan.docx",
  "Visual Alchemy Advertising Research Plan.txt",
  "Visual Alchemy Advertising Research Plan (docx).txt",
  "AI Ad Creation_ Fusing Styles.docx",
  "AI Ad Creation_ Fusing Styles.txt",
  "AI Ad Creation_ Fusing Styles (docx).txt",
  "Deep Research for Flawless Facebook Ads.docx",
  "Deep Research for Flawless Facebook Ads.txt",
  "Deep Research for Flawless Facebook Ads (docx).txt",
  "Designing a Flawless Brand Showcase.docx",
  "Designing a Flawless Brand Showcase.txt",
  "Designing a Flawless Brand Showcase (docx).txt",
  "Enhance Mediocre Images with Custom Filters.docx",
  "Enhance Mediocre Images with Custom Filters.txt",
  "Enhance Mediocre Images with Custom Filters (docx).txt",
  "Enhance Mediocre Images with Custom Filters (1).txt",
  "AI Prompting Techniques for Visuals.docx",
  "AI Prompting Techniques for Visuals.txt",
  "AI Prompting Techniques for Visuals (docx).txt",
  "Building the Ultimate Sakana Brand.docx",
  "Building the Ultimate Sakana Brand.txt",
  "Building the Ultimate Sakana Brand (docx).txt",
  "Apex Collective 4.0.docx",
  "Apex Collective 4.0.txt",
  "Apex Collective 4.0 (docx).txt",
  "Apple Ad Style Analysis and Replication (2).txt",
  "Apple Ad Style Analysis and Replication (2).docx",
  "Apple_s Marketing_ Research Framework_.docx"
)
$crDest = Join-Path $k "creative-direction"
foreach ($n in $crNames) {
  Move-UniqueFile -SourcePath (Join-Path $src $n) -DestDir $crDest
}

# --- Industry / generic firewood ---
$indNames = @(
  "Afrikaans Firewood Advertising Strategy.docx",
  "Afrikaans Firewood Advertising Strategy.txt",
  "Afrikaans Firewood Advertising Strategy(1).docx",
  "Afrikaans Firewood Advertising Strategy(1).txt",
  "Afrikaans Firewood Advertising Strategy (docx).txt",
  "Aggressive Firewood Sales Campaign.docx",
  "Aggressive Firewood Sales Campaign.txt",
  "Aggressive Firewood Sales Strategy.docx",
  "Aggressive Firewood Sales Strategy.txt",
  "Building Premium Afrikaans Firewood Brand.docx",
  "Building Premium Afrikaans Firewood Brand.txt",
  "Firewood Lifestyle Ad Concepts.docx",
  "Firewood Lifestyle Ad Concepts.txt",
  "Premium Firewood Brand AI Prompts.docx",
  "Premium Firewood Brand AI Prompts.txt",
  "Researching Firewood Visuals for Website.txt",
  "Researching Firewood Visuals for Website (1).txt",
  "Researching Firewood Visuals for Website (2).txt",
  "Selling Braai Wood Psychology & Design.docx",
  "Selling Braai Wood Psychology & Design.txt",
  "Selling Braai Wood Psychology & Design(1).docx",
  "Selling Braai Wood Psychology & Design(1).txt",
  "South African Lifestyle Ad Concepts.docx",
  "South African Lifestyle Ad Concepts.txt",
  "The best so far Firewood Ad Prompts_ Square & Vertical.docx",
  "The best so far Firewood Ad Prompts_ Square & Vertical.txt",
  "WHAT THE WOOD LOOKS LIKE Researching Firewood Visuals for Website.docx",
  "WHAT THE WOOD LOOKS LIKE Researching Firewood Visuals for Website.txt",
  "WHAT THE WOOD LOOKS LIKE Researching Firewood Visuals for Website (docx).txt",
  "Braai Wood Ad Strategy Research Plan.docx",
  "Braai Wood Ad Strategy Research Plan.txt",
  "Braai Wood Ad Strategy Research Plan (docx).txt",
  "Researching Firewood Sales Strategy.docx",
  "Researching Firewood Sales Strategy.txt",
  "Researching Firewood Sales Strategy (docx).txt",
  "Wood Bag Sales Strategy Roadmap.docx",
  "Wood Bag Sales Strategy Roadmap.txt",
  "Wood Bag Sales Strategy Roadmap (docx).txt",
  "Consistent Firewood Bag Image Generation.docx",
  "Consistent Firewood Bag Image Generation.txt",
  "Consistent Firewood Bag Image Generation (docx).txt",
  "Braai Wood Facebook Ad Strategy.docx",
  "Braai Wood Facebook Ad Strategy.txt",
  "Braai Wood Facebook Ad Strategy (docx).txt",
  "Braai Wood Landing Page Research & Design.docx",
  "Braai Wood Landing Page Research & Design.txt",
  "Braai Wood Landing Page Research & Design (docx).txt",
  "Braai Wood Marketing Calendar & Prompts.docx",
  "Braai Wood Marketing Calendar & Prompts.txt",
  "Braai Wood Marketing Calendar & Prompts (docx).txt",
  "Braai Wood Marketing Campaign Strategy.docx",
  "Braai Wood Marketing Campaign Strategy.txt",
  "Braai Wood Marketing Campaign Strategy (docx).txt",
  "Braai Wood Research for E-commerce.docx",
  "Braai Wood Research for E-commerce.txt",
  "Braai Wood Research for E-commerce (docx).txt",
  "Wood Bag Prompt Engineering.docx",
  "Wood Bag Prompt Engineering.txt",
  "Wood Bag Prompt Engineering (docx).txt",
  "Wood Bag Prompt Engineering (1).txt",
  "Wood Bag Sales and Marketing Plan.docx",
  "Wood Bag Sales and Marketing Plan.txt",
  "Wood Bag Sales and Marketing Plan (docx).txt",
  "Wood Sales Plan For Gauteng.docx",
  "Wood Sales Plan For Gauteng.txt",
  "Wood Sales Plan For Gauteng (docx).txt",
  "Wood Seller Policy Research Outline.docx",
  "Wood Seller Policy Research Outline.txt",
  "Wood Seller Policy Research Outline (docx).txt",
  "Woolworths Marketing Strategy For Firewood.docx",
  "Woolworths Marketing Strategy For Firewood.txt",
  "Woolworths Marketing Strategy For Firewood (docx).txt",
  "Woolworths Marketing Strategy For Firewood(1).docx",
  "Woolworths Marketing Strategy For Firewood(1).txt",
  "Woolworths Marketing Strategy For Firewood(1) (docx).txt",
  "AI Image Prompts for Firewood Ads.docx",
  "AI Image Prompts for Firewood Ads.txt",
  "AI Image Prompts for Firewood Ads (docx).txt"
)
$indDest = Join-Path $k "industry/firewood-braai"
foreach ($n in $indNames) {
  Move-UniqueFile -SourcePath (Join-Path $src $n) -DestDir $indDest
}

# --- Vaalpenskraal wood (brand-specific) ---
$vaalWoodNames = @(
  "Ad Creative Deep Dive_ Vaalpenskraal Braai Mix.docx",
  "Ad Creative Deep Dive_ Vaalpenskraal Braai Mix.txt",
  "Ad Creative Deep Dive_ Vaalpenskraal Braai Mix (docx).txt",
  "VPK BRAAI MIX INV0016 11.01.26.docx",
  "VPK BRAAI MIX INV0016 11.01.26.txt",
  "VPK BRAAI MIX INV0016 11.01.26 (docx).txt"
)
$vaalWoodDest = Join-Path $k "clients/vaalpenskraal/wood"
foreach ($n in $vaalWoodNames) {
  Move-UniqueFile -SourcePath (Join-Path $src $n) -DestDir $vaalWoodDest
}

# --- Absolute Offroad (automotive / EFS / web) ---
$absOffroadNames = @(
  "Absolute Offroad Marketing Strategy Development.docx",
  "Absolute Offroad Marketing Strategy Development.txt",
  "Absolute Offroad Marketing Strategy Development (docx).txt",
  "Website Revamp Research_ Absolute Offroad.docx",
  "Website Revamp Research_ Absolute Offroad.txt",
  "Website Revamp Research_ Absolute Offroad (docx).txt",
  "EFS Suspension Marketing Roadmap Development.docx",
  "EFS Suspension Marketing Roadmap Development.txt",
  "EFS Suspension Marketing Roadmap Development (docx).txt",
  "EFS Suspension Marketing Roadmap Development(1).docx",
  "EFS Suspension Marketing Roadmap Development (1).txt",
  "EFS Suspension Marketing Roadmap Development (1) (docx).txt",
  "991782 EFS Suspension Shock Absorber Research.docx",
  "991782 EFS Suspension Shock Absorber Research.txt",
  "991782 EFS Suspension Shock Absorber Research (docx).txt",
  "EFS Suspension Shock Absorber Research.docx",
  "EFS Suspension Shock Absorber Research.txt",
  "EFS Suspension Shock Absorber Research (docx).txt",
  "EFS Toyota Suspension Research South Africa.docx",
  "EFS Toyota Suspension Research South Africa.txt",
  "EFS Toyota Suspension Research South Africa (docx).txt",
  "EFS Marketing Research Strategy Outline.docx",
  "EFS Marketing Research Strategy Outline.txt",
  "EFS Marketing Research Strategy Outline (docx).txt",
  "4x4 Social Media Plan Development.docx",
  "4x4 Social Media Plan Development.txt",
  "4x4 Social Media Plan Development (docx).txt",
  "Social Media Calendar For Offroad Business.docx",
  "Social Media Calendar For Offroad Business.txt",
  "Social Media Calendar For Offroad Business (docx).txt",
  "Social Media Calendar For Offroad Store.docx",
  "Social Media Calendar For Offroad Store.txt",
  "Social Media Calendar For Offroad Store (1).txt",
  "Social Media Calendar For Offroad Store (docx).txt"
)
$absOffroadDest = Join-Path $k "clients/absolute-offroad"
foreach ($n in $absOffroadNames) {
  Move-UniqueFile -SourcePath (Join-Path $src $n) -DestDir $absOffroadDest
}

# --- Absolute Offroad: 4x4 aftermarket / EFS / competitor product research ---
$absOffroadProductResearchNames = @(
  "adsetaor.txt",
  "4x4 Audience Research Plan.docx",
  "4x4 Audience Research Plan.txt",
  "4x4 Audience Research Plan (docx).txt",
  "4x4 Enthusiast Content Strategy Development.docx",
  "4x4 Enthusiast Content Strategy Development.txt",
  "4x4 Enthusiast Content Strategy Development (docx).txt",
  "4x4 Parts Brand Research for Website.docx",
  "4x4 Parts Brand Research for Website.txt",
  "4x4 Parts Brand Research for Website (docx).txt",
  "4x4 Parts Brand Research.docx",
  "4x4 Parts Brand Research.txt",
  "4x4 Parts Brand Research (docx).txt",
  "4x4 parts brands.docx",
  "4x4 parts brands.txt",
  "4x4 parts brands (docx).txt",
  "4x4 Product Research for Website.docx",
  "4x4 Product Research for Website.txt",
  "4x4 Product Research for Website (docx).txt",
  "AI Ad Generation for EFS Shock Absorber.docx",
  "AI Ad Generation for EFS Shock Absorber.txt",
  "AI Ad Generation for EFS Shock Absorber (docx).txt",
  "AOR_EFS_SALE_DEC_2025.docx",
  "AOR_EFS_SALE_DEC_2025.txt",
  "AOR_EFS_SALE_DEC_2025 (docx).txt",
  "Cinematic 4x4 Build Video Guide.docx",
  "Cinematic 4x4 Build Video Guide.txt",
  "Cinematic 4x4 Build Video Guide (docx).txt",
  "De Graaf Product Research for Store.docx",
  "De Graaf Product Research for Store.txt",
  "De Graaf Product Research for Store (docx).txt",
  "EFS Product Research South Africa.docx",
  "EFS Product Research South Africa.txt",
  "EFS Product Research South Africa (docx).txt",
  "EFS Suspension for South Africa.docx",
  "EFS Suspension for South Africa.txt",
  "EFS Suspension for South Africa (docx).txt",
  "EFS Suspension South Africa Product Research.docx",
  "EFS Suspension South Africa Product Research.txt",
  "EFS Suspension South Africa Product Research (docx).txt",
  "EFS Suspension South Africa Product Verification.docx",
  "EFS Suspension South Africa Product Verification.txt",
  "EFS Suspension South Africa Product Verification (docx).txt",
  "Opposite Lock Product Catalog Research.docx",
  "Opposite Lock Product Catalog Research.txt",
  "Opposite Lock Product Catalog Research (docx).txt",
  "Motorcycle Auction Buyer_s Guide.docx",
  "Motorcycle Auction Buyer_s Guide.txt",
  "Motorcycle Auction Buyer_s Guide (docx).txt",
  "AOR-EFS-SPECIAL-PAID-CAROUSEL.docx",
  "AOR-EFS-SPECIAL-PAID-CAROUSEL.txt",
  "AOR-EFS-SPECIAL-PAID-CAROUSEL (docx).txt",
  "EFS Land Cruiser Suspension Research.docx",
  "EFS Land Cruiser Suspension Research.txt",
  "EFS Land Cruiser Suspension Research (docx).txt",
  "Gauteng 4x4 Aftermarket Research.docx",
  "Gauteng 4x4 Aftermarket Research.txt",
  "Gauteng 4x4 Aftermarket Research (docx).txt",
  "South African 4x4 Market Research.docx",
  "South African 4x4 Market Research.txt",
  "South African 4x4 Market Research (docx).txt",
  "Landcruiser SEO Keyword Research.docx",
  "Landcruiser SEO Keyword Research.txt",
  "Landcruiser SEO Keyword Research (docx).txt",
  "MCC 4x4 South Africa Product Research.docx",
  "MCC 4x4 South Africa Product Research.txt",
  "MCC 4x4 South Africa Product Research (docx).txt",
  "Okay Currently EFT suspension is on special I cre.._.docx",
  "Okay Currently EFT suspension is on special I cre.._.txt",
  "Okay Currently EFT suspension is on special I cre.._. (docx).txt",
  "Onca 4x4 Product Research & Categorization.docx",
  "Onca 4x4 Product Research & Categorization.txt",
  "Onca 4x4 Product Research & Categorization (docx).txt",
  "Onca 4x4 Product Research and Pricing.docx",
  "Onca 4x4 Product Research and Pricing.txt",
  "Onca 4x4 Product Research and Pricing (docx).txt",
  "Onca 4x4 Product Research For Store.docx",
  "Onca 4x4 Product Research For Store.txt",
  "Onca 4x4 Product Research For Store (docx).txt",
  "Onca 4x4 South Africa Product Research.docx",
  "Onca 4x4 South Africa Product Research.txt",
  "Onca 4x4 South Africa Product Research (docx).txt",
  "Onca Land Cruiser Product Research.docx",
  "Onca Land Cruiser Product Research.txt",
  "Onca Land Cruiser Product Research (docx).txt",
  "Takla 4x4 Land Cruiser Product Research.docx",
  "Takla 4x4 Land Cruiser Product Research.txt",
  "Takla 4x4 Land Cruiser Product Research (docx).txt",
  "Takla 4x4 Product Catalog Strategy.docx",
  "Takla 4x4 Product Catalog Strategy.txt",
  "Takla 4x4 Product Catalog Strategy (docx).txt",
  "Takla Product Research and Analysis.docx",
  "Takla Product Research and Analysis.txt",
  "Takla Product Research and Analysis (docx).txt",
  "Tough Dog Land Cruiser SA.docx",
  "Tough Dog Land Cruiser SA.txt",
  "Tough Dog Land Cruiser SA (docx).txt",
  "Tough Dog Suspension South Africa Research.docx",
  "Tough Dog Suspension South Africa Research.txt",
  "Tough Dog Suspension South Africa Research (docx).txt",
  "Tough Dog Suspension South Africa Strategy.docx",
  "Tough Dog Suspension South Africa Strategy.txt",
  "Tough Dog Suspension South Africa Strategy (docx).txt",
  "Wild Dog Product Research & Categorization.docx",
  "Wild Dog Product Research & Categorization.txt",
  "Wild Dog Product Research & Categorization (docx).txt"
)
foreach ($n in $absOffroadProductResearchNames) {
  Move-UniqueFile -SourcePath (Join-Path $src $n) -DestDir $absOffroadDest
}

# --- Audiences (psychographics / geo targeting) ---
$audienceNames = @(
  "Targeting White South Africans in Gauteng.docx",
  "Targeting White South Africans in Gauteng.txt",
  "Targeting White South Africans in Gauteng (docx).txt",
  "White South African Bushveld Leisure Research.docx",
  "White South African Bushveld Leisure Research.txt",
  "White South African Bushveld Leisure Research (docx).txt"
)
$audienceDest = Join-Path $k "audiences"
foreach ($n in $audienceNames) {
  Move-UniqueFile -SourcePath (Join-Path $src $n) -DestDir $audienceDest
}

# --- Alberton Tyre Clinic (tyre / stock / social research) ---
$tyreNames = @(
  "South African Tire Stock Research.docx",
  "South African Tire Stock Research.txt",
  "South African Tire Stock Research (docx).txt",
  "Tire Brand Deep Dive for Social Media.docx",
  "Tire Brand Deep Dive for Social Media.txt",
  "Tire Brand Deep Dive for Social Media (docx).txt",
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
  "Social Media Plan For Tyre Clinic (docx).txt",
  "Facebook Captions for Dunlop Tyres.docx",
  "Facebook Captions for Dunlop Tyres.txt",
  "Facebook Captions for Dunlop Tyres (docx).txt",
  "South Africa Tire Store Research.docx",
  "South Africa Tire Store Research.txt",
  "South Africa Tire Store Research (docx).txt",
  "Ad Content Table.docx",
  "Ad Content Table.txt",
  "Ad Content Table (docx).txt",
  "Alberton Tyre Clinic SEO Strategy.docx",
  "Alberton Tyre Clinic SEO Strategy.txt",
  "Alberton Tyre Clinic SEO Strategy (docx).txt",
  "Bridgestone Facebook Captions Provided.docx",
  "Bridgestone Facebook Captions Provided.txt",
  "Bridgestone Facebook Captions Provided (docx).txt",
  "Competitor Website Analysis for Tyre Mart.docx",
  "Competitor Website Analysis for Tyre Mart.txt",
  "Competitor Website Analysis for Tyre Mart (docx).txt",
  "Facebook Captions for Continental Tyres.docx",
  "Facebook Captions for Continental Tyres.txt",
  "Facebook Captions for Continental Tyres (docx).txt",
  "Invoice ATC 31.01.26 - SOCIAL MEDIA.docx",
  "Invoice ATC 31.01.26 - SOCIAL MEDIA.txt",
  "Invoice ATC 31.01.26 - SOCIAL MEDIA (docx).txt",
  "Invoice for Alberton Tyre Clinic 10.03.26.docx",
  "Invoice for Alberton Tyre Clinic 10.03.26.txt",
  "Invoice for Alberton Tyre Clinic 10.03.26 (docx).txt",
  "SEO Keyword Research For Tyre Services.docx",
  "SEO Keyword Research For Tyre Services.txt",
  "SEO Keyword Research For Tyre Services (docx).txt",
  "Tyre Sorting_ A No-Nonsense Plan.docx",
  "Tyre Sorting_ A No-Nonsense Plan.txt",
  "Tyre Sorting_ A No-Nonsense Plan (docx).txt",
  "Website Research For Alberton Tyre Clinic.docx",
  "Website Research For Alberton Tyre Clinic.txt",
  "Website Research For Alberton Tyre Clinic (docx).txt",
  "Weekly Vehicle Checklist.docx",
  "Weekly Vehicle Checklist.txt",
  "Weekly Vehicle Checklist (docx).txt",
  "What Alberton Tyre Clinic looks like.docx",
  "What Alberton Tyre Clinic looks like.txt",
  "What Alberton Tyre Clinic looks like (docx).txt",
  "Competitor Research for Alberton Website.docx"
)
$tyreDest = Join-Path $k "clients/alberton-tyre-clinic"
foreach ($n in $tyreNames) {
  Move-UniqueFile -SourcePath (Join-Path $src $n) -DestDir $tyreDest
}

# --- Rhino Panelbeaters (separate client; not Alberton Tyre Clinic) ---
$rhinoPanelbeatersNames = @(
  "Panelbeater Keyword Research Strategy.docx",
  "Panelbeater Keyword Research Strategy.txt",
  "Panelbeater Keyword Research Strategy (docx).txt"
)
$rhinoPanelbeatersDest = Join-Path $k "clients/rhino-panelbeaters"
foreach ($n in $rhinoPanelbeatersNames) {
  Move-UniqueFile -SourcePath (Join-Path $src $n) -DestDir $rhinoPanelbeatersDest
}

# --- Maverick Painting Contractors ---
$maverickNames = @(
  "Maverick Painting Facebook Ads Strategy.docx",
  "Maverick Painting Facebook Ads Strategy.txt",
  "Maverick Painting Facebook Ads Strategy (docx).txt",
  "Facebook Ads Strategy For Painting Company.docx",
  "SEO Research for Paint Store Brands.docx",
  "SEO Research for Paint Store Brands.txt",
  "SEO Research for Paint Store Brands (docx).txt",
  "SEO Research for Paint Store Brands(1).docx",
  "SEO Research for Paint Store Brands(1).txt",
  "SEO Research for Paint Store Brands(1) (docx).txt"
)
$maverickDest = Join-Path $k "clients/maverick-painting-contractors"
foreach ($n in $maverickNames) {
  Move-UniqueFile -SourcePath (Join-Path $src $n) -DestDir $maverickDest
}

# --- Xsphere (web redesign research) ---
$xsphereNames = @(
  "Xsphere Website Redesign Research.docx",
  "Xsphere Website Redesign Research.txt",
  "Xsphere Website Redesign Research (docx).txt"
)
$xsphereDest = Join-Path $k "clients/xsphere"
foreach ($n in $xsphereNames) {
  Move-UniqueFile -SourcePath (Join-Path $src $n) -DestDir $xsphereDest
}

# --- AS Brokers (web redesign briefs) ---
$asBrokersNames = @(
  "Website Redesign Research for AS Brokers.docx",
  "Website Redesign Research for AS Brokers.txt",
  "Website Redesign Research for AS Brokers (docx).txt",
  "Website Redesign Research for AS Brokers(1).docx",
  "Website Redesign Research for AS Brokers (1).txt",
  "Website Redesign Research for AS Brokers(1).txt",
  "Website Redesign Research for AS Brokers (1) (docx).txt",
  "Building a Custom Brokerage Chatbot.docx",
  "Facebook Ad Strategy for AS Brokers.docx"
)
$asBrokersDest = Join-Path $k "clients/as-brokers"
foreach ($n in $asBrokersNames) {
  Move-UniqueFile -SourcePath (Join-Path $src $n) -DestDir $asBrokersDest
}

# --- Legal / litigation (keep separate from active client work) ---
$legalNames = @(
  "Legal Defense Report_ Smit vs. Global Batteries.docx",
  "Legal Defense Report_ Smit vs. Global Batteries.txt",
  "Legal Defense Report_ Smit vs. Global Batteries(1).txt",
  "Legal Defense Report_ Smit vs. Global Batteries (docx).txt"
)
$legalDest = Join-Path $k "archive/legal-litigation"
foreach ($n in $legalNames) {
  Move-UniqueFile -SourcePath (Join-Path $src $n) -DestDir $legalDest
}

# --- Labour law & arbitration (archive; not client delivery) ---
$labourLawArchiveNames = @(
  "Advanced Labour Arbitration Case Strategy.txt",
  "Advanced Labour Arbitration Case Strategy(1).txt",
  "AI Legal Strategy_ Labour Law Fraud.txt",
  "AI Legal Strategy_ Labour Law Fraud (1).txt",
  "Deep Dive_ SA Labour Law & Strategy.txt",
  "Deep Dive_ SA Labour Law & Strategy(1).txt",
  "Deep Dive_ Spotlight Effect Relief.txt",
  "Deep Dive_ Spotlight Effect Relief (1).txt",
  "Forensic Labour Arbitration Strategy Prompt.txt",
  "Labour Arbitration Case Building Research.docx",
  "Labour Arbitration Case Building Research.txt",
  "Labour Arbitration Case Building Research(1).txt",
  "Labour Arbitration Case Building Research (docx).txt",
  "Labour Dispute Evidence and Legal Options.txt",
  "Labour Dispute Evidence and Legal Options(1).txt",
  "Labour Dispute_ Company Vehicle Removal.docx",
  "Labour Dispute_ Company Vehicle Removal.txt",
  "Labour Dispute_ Company Vehicle Removal(1).txt",
  "Labour Dispute_ Company Vehicle Removal (docx).txt",
  "Labour Law Case Analysis_ Six Charges.docx",
  "Labour Law Case Analysis_ Six Charges.txt",
  "Labour Law Case Analysis_ Six Charges(1).docx",
  "Labour Law Case Analysis_ Six Charges(1).txt",
  "Labour Law Case Analysis_ Six Charges (docx).txt",
  "Labour Law Defense Strategy Development.docx",
  "Labour Law Defense Strategy Development.txt",
  "Labour Law Defense Strategy Development (1).txt",
  "Labour Law Defense Strategy Development (docx).txt",
  "Labour Law Dismissal Case Stress-Test.txt",
  "Labour Law Dispute Analysis & Strategy.txt",
  "Labour Law Exploitation Indictment Verified.txt",
  "Labour Law Fraud and Deductions Case.docx",
  "Labour Law Fraud and Deductions Case.txt",
  "Labour Law Fraud and Deductions Case (docx).txt",
  "Labour Law Misconduct Case Research.docx",
  "Labour Law Misconduct Case Research.txt",
  "Labour Law Overtime Dispute Analysis.txt",
  "Labour Law Overtime Dispute Analysis (1).txt",
  "Labour Law Overtime Dispute Analysis (2).txt",
  "Labour Law Research_ Unfair Dismissal & Spoliation.txt",
  "Labour Law Research_ Unfair Dismissal & Spoliation(1).txt",
  "Labour Law Strategy_ Fraud & Dismissal.txt",
  "Labour Law, Data Privacy, Disciplinary Defence.docx",
  "Labour Law, Data Privacy, Disciplinary Defence.txt",
  "Labour Law, Data Privacy, Disciplinary Defence (docx).txt",
  "Labour Law, Fraud, and Arbitration Strategy.docx",
  "Labour Law, Fraud, and Arbitration Strategy.txt",
  "Labour Law, Fraud, and Arbitration Strategy (docx).txt",
  "Navigating Labour Dispute Corruption Concerns.txt",
  "Navigating Labour Dispute Corruption Concerns(1).txt",
  "South African Labour Law Research.docx",
  "South African Labour Law Research.txt",
  "South African Labour Law_ Gross Dishonesty.docx",
  "South African Labour Law_ Gross Dishonesty.txt",
  "Social Dynamics of Perceived Disrespect.docx",
  "Social Dynamics of Perceived Disrespect.txt",
  "Social Dynamics of Perceived Disrespect (docx).txt",
  "AI Hallucinations in Disciplinary Finding.txt",
  "AI Hallucinations in Disciplinary Finding(1).txt",
  "Disciplinary Finding Defense Analysis.txt",
  "Employee Misconduct Charges and Legal Defense.txt",
  "Sent to Mibco With Reffaral 7.11 This is anexture A.txt",
  "Arbitration Case Strategy_ Drikus Botha.txt",
  "Arbitration Case Strategy_ Drikus Botha.docx",
  "Drikus Botha Annihilation Strategy Analysis.txt",
  "Curve balls CCMA_MIBCO Con-Arb Curveballs Research.txt",
  "Curve balls CCMA_MIBCO Con-Arb Curveballs Research(1).txt",
  "Unfair Dismissal Con-Arb Battle Plan.txt",
  "Unfair Dismissal Con-Arb Battle Plan(1).txt",
  "Defending Against Fraud Allegations.txt",
  "Legal Defense and Counter-Offensive Strategy.txt",
  "Grand_Unified_Strategy_Full_Explanation.txt",
  "Labour Law Research_ Unfair Dismissal & Spoliation.docx",
  "Labour Law Research_ Unfair Dismissal & Spoliation (docx).txt",
  "Memory Fraud_ Analysis and Defense.docx",
  "Memory Fraud_ Analysis and Defense.txt",
  "Memory Fraud_ Analysis and Defense (docx).txt",
  "LRA-7.11-Referring-a-dispute-to-the-DRC.docx",
  "POPIA Complaint_ Unlawful Data Sharing Investigation.txt",
  "Legal Strategy for Personal Liability.txt",
  "DISCIPLINARY ENQUIRY- FINDING AND SANCTION - FRANK SMIT.txt",
  "DISCIPLINARY ENQUIRY- FINDING AND SANCTION - FRANK SMIT(1).txt",
  "lindiwe 20 reviews Hello Peter.txt"
)
foreach ($n in $labourLawArchiveNames) {
  Move-UniqueFile -SourcePath (Join-Path $src $n) -DestDir $legalDest
}

# --- Past employer: Global Batteries / Novex-era systems & audit extracts ---
$globalBatArchiveNames = @(
  "0_Full_Database_Analysis_Structure.txt",
  "0_Full_Database_Analysis_Structure(1).txt",
  "1_Core_Business_Analysis_Structure.txt",
  "1_Core_Business_Analysis_Structure(1).txt",
  "APEX_DEEP_DIVE_RESULTS.txt",
  "APEX_DEEP_DIVE_RESULTS(1).txt",
  "Comprehensive_Business_Analysis_Excluded_Items_Structure.txt",
  "Comprehensive_Business_Analysis_Excluded_Items_Structure(1).txt",
  "Comprehensive_Business_Analysis_Structure.txt",
  "Comprehensive_Business_Analysis_Structure(1).txt",
  "Excel_Structure_Report.txt",
  "Excel_Structure_Report(1).txt",
  "Forensic_Audit_Structure_Report.txt",
  "Forensic_Audit_Structure_Report(1).txt",
  "Global Batteries FULL Overview.docx",
  "Global Batteries FULL Overview.txt",
  "Global Batteries FULL Overview (docx).txt",
  "Item_Movement_Report_Structure.txt",
  "Item_Movement_Report_Structure(1).txt",
  "Item_Movement_Report_Structure_Full.txt",
  "Item_Movement_Report_Structure_Full(1).txt",
  "Novax_Item_Categories_Structure.txt",
  "Novax - The Laundromat.yaml",
  "Overview_cards_combined.txt",
  "SKU_Supplier_Linkage_Report.txt",
  "SKU_Supplier_Linkage_Report(1).txt",
  "spreadsheet_structure_profitability.txt",
  "spreadsheet_structure_report_by_Type.txt",
  "spreadsheet_structure_sales.txt",
  "spreadsheet_structures.txt",
  "spreadsheet_structures(1).txt"
)
$globalBatArchiveDest = Join-Path $k "archive/past-employers/global-batteries"
foreach ($n in $globalBatArchiveNames) {
  Move-UniqueFile -SourcePath (Join-Path $src $n) -DestDir $globalBatArchiveDest
}

# --- Alberton Battery Mart (current client) ---
$batteryMartNames = @(
  "Alberton Battery Mart Company Research.docx",
  "Alberton Battery Mart Company Research.txt",
  "Alberton Battery Mart Company Research (docx).txt",
  "Alberton Battery Mart Social Media Plan.docx",
  "Alberton Battery Mart Social Media Plan.txt",
  "Alberton Battery Mart Social Media Plan (docx).txt",
  "Alberton Battery Mart Website Research.docx",
  "Alberton Battery Mart Website Research.txt",
  "Alberton Battery Mart Website Research (docx).txt",
  "Battery Leads Alberton Germiston Research.docx",
  "Battery Leads Alberton Germiston Research.txt",
  "Battery Leads Alberton Germiston Research (docx).txt",
  "Keyword Research for Alberton Battery Market.docx",
  "Keyword Research for Alberton Battery Market.txt",
  "Keyword Research for Alberton Battery Market (docx).txt",
  "Social Media Plan For Battery Mart.docx",
  "Social Media Plan For Battery Mart.txt",
  "Social Media Plan For Battery Mart (docx).txt",
  "Social Media Plan For Battery Mart (1).txt",
  "Social Media Plan For Battery Mart (1).docx",
  "Social Media Plan For Battery Mart(1).docx",
  "Social Media Plan For Battery Mart(1).txt",
  "Social Media Plan For Battery Mart (1) (docx).txt",
  "Social Media Plan For Battery Mart (2).docx",
  "Social Media Plan For Battery Mart (2).txt",
  "Social Media Plan For Battery Mart (2) (docx).txt",
  "Social Media Schedule For Battery Retailer.docx",
  "Social Media Schedule For Battery Retailer.txt",
  "Social Media Schedule For Battery Retailer (docx).txt",
  "SOCIAL MEDIA SCHEDULE.docx",
  "SOCIAL MEDIA SCHEDULE.txt",
  "SOCIAL MEDIA SCHEDULE (docx).txt"
)
$batteryMartDest = Join-Path $k "clients/alberton-battery-mart"
foreach ($n in $batteryMartNames) {
  Move-UniqueFile -SourcePath (Join-Path $src $n) -DestDir $batteryMartDest
}

# --- Battery vertical (generic marketing / product — not employer-specific) ---
$autoBatteryIndNames = @(
  "Automotive Battery Store Products and Services.docx",
  "Automotive Battery Store Products and Services.txt",
  "Automotive Battery Store Products and Services (docx).txt",
  "Battery Business Strategy and Pricing.docx",
  "Battery Business Strategy and Pricing.txt",
  "Battery Business Strategy and Pricing (docx).txt",
  "Battery Sales Rep Strategy Research.docx",
  "Battery Sales Rep Strategy Research.txt",
  "Battery Sales Rep Strategy Research (docx).txt",
  "Battery Specifications Research South Africa.docx",
  "Battery Specifications Research South Africa.txt",
  "Battery Specifications Research South Africa (docx).txt",
  "Battery Store Ad Campaign Master Tutorial.docx",
  "Battery Store Ad Campaign Master Tutorial.txt",
  "Battery Store Ad Campaign Master Tutorial (docx).txt",
  "Door-to-Door Battery Sales Strategy.docx",
  "Door-to-Door Battery Sales Strategy.txt",
  "Door-to-Door Battery Sales Strategy (docx).txt",
  "Dominating Golf Cart Battery Market.txt",
  "E-commerce Battery Store Research.txt",
  "Golf Cart Battery Conversion Research.txt",
  "Google Ads Campaign Strategy_ Automotive Batteries.docx",
  "Google Ads Campaign Strategy_ Automotive Batteries.txt",
  "Google Ads Campaign Strategy_ Automotive Batteries (docx).txt",
  "Google Ads Campaign Strategy_ Automotive Batteries(1).docx",
  "Google Ads Campaign Strategy_ Automotive Batteries(1).txt",
  "Google Ads Campaign Strategy_ Automotive Batteries (1) (docx).txt",
  "Keyword.txt",
  "Motorcycle Battery Research for Social Media.docx",
  "Motorcycle Battery Research for Social Media.txt",
  "Motorcycle Battery Research for Social Media (docx).txt",
  "Protec Batteries Wholesale Price List.txt",
  "South African Battery Market Research.docx",
  "South African Battery Market Research.txt",
  "South African Battery Market Research (docx).txt",
  "South African Scrap Battery Business.docx",
  "South African Scrap Battery Business.txt",
  "South African Scrap Battery Business (docx).txt",
  "Website Update for Golf Cart Batteries.docx",
  "Website Update for Golf Cart Batteries.txt",
  "Website Update for Golf Cart Batteries (docx).txt",
  "Willard Car Battery Research.txt",
  "Battery Market Research & Ads_.docx",
  "Battery Market Research & Ads_.txt",
  "Battery Market Research & Ads_ (docx).txt",
  "Battery Market Research & Ads_(1).docx",
  "Battery Market Research & Ads_(1).txt",
  "Battery Market Research & Ads_(1) (docx).txt",
  "Dominating Alberton Willard Battery Market.docx",
  "Dominating Alberton Willard Battery Market.txt",
  "Dominating Alberton Willard Battery Market (docx).txt"
)
$autoBatteryIndDest = Join-Path $k "industry/automotive-batteries"
foreach ($n in $autoBatteryIndNames) {
  Move-UniqueFile -SourcePath (Join-Path $src $n) -DestDir $autoBatteryIndDest
}

# --- Misc brand social research (not mapped to a portal slug yet) ---
$miscBrandSocialNames = @(
  "A-Line Mags Research for Social Media.docx",
  "A-Line Mags Research for Social Media.txt",
  "A-Line Mags Research for Social Media (docx).txt",
  "Lizzard Brand Research for Social Media.docx",
  "Lizzard Brand Research for Social Media.txt",
  "Lizzard Brand Research for Social Media (docx).txt"
)
$miscBrandSocialDest = Join-Path $k "industry/misc-brand-social"
foreach ($n in $miscBrandSocialNames) {
  Move-UniqueFile -SourcePath (Join-Path $src $n) -DestDir $miscBrandSocialDest
}

# --- Archive misc (one-off technical notes / generic untitled exports) ---
$miscLooseArchiveNames = @(
  "Setting Deltec Inverter Cutoff Voltage.docx",
  "Setting Deltec Inverter Cutoff Voltage.txt",
  "Setting Deltec Inverter Cutoff Voltage (docx).txt",
  "Dlete.docx",
  "Dlete.txt",
  "Dlete (docx).txt",
  "Untitled document.docx",
  "Untitled document.txt",
  "Untitled document (docx).txt",
  "Untitled document(1).docx",
  "Untitled document(1).txt",
  "Untitled document(1) (docx).txt",
  "Untitled document(2).docx",
  "Untitled document(2).txt",
  "Untitled document(2) (docx).txt",
  "011.txt",
  "014.txt",
  "01.txt",
  "01010.txt",
  "010101.txt",
  "0101011.txt",
  "0121.txt",
  "0157.txt",
  "0003h.txt",
  "0003j.txt",
  "777a.txt",
  "Moving Company Website Strategy Development.txt",
  "Unconventional AI Money-Making Strategies.txt",
  "Unconventional AI Money-Making Strategies.docx",
  "Unconventional AI Money-Making Strategies(1).docx",
  "Unconventional AI Money-Making Strategies(2).docx",
  "Everest Wealth Product Analysis.docx",
  "Website Revamp Research and Strategy.docx",
  "AUTHORS.txt",
  "AUTHORS(1).txt",
  "Introduction.txt",
  "iLoveMerge (1).txt",
  "South Africa Home Sandwich Business Legality.docx",
  "South Africa Home Sandwich Business Legality.txt",
  "South Africa Home Sandwich Business Legality (docx).txt",
  "South African Fly Fishing Brand Research.docx",
  "South African Fly Fishing Brand Research.txt",
  "South African Fly Fishing Brand Research (docx).txt",
  "The Samurai Way of Craftsmanship.docx",
  "The Samurai Way of Craftsmanship.txt",
  "The Samurai Way of Craftsmanship (docx).txt",
  "Universal Laws of Female Attraction.docx",
  "Universal Laws of Female Attraction.txt",
  "Universal Laws of Female Attraction (docx).txt",
  "Website Redesign Strategy and Competitor Analysis.docx",
  "Website Redesign Strategy and Competitor Analysis.txt",
  "Website Redesign Strategy and Competitor Analysis (docx).txt"
)
$miscLooseArchiveDest = Join-Path $k "archive/misc"
foreach ($n in $miscLooseArchiveNames) {
  Move-UniqueFile -SourcePath (Join-Path $src $n) -DestDir $miscLooseArchiveDest
}

# --- Personal / wellbeing & mental-health product research (not agency client work) ---
$wellbeingArchiveNames = @(
  "007.docx",
  "007.txt",
  "007 (docx).txt",
  "AI App for Mental Freedom Blueprint.docx",
  "AI App for Mental Freedom Blueprint.txt",
  "AI App for Mental Freedom Blueprint (docx).txt",
  "AI Therapist Blueprint_ Deep Research.docx",
  "AI Therapist Blueprint_ Deep Research.txt",
  "AI Therapist Blueprint_ Deep Research (docx).txt",
  "Anxiety, Mood Roots Deep Dive.docx",
  "Anxiety, Mood Roots Deep Dive.txt",
  "Anxiety, Mood Roots Deep Dive (docx).txt",
  "Building a Mental Health App.docx",
  "Building a Mental Health App.txt",
  "Building a Mental Health App (docx).txt",
  "Compete steps mental health app.docx",
  "Compete steps mental health app.txt",
  "Compete steps mental health app (docx).txt",
  "Daily OCD Overcoming Blueprint.docx",
  "Daily OCD Overcoming Blueprint.txt",
  "Daily OCD Overcoming Blueprint (docx).txt",
  "Delete.docx",
  "Delete.txt",
  "Delete (docx).txt",
  "E-commerce Psychology and Strategy Research.docx",
  "E-commerce Psychology and Strategy Research.txt",
  "E-commerce Psychology and Strategy Research (docx).txt",
  "Enigma.docx",
  "Enigma.txt",
  "Enigma (docx).txt",
  "Enigma 02.docx",
  "Enigma 02.txt",
  "Enigma 02 (docx).txt",
  "Ha 005.docx",
  "Ha 005.txt",
  "Ha 005 (docx).txt",
  "Ha Chapter 2.docx",
  "Ha Chapter 2.txt",
  "Ha Chapter 2 (docx).txt",
  "Ha chapter1.docx",
  "Ha chapter1.txt",
  "Ha chapter1 (docx).txt",
  "Health Anxiety_ Research and Treatment.docx",
  "Health Anxiety_ Research and Treatment.txt",
  "Health Anxiety_ Research and Treatment (docx).txt",
  "Holistic Guide to a Fulfilling Life.docx",
  "Holistic Guide to a Fulfilling Life.txt",
  "Holistic Guide to a Fulfilling Life (docx).txt",
  "Personal AI Companion Blueprint.docx",
  "Personal AI Companion Blueprint.txt",
  "Personal AI Companion Blueprint (docx).txt",
  "Mental Health App Research Guide.docx",
  "Mental Health App Research Guide.txt",
  "Mental Health App Research Guide (docx).txt",
  "Mental Health App Research Plan.docx",
  "Mental Health App Research Plan.txt",
  "Mental Health App Research Plan (docx).txt",
  "Mental health app_.docx",
  "Mental health app_.txt",
  "Mental health app_ (docx).txt",
  "Mental Health Screening Framework.docx",
  "Mental Health Screening Framework.txt",
  "Mental Health Screening Framework.pdf",
  "Mental Health Screening Framework (docx).txt",
  "Mental health setup.docx",
  "Mental health setup.txt",
  "Mental health setup (docx).txt",
  "Merge this with yours_### _The Ultimate No-Bulls.._.docx",
  "Merge this with yours_### _The Ultimate No-Bulls.._.txt",
  "Merge this with yours_### _The Ultimate No-Bulls.._. (docx).txt",
  "Nutrition for Mental, Physical Health.docx",
  "Nutrition for Mental, Physical Health.txt",
  "Nutrition for Mental, Physical Health (docx).txt",
  "Overcoming Thanatophobia and Existential Anxiety.docx",
  "Overcoming Thanatophobia and Existential Anxiety.txt",
  "Overcoming Thanatophobia and Existential Anxiety (docx).txt",
  "Overcoming Tragedy_ Mind, Resilience, Growth.docx",
  "Overcoming Tragedy_ Mind, Resilience, Growth.txt",
  "Overcoming Tragedy_ Mind, Resilience, Growth (docx).txt",
  "Questions_.docx",
  "Questions_.txt",
  "Questions_ (docx).txt",
  "Self-Reliance for Mental Freedom.docx",
  "Self-Reliance for Mental Freedom.txt",
  "Self-Reliance for Mental Freedom (docx).txt",
  "Therapy Research Based on Attachments.txt",
  "Therapy Research Based on Attachments.docx",
  "Therapy Research Based on Attachments (docx).txt",
  "Untitled document (1).txt",
  "Untitled document(1).docx",
  "Untitled document(1).txt",
  "Untitled document(1) (docx).txt",
  "Work on this_.docx",
  "Work on this_.txt",
  "Work on this_ (docx).txt",
  "_Context_ We are conducting academic research o.._.docx",
  "_Context_ We are conducting academic research o.._.txt",
  "_Context_ We are conducting academic research o.._. (docx).txt"
)
$wellbeingArchiveDest = Join-Path $k "archive/personal/wellbeing-research"
foreach ($n in $wellbeingArchiveNames) {
  Move-UniqueFile -SourcePath (Join-Path $src $n) -DestDir $wellbeingArchiveDest
}

# --- Anything left → inbox ---
Ensure-Dir (Join-Path $k "_inbox")
Get-ChildItem -LiteralPath $src -File -ErrorAction SilentlyContinue | ForEach-Object {
  Write-Host "Leftover → _inbox:" $_.Name
  Move-UniqueFile -SourcePath $_.FullName -DestDir (Join-Path $k "_inbox")
}

# --- Remove empty drive folder ---
if ((Get-ChildItem -LiteralPath $src -Force | Measure-Object).Count -eq 0) {
  Remove-Item -LiteralPath $src -Force
  Write-Host "Removed empty $DriveFolderName"
} else {
  Write-Host "Drive folder still has:" (Get-ChildItem -LiteralPath $src -Force | Select-Object -ExpandProperty Name)
}

Write-Host "Ingest done."
