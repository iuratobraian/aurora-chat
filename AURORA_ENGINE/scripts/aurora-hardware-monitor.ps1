<#
.SYNOPSIS
    Aurora Hardware Monitor Utility.
    Part of the Aurora Mente Maestra (AMM) proactive improvements.
    
.DESCRIPTION
    Collects real-time CPU and RAM metrics to help Aurora agents understand the available system resources.
#>

function Get-HardwareMetrics {
    $cpu = Get-CimInstance Win32_Processor | Select-Object Name, NumberOfCores, MaxClockSpeed, LoadPercentage
    $os = Get-CimInstance Win32_OperatingSystem | Select-Object TotalVisibleMemorySize, FreePhysicalMemory
    
    $totalMemGB = [Math]::Round($os.TotalVisibleMemorySize / 1MB, 2)
    $freeMemGB = [Math]::Round($os.FreePhysicalMemory / 1MB, 2)
    $usedMemGB = [Math]::Round($totalMemGB - $freeMemGB, 2)
    $memUsagePct = [Math]::Round(($usedMemGB / $totalMemGB) * 100, 2)
    
    $metrics = @{
        Timestamp = (Get-Date).ToString("yyyy-MM-dd HH:mm:ss")
        CPU = @{
            Name = $cpu.Name.Trim()
            Cores = $cpu.NumberOfCores
            MaxClockSpeedMHz = $cpu.MaxClockSpeed
            LoadPct = $cpu.LoadPercentage
        }
        Memory = @{
            TotalGB = $totalMemGB
            UsedGB = $usedMemGB
            FreeGB = $freeMemGB
            UsagePct = $memUsagePct
        }
        System = @{
            Hostname = $env:COMPUTERNAME
            OS = (Get-CimInstance Win32_OperatingSystem).Caption
        }
    }
    
    return $metrics | ConvertTo-Json -Depth 4
}

Write-Host "--- Aurora Hardware Monitor ---" -ForegroundColor Cyan
$data = Get-HardwareMetrics
Write-Host $data
