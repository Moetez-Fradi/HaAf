Clear-Host

$ts = { Get-Date -Format "HH:mm:ss" }

$animationFrames = @(
    "A",
    "AGE",
    "AGENT",
    "AGENTHI",
    "AGENTHIVE",
    "AGENTHIVE N",
    "AGENTHIVE NOD",
    "AGENTHIVE NODE O",
    "AGENTHIVE NODE ONL",
    "AGENTHIVE NODE ONLINE"
)

Clear-Host
Write-Host "`n`n`n" -NoNewline
foreach ($frame in $animationFrames) {
    Clear-Host
    Write-Host "`n`n`n" -NoNewline
    Write-Host $frame -ForegroundColor Cyan
    Start-Sleep -Milliseconds 100
}
Start-Sleep -Milliseconds 800
Clear-Host

Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "                AGENTHIVE                " -ForegroundColor Yellow
Write-Host "=========================================" -ForegroundColor Cyan
Start-Sleep -Milliseconds 400

$cs = Get-CimInstance Win32_ComputerSystem
$totalGB = [math]::Round([int64]$cs.TotalPhysicalMemory / 1GB, 1)
$proc = Get-CimInstance Win32_Processor
$procName = $proc.Name.Trim()
$logical = $proc.NumberOfLogicalProcessors

Write-Host ""
Write-Host "[ $(&$ts) ] Detecting hardware..." -ForegroundColor DarkGray
Start-Sleep -Milliseconds 400
Write-Host "  CPU: $procName ($logical logical cores)" -ForegroundColor Gray
Write-Host "  RAM: $totalGB GB" -ForegroundColor Gray
Start-Sleep -Milliseconds 600

$ramAlloc = [math]::Max(1, [math]::Min(8, [int]([math]::Floor($totalGB/4))))
$cpuAlloc = [math]::Max(1, [math]::Min($logical, [int]([math]::Floor($logical/2))))

Write-Host ""
Write-Host "Auto-allocating (easy mode): $ramAlloc GB RAM, $cpuAlloc threads" -ForegroundColor Green
Write-Host "Press Enter to start node..."
$null = Read-Host

$jobsRun = 0
$jobsConfirmed = 0
$walletBalance = 0.000

function Show-Wallet {
    param([double]$Balance)
    $maxSlots = 24
    $norm = [math]::Min(1, $Balance / 5)
    $filled = [int]([math]::Round($norm * $maxSlots))
    $bar = ("#" * $filled) + ("-" * ($maxSlots - $filled))
    Write-Host "[$bar]  $([math]::Round($Balance,3)) HBAR" -ForegroundColor Green
}

Write-Host ""
Write-Host "[ $(&$ts) ] Wallet connected." -ForegroundColor Green
Show-Wallet -Balance $walletBalance
Start-Sleep -Milliseconds 500

$steps = @(
    @{Name="Connecting to task dispatcher"; Time=900},
    @{Name="Verifying cryptographic identity"; Time=700}
)

foreach ($s in $steps) {
    $activity = $s.Name
    $duration = $s.Time
    for ($p=0; $p -le 100; $p+=5) {
        Write-Progress -Activity $activity -Status "$p% - $(&$ts)" -PercentComplete $p
        Start-Sleep -Milliseconds ($duration/20)
    }
}
Write-Progress -Activity "Node status" -Completed

Write-Host ""
Write-Host "[ $(&$ts) ] AgentHive node online." -ForegroundColor Green
Start-Sleep -Milliseconds 500

Write-Host ""
Write-Host "[ $(&$ts) ] Waiting for jobs..." -ForegroundColor Cyan -NoNewline
$spinner = @('|', '/', '-', '\')
for ($i = 0; $i -lt 16; $i++) { 
    Write-Host "`b$($spinner[$i % 4])" -NoNewline -ForegroundColor Yellow
    Start-Sleep -Milliseconds 250
}
Write-Host "`b " =
Write-Host "[ $(&$ts) ] Jobs incoming!" -ForegroundColor Green

Write-Host ""
Write-Host "Background job: accepting tasks (non-blocking)" -ForegroundColor Cyan
Start-Sleep -Milliseconds 400

function Get-CpuUsage {
    $cpuCounter = Get-Counter '\Processor(*)\% Processor Time'
    $cpuUsage = [math]::Round(($cpuCounter.CounterSamples | Measure-Object -Property CookedValue -Average).Average, 0)
    return [math]::Min(100, [int](($cpuUsage / $logical) * $cpuAlloc)) 
}

function Get-RamUsage {
    $os = Get-CimInstance Win32_OperatingSystem
    $usedGB = [math]::Round(($os.TotalVisibleMemorySize - $os.FreePhysicalMemory) / 1MB, 1)
    return [math]::Min(100, [int](($usedGB / $totalGB) * $ramAlloc * (100 / $ramAlloc)))  # Approximate
}

$tools = @("img2txt", "summarizer", "sentiment", "dataclean", "tts", "vector-index")

Write-Host ""
Write-Host "[ $(&$ts) ] Pulling tool for node..." -ForegroundColor Cyan
Start-Sleep -Milliseconds (Get-Random -Minimum 1000 -Maximum 3000)
$fixedTask = Get-Random -InputObject $tools
Write-Host "[ $(&$ts) ] Tool pulled: $fixedTask" -ForegroundColor Magenta
Write-Host "[ $(&$ts) ] Tool $fixedTask now running and accepting requests." -ForegroundColor Green

# Indefinite loop for job processing on the fixed tool
Write-Host "`nStatus:" -ForegroundColor Cyan

while ($true) {
    # Simulate accepting a job request for the fixed tool
    Write-Host "[ $(&$ts) ] Accepting new request for tool: $fixedTask..." -ForegroundColor Cyan
    Start-Sleep -Milliseconds (Get-Random -Minimum 1000 -Maximum 3000)  # Longer wait before accepting

    $jobsRun++

    Start-Sleep -Milliseconds (Get-Random -Minimum 2000 -Maximum 4000)

    $jobsConfirmed++
    $payment = [math]::Round((Get-Random -Minimum 0.004 -Maximum 0.025), 4)
    $walletBalance = [math]::Round($walletBalance + $payment, 4)

    $statusLine = "Tool Runs: $jobsRun  |  Finished Jobs: $jobsConfirmed  |  Accumulated HBAR: $([math]::Round($walletBalance,3))"
    Write-Host "`r$statusLine$(' ' * ([console]::WindowWidth - $statusLine.Length - 1))" -NoNewline -ForegroundColor Yellow

    Start-Sleep -Milliseconds (Get-Random -Minimum 3000 -Maximum 6000)
}
