# One-time batch: create knowledge subfolders and move txt from knowledge root.
$ErrorActionPreference = "Stop"
$k = (Resolve-Path (Join-Path $PSScriptRoot "..\knowledge")).Path

$dirs = @(
  "industry/firewood-braai",
  "channels/facebook-ads",
  "channels/seo",
  "web-development",
  "creative-direction",
  "audiences",
  "clients/miwesu/wood",
  "clients/miwesu/farm",
  "clients/vaalpenskraal/wood",
  "clients/vaalpenskraal/farm",
  "clients/alberton-tyre-clinic",
  "clients/absolute-offroad",
  "clients/alberton-battery-mart",
  "clients/maverick-painting-contractors",
  "clients/on-the-move-again",
  "clients/efs-suspension",
  "clients/as-brokers",
  "clients/vuyela-logistics",
  "_inbox",
  "_review"
)
foreach ($d in $dirs) {
  $full = Join-Path $k $d
  if (-not (Test-Path $full)) { New-Item -ItemType Directory -Path $full | Out-Null }
}

$map = @{
  "industry/firewood-braai" = @(
    "Wood Seller Policy Research Outline.txt",
    "Wood Sales Plan For Gauteng.txt",
    "Wood Bag Sales Strategy Roadmap.txt",
    "Wood Bag Sales and Marketing Plan.txt",
    "Wood Bag Prompt Engineering (docx).txt",
    "WHAT THE WOOD LOOKS LIKE Researching Firewood Visuals for Website.txt",
    "The best so far Firewood Ad Prompts_ Square & Vertical.txt",
    "South African Lifestyle Ad Concepts.txt",
    "Selling Braai Wood Psychology & Design.txt",
    "Researching Firewood Sales Strategy.txt",
    "Premium Firewood Brand AI Prompts.txt",
    "Firewood Lifestyle Ad Concepts.txt",
    "Consistent Firewood Bag Image Generation.txt",
    "Building Premium Afrikaans Firewood Brand.txt",
    "Braai Wood Marketing Campaign Strategy (docx).txt",
    "Braai Wood Marketing Campaign Strategy.txt",
    "Braai Wood Marketing Calendar & Prompts.txt",
    "Braai Wood Ad Strategy Research Plan (docx).txt",
    "Braai Wood Ad Strategy Research Plan.txt",
    "AI Image Prompts for Firewood Ads.txt",
    "Aggressive Firewood Sales Strategy.txt",
    "Aggressive Firewood Sales Campaign.txt",
    "Afrikaans Firewood Advertising Strategy (docx).txt",
    "Afrikaans Firewood Advertising Strategy.txt",
    "Researching Firewood Visuals for Website.txt",
    "Wood Bag Prompt Engineering.txt"
  )
  "channels/facebook-ads" = @(
    "Social Media & Ad Plan_ Firewood.txt",
    "Facebook Page Setup for Success.txt",
    "Facebook Braai Wood Ad Strategy.txt",
    "Facebook Ads Strategy for Pretoria (docx).txt",
    "Facebook Ad Strategy_ Firewood Sales.txt",
    "Facebook Ad Strategy for Premium Firewood.txt",
    "Facebook Ad Strategy for Businesses.txt",
    "Facebook Ad Plan for Braai Wood.txt",
    "Braai Wood Facebook Ad Strategy.txt",
    "Alberton Firewood Facebook Ad Strategy.txt",
    "Facebook Ads Strategy for Pretoria.txt"
  )
  "channels/seo" = @(
    "Firewood SEO Strategy_ Gauteng Dominance (docx).txt",
    "Firewood SEO Strategy for Gauteng (docx).txt",
    "Aggressive SEO Strategy for Firewood Business (docx).txt",
    "Aggressive SEO Strategy for Firewood Business(1).txt",
    "Firewood SEO Strategy_ Gauteng Dominance.txt",
    "Firewood SEO Strategy for Gauteng.txt",
    "Aggressive SEO Strategy for Firewood Business (1).txt",
    "Aggressive SEO Strategy for Firewood Business.txt"
  )
  "web-development" = @(
    "Next.js Firewood SEO Strategy Research (docx).txt",
    "Next.js E-commerce Firewood Project.txt",
    "Firewood Landing Page Design Research.txt",
    "Braai Wood Research for E-commerce (docx).txt",
    "Braai Wood Landing Page Research & Design (docx).txt",
    "Braai Wood Research for E-commerce.txt",
    "Braai Wood Landing Page Research & Design.txt",
    "Next.js Firewood SEO Strategy Research.txt"
  )
  "creative-direction" = @(
    "Creative Ad Concepts_ Apple x Samsung.txt",
    "Firewood Reimagined_ Tech Fusion Campaign (docx).txt",
    "Firewood Reimagined_ Tech Fusion Campaign(1).txt",
    "Firewood Reimagined_ Tech Fusion Campaign (1).txt",
    "Firewood Reimagined_ Tech Fusion Campaign.txt"
  )
  "audiences" = @(
    "Targeting White South Africans in Gauteng (docx).txt",
    "Targeting White South Africans in Gauteng.txt",
    "White South African Bushveld Leisure Research.txt"
  )
  "clients/miwesu/wood" = @(
    "0001miwesu-overview.txt",
    "Miwesu new 3 Firewood Ad Lifestyle Image Concepts.txt",
    "MIWESU Luxury Brand Web Architecture.txt"
  )
  "clients/vaalpenskraal/wood" = @(
    "Ad Creative Deep Dive_ Vaalpenskraal Braai Mix.txt"
  )
}

$moved = 0
$missing = [System.Collections.ArrayList]@()
foreach ($dest in $map.Keys) {
  foreach ($name in $map[$dest]) {
    $src = Join-Path $k $name
    if (-not (Test-Path -LiteralPath $src)) {
      [void]$missing.Add($name)
      continue
    }
    $targetDir = Join-Path $k $dest
    Move-Item -LiteralPath $src -Destination (Join-Path $targetDir $name) -Force
    $moved++
  }
}

$left = Get-ChildItem -Path $k -Filter *.txt -File
Write-Output "Moved $moved files."
if ($missing.Count) {
  Write-Output "MISSING (not in knowledge root):"
  $missing | ForEach-Object { Write-Output "  $_" }
}
if ($left.Count) {
  Write-Output "TXT still in knowledge root ($($left.Count)):"
  $left | ForEach-Object { Write-Output "  $($_.Name)" }
}
