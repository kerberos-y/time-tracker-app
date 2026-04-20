Write-Host "TEST: Create entry with error handling" -ForegroundColor Cyan
Write-Host ""
Write-Host "STEP 1: Creating entry..." -ForegroundColor Yellow

$body = '{"taskName":"Clean Test","projectId":1}'
Write-Host "Request Body: $body"

try {
    $response = Invoke-WebRequest -Uri "http://localhost:3000/api/time-entries" -Method Post -ContentType "application/json" -Body $body -ErrorAction Stop
    $entry = $response.Content | ConvertFrom-Json
    $entryId = $entry.id
    Write-Host "Entry created with ID: $entryId" -ForegroundColor Green
    Write-Host "Response: "
    $entry | ConvertTo-Json -Depth 5 | Write-Host
} catch {
    Write-Host "ERROR: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.Exception.Response) {
        try {
            $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
            $responseBody = $reader.ReadToEnd()
            Write-Host "Server Response: $responseBody" -ForegroundColor Red
        } catch {}
    }
    Exit 1
}

Write-Host ""
Write-Host "STEP 2: Waiting 5 seconds..." -ForegroundColor Yellow
Start-Sleep -Seconds 5

Write-Host ""
Write-Host "STEP 3: Stopping entry..." -ForegroundColor Yellow

try {
    $response = Invoke-WebRequest -Uri "http://localhost:3000/api/time-entries/$entryId/stop" -Method Post -ContentType "application/json" -ErrorAction Stop
    $stopped = $response.Content | ConvertFrom-Json
    Write-Host "Entry stopped" -ForegroundColor Green
    Write-Host "Duration: $($stopped.durationMinutes) minutes" -ForegroundColor Cyan
    Write-Host "Response: "
    $stopped | ConvertTo-Json -Depth 5 | Write-Host
} catch {
    Write-Host "ERROR stopping: $($_.Exception.Message)" -ForegroundColor Red
}
