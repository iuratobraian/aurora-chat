param(
  [string]$SourcePng = "icon-aurora.webp",
  [string]$OutputIco = ".agent/aurora/assets/aurora-icon.ico"
)

$ErrorActionPreference = "Stop"

$projectRoot = Split-Path -Parent $PSScriptRoot
$sourcePath = Join-Path $projectRoot $SourcePng
$outputPath = Join-Path $projectRoot $OutputIco
$outputDir = Split-Path -Parent $outputPath

if (-not (Test-Path $sourcePath)) {
  throw "No se encontró el PNG fuente: $sourcePath"
}

if (-not (Test-Path $outputDir)) {
  New-Item -ItemType Directory -Path $outputDir -Force | Out-Null
}

Add-Type -AssemblyName System.Drawing

function Get-EdgePath {
  $candidates = @(
    "C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe",
    "C:\Program Files\Microsoft\Edge\Application\msedge.exe"
  )

  foreach ($candidate in $candidates) {
    if (Test-Path $candidate) {
      return $candidate
    }
  }

  return $null
}

function Convert-WebpToPngWithEdge {
  param(
    [string]$InputPath,
    [string]$OutputPath
  )

  $edgePath = Get-EdgePath
  if (-not $edgePath) {
    throw "No se encontró Microsoft Edge para convertir WebP a PNG."
  }

  $tempHtml = Join-Path ([System.IO.Path]::GetTempPath()) ("aurora-icon-" + [System.Guid]::NewGuid().ToString("N") + ".html")
  $imageUri = [System.Uri]::new($InputPath).AbsoluteUri
  $html = @"
<!doctype html>
<html>
  <body style="margin:0;display:grid;place-items:center;width:100vw;height:100vh;background:transparent;overflow:hidden;">
    <img src="$imageUri" style="width:100%;height:100%;object-fit:contain;" />
  </body>
</html>
"@

  Set-Content -Path $tempHtml -Value $html -Encoding UTF8

  try {
    $tempHtmlUri = [System.Uri]::new($tempHtml).AbsoluteUri
    $args = @(
      "--headless",
      "--disable-gpu",
      "--hide-scrollbars",
      "--window-size=512,512",
      "--screenshot=$OutputPath",
      $tempHtmlUri
    )

    $process = Start-Process -FilePath $edgePath -ArgumentList $args -Wait -PassThru -WindowStyle Hidden
    if ($process.ExitCode -ne 0 -or -not (Test-Path $OutputPath)) {
      throw "Edge no pudo generar el PNG intermedio para el icono."
    }
  } finally {
    Remove-Item $tempHtml -Force -ErrorAction SilentlyContinue
  }
}

$tempPngPath = $null
$workingImagePath = $sourcePath

if ([System.IO.Path]::GetExtension($sourcePath).ToLowerInvariant() -eq ".webp") {
  $tempPngPath = Join-Path ([System.IO.Path]::GetTempPath()) ("aurora-icon-" + [System.Guid]::NewGuid().ToString("N") + ".png")
  Convert-WebpToPngWithEdge -InputPath $sourcePath -OutputPath $tempPngPath
  $workingImagePath = $tempPngPath
}

$image = [System.Drawing.Image]::FromFile($workingImagePath)

try {
  $pngBytes = [System.IO.File]::ReadAllBytes($workingImagePath)
  $stream = New-Object System.IO.FileStream($outputPath, [System.IO.FileMode]::Create, [System.IO.FileAccess]::Write)
  $writer = New-Object System.IO.BinaryWriter($stream)

  try {
    $widthByte = if ($image.Width -ge 256) { 0 } else { [byte]$image.Width }
    $heightByte = if ($image.Height -ge 256) { 0 } else { [byte]$image.Height }
    $imageOffset = 6 + 16

    $writer.Write([UInt16]0)
    $writer.Write([UInt16]1)
    $writer.Write([UInt16]1)

    $writer.Write([byte]$widthByte)
    $writer.Write([byte]$heightByte)
    $writer.Write([byte]0)
    $writer.Write([byte]0)
    $writer.Write([UInt16]1)
    $writer.Write([UInt16]32)
    $writer.Write([UInt32]$pngBytes.Length)
    $writer.Write([UInt32]$imageOffset)
    $writer.Write($pngBytes)
  } finally {
    $writer.Dispose()
    $stream.Dispose()
  }
} finally {
  $image.Dispose()
  if ($tempPngPath) {
    Remove-Item $tempPngPath -Force -ErrorAction SilentlyContinue
  }
}

Write-Host "Icono Aurora generado en $outputPath" -ForegroundColor Green
