# Move files from knowledge/new into the taxonomy (same collision rules as ingest-drive-download).
# Usage: powershell -ExecutionPolicy Bypass -File scripts/ingest-knowledge-new.ps1
$ErrorActionPreference = "Stop"
$root = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path
$k = Join-Path $root "knowledge"
$src = Join-Path $k "new"

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

function Ingest-List {
  param([string]$DestRel, [string[]]$Names)
  $dest = Join-Path $k $DestRel
  foreach ($n in $Names) {
    Move-UniqueFile -SourcePath (Join-Path $src $n) -DestDir $dest
  }
}

$dirs = @(
  "channels/facebook-ads",
  "channels/seo",
  "creative-direction",
  "clients/alberton-tyre-clinic",
  "clients/maverick-painting-contractors",
  "clients/xsphere",
  "industry/misc-brand-social",
  "web-development"
)
foreach ($d in $dirs) { Ensure-Dir (Join-Path $k $d) }

Ingest-List "channels/facebook-ads" @(
  "Facebook Ad Audience Setup Table.txt",
  "Facebook Carousel Ads_ Ultimate Success Blueprint.txt",
  "Mastering 2026 Ad Strategies (1).txt",
  "Mastering 2026 Ad Strategies.txt",
  "Facebook Ads and Meta Business Suite (1).txt",
  "Facebook Ads and Meta Business Suite.txt",
  "Meta Ad Creative Optimization & ROI (1).txt",
  "Meta Ad Creative Optimization & ROI.txt",
  "Facebook Ad Strategy for Businesses.txt",
  "Facebook Ads Strategy for Pretoria.txt",
  "Detailed Social Media Plan Creation.txt",
  "Facebookads01.txt",
  "adsetaor.txt",
  "Campaigns Complete Menu Navigation.txt"
)

Ingest-List "creative-direction" @(
  "Samsung Marketing Analysis Framework_ (1).txt",
  "Samsung Marketing Analysis Framework_.txt",
  "Samsung Brand Research Index (1).txt",
  "Samsung Brand Research Index.txt",
  "Apple Ad Style Analysis and Replication (2).txt",
  "Apple Ad Style Analysis and Replication (1).txt",
  "Apple Ad Style Analysis and Replication.txt",
  "Apple's Marketing_ Research Framework_.txt",
  "AI Ad Creation_ Fusing Styles.txt",
  "Enhance Mediocre Images with Custom Filters (1).txt",
  "Enhance Mediocre Images with Custom Filters.txt"
)

Ingest-List "clients/alberton-tyre-clinic" @(
  "Social Media Plan for Tire Store.txt"
)

Ingest-List "clients/maverick-painting-contractors" @(
  "Competitor Painting Service Analysis.txt"
)

Ingest-List "clients/xsphere" @(
  "Website Redesign Research Brief.txt"
)

Ingest-List "industry/misc-brand-social" @(
  "Used Car Dealership Research Plan.txt"
)

Ingest-List "channels/seo" @(
  "SEO_PAGE_REPORT_contact.txt",
  "SEO_GLOBAL_REPORT_1766822795257.txt",
  "SEO_V3_REPORT (6).txt",
  "SEO_V3_REPORT (5).txt",
  "SEO_V3_REPORT (4).txt",
  "SEO_V3_REPORT (3).txt",
  "SEO_V3_REPORT (2).txt",
  "SEO_V3_REPORT (1).txt",
  "SEO_V3_REPORT.txt",
  "SEO_GOD_MODE_INTEL (1).txt",
  "SEO_GOD_MODE_INTEL.txt",
  "seo_full_report.txt",
  "seo-gaps-report-2025-12-26.txt",
  "remediation-report-20251226_165704_3e8b624e.txt",
  "SEO Roadmap_ From Research to Implementation.txt",
  "keyword_website design prices.txt",
  "keyword_web design firms.txt",
  "Compititon website development.txt",
  "Keyword.txt",
  "Schema Role Play.txt"
)

$seoReports = Join-Path $src "SEO Reports"
if (Test-Path -LiteralPath $seoReports) {
  Get-ChildItem -LiteralPath $seoReports -File -ErrorAction SilentlyContinue | ForEach-Object {
    Move-UniqueFile -SourcePath $_.FullName -DestDir (Join-Path $k "channels/seo")
  }
}

Ingest-List "web-development" @(
  "Building a Custom CRM and Portal.txt",
  "Building a Social Media Management System (1).txt",
  "Building a Social Media Management System.txt",
  "Next.js Sales CRM Project Setup.txt",
  "Micro SaaS for Sage Accounting (1).txt",
  "Sage Accounting API Solutions Strategy.txt",
  "Micro SaaS for Sage Accounting.txt",
  "Micro SaaS Business Strategy Analysis.txt",
  "Creating Demo Data for SaaS Prototype.txt",
  "Sage Accounting Micro-SaaS Prototype Instructions.txt",
  "Next.js SEO Checklist for AI.txt",
  "Social Strategy and App Development.txt",
  "Local SEO Automation Interface Blueprint.txt",
  "Hybrid Next.js Python Project Setup.txt",
  "Automating Next.js SEO Audits.txt",
  "Next.js and Python Web Development Synergy.txt",
  "Next.js 15 i18n App Router.txt",
  "Next.js SEO_ Testing & Verification.txt",
  "Next.js i18n Deep Dive.txt",
  "Next.js Performance and SEO Deep Dive.txt",
  "Next.js 15 SEO Metadata API.txt",
  "Next.js 15 SEO Deep Dive.txt",
  "Next.js 15 Metadata API Guide.txt",
  "Next.js SEO Roadmap For Competitors.txt",
  "God_Tier_Specs.txt",
  "Next.js WCAG 2.2 AA Compliance Strategy.txt",
  "Next.js Zero Trust Security Strategy.txt",
  "God-Tier Responsive Design Strategy.txt",
  "Next.js UX Strategy_ Alive Interfaces.txt",
  "Next.js Performance Optimization Strategy.txt",
  "Next.js 15 SEO Metadata & JSON-LD.txt",
  "Advanced Technical SEO for Next.js.txt",
  "Next.js CRO & Data Architecture Strategy.txt",
  "Next.js SEO Strategy Blueprint.txt",
  "Next.js SEO_ Advanced Strategies.txt",
  "Crafting High-End Next.js Websites.txt",
  "Next.js SEO Blog Post Ranking.txt",
  "Website Content and Structure Development (1).txt",
  "Website Content and Structure Development.txt",
  "Deep Dive into Google Gemini Gems.txt"
)

# Remove empty SEO Reports subfolder if possible
if (Test-Path -LiteralPath $seoReports) {
  $left = Get-ChildItem -LiteralPath $seoReports -Force -ErrorAction SilentlyContinue
  if (-not $left -or $left.Count -eq 0) {
    Remove-Item -LiteralPath $seoReports -Force
  }
}

# Google Ads (docx + template workbooks) — not covered by generic .xlsx → Meta data-exports rule
$googleAds = Join-Path $k "channels/google-ads"
$googleTemplates = Join-Path $googleAds "templates"
Ensure-Dir $googleAds
Ensure-Dir $googleTemplates

$googleDocx = @(
  "Google Ads Menu Deep Dive (1).docx",
  "Google Ads Menu Deep Dive.docx",
  "No what I want is this__Campaign_Ad group_Search....docx",
  "Retype this please I want to create a menu tree s....docx"
)
foreach ($n in $googleDocx) {
  Move-UniqueFile -SourcePath (Join-Path $src $n) -DestDir $googleAds
}

$adTemplatesDir = Join-Path $src "Ad Templates - Google Ads"
if (Test-Path -LiteralPath $adTemplatesDir) {
  Get-ChildItem -LiteralPath $adTemplatesDir -File -ErrorAction SilentlyContinue | ForEach-Object {
    Move-UniqueFile -SourcePath $_.FullName -DestDir $googleTemplates
  }
  $leftInTemplates = Get-ChildItem -LiteralPath $adTemplatesDir -Force -ErrorAction SilentlyContinue
  if (-not $leftInTemplates -or $leftInTemplates.Count -eq 0) {
    Remove-Item -LiteralPath $adTemplatesDir -Force
  }
}

$remaining = Get-ChildItem -LiteralPath $src -Recurse -File -ErrorAction SilentlyContinue
if ($remaining) {
  Write-Warning "Files still under knowledge/new (add mappings or move manually):"
  $remaining | ForEach-Object { Write-Warning $_.FullName }
}
