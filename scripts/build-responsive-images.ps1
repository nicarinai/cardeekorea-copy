param(
  [string]$Ffmpeg = "ffmpeg"
)

$ErrorActionPreference = "Stop"
$projectRoot = Split-Path -Parent $PSScriptRoot
$editorialPath = Join-Path $projectRoot "assets/images/editorial"
$outputPath = Join-Path $projectRoot "assets/images/responsive"
$names = @("measure", "profile", "profile-tight", "grip", "desk", "daily", "black", "red", "blue", "duo", "blue-red")

New-Item -ItemType Directory -Force -Path $outputPath | Out-Null

foreach ($name in $names) {
  $inputFile = Join-Path $editorialPath "$name.webp"
  $outputFile = Join-Path $outputPath "$name-960.webp"
  if (-not (Test-Path -LiteralPath $inputFile)) {
    throw "Source image not found: $inputFile"
  }

  & $Ffmpeg `
    -hide_banner `
    -loglevel error `
    -y `
    -i $inputFile `
    -vf "scale=960:-2:force_original_aspect_ratio=decrease" `
    -c:v libwebp `
    -quality 76 `
    -compression_level 5 `
    $outputFile

  if ($LASTEXITCODE -ne 0) {
    throw "Responsive image generation failed: $name"
  }
}

$outputs = Get-ChildItem -File -LiteralPath $outputPath -Filter "*-960.webp"
$totalBytes = ($outputs | Measure-Object Length -Sum).Sum
Write-Output "Generated $($outputs.Count) responsive images ($([math]::Round($totalBytes / 1MB, 2)) MB)."
