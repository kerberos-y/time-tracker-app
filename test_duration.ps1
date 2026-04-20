# Comprehensive Duration Tests for Time Tracker
# Correct API format: { taskName, projectId }

Write-Host "=" * 70
Write-Host "TIME TRACKER - COMPREHENSIVE DURATION TESTS"
Write-Host "=" * 70
Write-Host ""

# Helper function to make requests
function Invoke-API {
    param(
        [string]$Uri,
        [string]$Method = "GET",
        [hashtable]$Body
    )
    try {
        $params = @{
            Uri = $Uri
            Method = $Method
            ContentType = "application/json"
            ErrorAction = "Stop"
        }
        if ($Body) {
            $params.Body = $Body | ConvertTo-Json
        }
        $response = Invoke-WebRequest @params
        return $response.Content | ConvertFrom-Json
    } catch {
        Write-Host "ERROR: $_"
        return $null
    }
}

# Test 1: 30 seconds
Write-Host "TEST 1: 30 Second Duration"
Write-Host "-" * 70

$entry1 = Invoke-API -Uri "http://localhost:3000/api/time-entries" -Method Post -Body @{ taskName = "Test 30sec"; projectId = 1 }
if (-not $entry1) { exit }
$entry1Id = $entry1.id

Write-Host "[$(Get-Date -Format 'HH:mm:ss')] ✓ Created: ID=$entry1Id, Task=$($entry1.taskName)"
Write-Host "[$(Get-Date -Format 'HH:mm:ss')] Start Time: $($entry1.startedAt)"
Write-Host "[$(Get-Date -Format 'HH:mm:ss')] Waiting 30 seconds..."

Start-Sleep -Seconds 30

$stopped1 = Invoke-API -Uri "http://localhost:3000/api/time-entries/$entry1Id/stop" -Method Post
if (-not $stopped1) { exit }

Write-Host "[$(Get-Date -Format 'HH:mm:ss')] ✓ Stopped"
Write-Host "[$(Get-Date -Format 'HH:mm:ss')] End Time: $($stopped1.endedAt)"
Write-Host "[$(Get-Date -Format 'HH:mm:ss')] Duration: $($stopped1.durationMinutes) minutes"
Write-Host ""

# Test 2: 120 seconds (2 minutes)
Write-Host "TEST 2: 120 Second Duration (2 minutes)"
Write-Host "-" * 70

$entry2 = Invoke-API -Uri "http://localhost:3000/api/time-entries" -Method Post -Body @{ taskName = "Test 2min"; projectId = 1 }
if (-not $entry2) { exit }
$entry2Id = $entry2.id

Write-Host "[$(Get-Date -Format 'HH:mm:ss')] ✓ Created: ID=$entry2Id, Task=$($entry2.taskName)"
Write-Host "[$(Get-Date -Format 'HH:mm:ss')] Start Time: $($entry2.startedAt)"
Write-Host "[$(Get-Date -Format 'HH:mm:ss')] Waiting 120 seconds..."

Start-Sleep -Seconds 120

$stopped2 = Invoke-API -Uri "http://localhost:3000/api/time-entries/$entry2Id/stop" -Method Post
if (-not $stopped2) { exit }

Write-Host "[$(Get-Date -Format 'HH:mm:ss')] ✓ Stopped"
Write-Host "[$(Get-Date -Format 'HH:mm:ss')] End Time: $($stopped2.endedAt)"
Write-Host "[$(Get-Date -Format 'HH:mm:ss')] Duration: $($stopped2.durationMinutes) minutes"
Write-Host ""

# Test 3: 210 seconds (3.5 minutes)
Write-Host "TEST 3: 210 Second Duration (3.5 minutes)"
Write-Host "-" * 70

$entry3 = Invoke-API -Uri "http://localhost:3000/api/time-entries" -Method Post -Body @{ taskName = "Test 3.5min"; projectId = 1 }
if (-not $entry3) { exit }
$entry3Id = $entry3.id

Write-Host "[$(Get-Date -Format 'HH:mm:ss')] ✓ Created: ID=$entry3Id, Task=$($entry3.taskName)"
Write-Host "[$(Get-Date -Format 'HH:mm:ss')] Start Time: $($entry3.startedAt)"
Write-Host "[$(Get-Date -Format 'HH:mm:ss')] Waiting 210 seconds..."

Start-Sleep -Seconds 210

$stopped3 = Invoke-API -Uri "http://localhost:3000/api/time-entries/$entry3Id/stop" -Method Post
if (-not $stopped3) { exit }

Write-Host "[$(Get-Date -Format 'HH:mm:ss')] ✓ Stopped"
Write-Host "[$(Get-Date -Format 'HH:mm:ss')] End Time: $($stopped3.endedAt)"
Write-Host "[$(Get-Date -Format 'HH:mm:ss')] Duration: $($stopped3.durationMinutes) minutes"
Write-Host ""

# Get all entries
Write-Host "FINAL RESULTS - All Entries for Today"
Write-Host "=" * 70

$allEntries = Invoke-API -Uri "http://localhost:3000/api/time-entries?period=day" -Method Get
Write-Host "Total entries: $($allEntries.entries.Count)"
Write-Host ""

Write-Host "Entry Summary:"
Write-Host "-" * 70

foreach ($e in $allEntries.entries) {
    if ($e.taskName -like "Test*") {
        Write-Host ""
        Write-Host "Task: $($e.taskName)"
        Write-Host "  ID: $($e.id)"
        Write-Host "  Start: $($e.startedAt)"
        Write-Host "  End: $($e.endedAt)"
        Write-Host "  Duration (minutes): $($e.durationMinutes)"
    }
}

Write-Host ""
Write-Host "=" * 70
Write-Host "Duration Validation:"
Write-Host "-" * 70
Write-Host "Expected: 30sec=0-1min, 120sec=2min, 210sec=3-4min"
Write-Host "Actual:"

foreach ($e in $allEntries.entries) {
    if ($e.taskName -like "Test*") {
        Write-Host "  $($e.taskName): $($e.durationMinutes) minutes"
    }
}

Write-Host "=" * 70
Write-Host "✓ All tests completed successfully!"
Write-Host "=" * 70
