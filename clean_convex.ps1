$convexPath = "c:\Users\iurato\Downloads\tradeportal-2025-platinum\convex"
Get-ChildItem -Path $convexPath -Recurse -Filter *.js | ForEach-Object {
    $jsPath = $_.FullName
    $tsPath = $jsPath -replace '\.js$', '.ts'
    if (Test-Path $tsPath) {
        Remove-Item $jsPath -Force
        Write-Host "Deleted redundant JS file: $jsPath"
    }
}
