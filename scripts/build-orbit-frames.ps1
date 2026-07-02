param(
  [string]$Ffmpeg = "ffmpeg",
  [string]$InputVideo = "assets/video/cardeexeno-showcase-portrait.mp4",
  [string]$OutputDirectory = "assets/sequence/orbit"
)

$ErrorActionPreference = "Stop"
$projectRoot = Split-Path -Parent $PSScriptRoot
$inputPath = Join-Path $projectRoot $InputVideo
$outputPath = Join-Path $projectRoot $OutputDirectory

if (-not (Test-Path -LiteralPath $inputPath)) {
  throw "Source video not found: $inputPath"
}

New-Item -ItemType Directory -Force -Path $outputPath | Out-Null

& $Ffmpeg `
  -y `
  -ss 1 `
  -t 14 `
  -i $inputPath `
  -vf "fps=8,scale=608:1080:flags=lanczos" `
  -c:v libwebp `
  -quality 72 `
  -compression_level 5 `
  -an `
  (Join-Path $outputPath "frame-%03d.webp")

if ($LASTEXITCODE -ne 0) {
  throw "Frame extraction failed with exit code $LASTEXITCODE"
}

$frames = Get-ChildItem -File -LiteralPath $outputPath -Filter "frame-*.webp" | Sort-Object Name
if ($frames.Count -ne 112) {
  throw "Expected 112 frames, found $($frames.Count)"
}

$totalBytes = ($frames | Measure-Object Length -Sum).Sum
Write-Output "Generated $($frames.Count) frames ($([math]::Round($totalBytes / 1MB, 2)) MB)."
