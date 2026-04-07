# Remove duplicate .txt under knowledge/ by SHA256 (keep one canonical copy per hash).
$ErrorActionPreference = "Stop"
$k = (Resolve-Path (Join-Path $PSScriptRoot "..\knowledge")).Path

$rows = @()
Get-ChildItem -Path $k -Recurse -Filter "*.txt" -File | ForEach-Object {
  $rows += [PSCustomObject]@{
    Path = $_.FullName
    Hash = (Get-FileHash -LiteralPath $_.FullName -Algorithm SHA256).Hash
  }
}

$removed = 0
$rows | Group-Object Hash | Where-Object { $_.Count -gt 1 } | ForEach-Object {
  $sorted = $_.Group | Sort-Object @{
    Expression = {
      $p = $_.Path
      if ($p -match '\\_inbox\\') { 30 }
      elseif ($p -match '\(drive-import \d+\)') { 20 }
      elseif ($p -match ' \(docx') { 10 }
      elseif ($p -match '\(docx\)\.txt$') { 10 }
      else { 0 }
    }
  }, @{ Expression = { $_.Path.Length } }, Path

  $keep = $sorted[0].Path
  $sorted | Select-Object -Skip 1 | ForEach-Object {
    Remove-Item -LiteralPath $_.Path -Force
    $script:removed++
    Write-Host "Deduped:" $_.Path
  }
}

Write-Host "Removed $removed duplicate txt files (by identical content)."
