# Comprehensive Duration Tests for Time Tracker

Write-Host "=" * 70
Write-Host "TIME TRACKER - COMPREHENSIVE DURATION TESTS"
Write-Host "=" * 70
Write-Host ""

# Test 1: 30 seconds
Write-Host "TEST 1: 30 Second Duration"
Write-Host "-" * 70

$body1 = @{ task = "Test 30sec" } | ConvertTo-Json
$response1 = Invoke-WebRequest -Uri "http://localhost:3000/api/time-entries" -Method Post -ContentType "application/json" -Body $body1
$entry1 = $response1.Content | ConvertFrom-Json
$entry1Id = $entry1.id

Write-Host "[19:05:53] Created: ID=$entry1Id, Task=$($entry1.task)"
Write-Host "[19:05:53] Start Time: $($entry1.startTime)"
Write-Host "[19:05:53] Waiting 30 seconds..."

Start-Sleep -Seconds 30

$stop1 = Invoke-WebRequest -Uri "http://localhost:3000/api/time-entries/$entry1Id/stop" -Method Post
$stopped1 = $stop1.Content | ConvertFrom-Json

Write-Host "[19:05:53] Stopped"
Write-Host "[19:05:53] End Time: $($stopped1.endTime)"
Write-Host "[19:05:53] Duration: $($stopped1.durationMinutes) minutes"
Write-Host ""

# Test 2: 120 seconds (2 minutes)
Write-Host "TEST 2: 120 Second Duration (2 minutes)"
Write-Host "-" * 70

$body2 = @{ task = "Test 2min" } | ConvertTo-Json
$response2 = Invoke-WebRequest -Uri "http://localhost:3000/api/time-entries" -Method Post -ContentType "application/json" -Body $body2
$entry2 = $response2.Content | ConvertFrom-Json
$entry2Id = $entry2.id

Write-Host "[19:05:53] Created: ID=$entry2Id, Task=$($entry2.task)"
Write-Host "[19:05:53] Start Time: $($entry2.startTime)"
Write-Host "[19:05:53] Waiting 120 seconds..."

Start-Sleep -Seconds 120

$stop2 = Invoke-WebRequest -Uri "http://localhost:3000/api/time-entries/$entry2Id/stop" -Method Post
$stopped2 = $stop2.Content | ConvertFrom-Json

Write-Host "[19:05:53] Stopped"
Write-Host "[19:05:53] End Time: $($stopped2.endTime)"
Write-Host "[19:05:53] Duration: $($stopped2.durationMinutes) minutes"
Write-Host ""

# Test 3: 210 seconds (3.5 minutes)
Write-Host "TEST 3: 210 Second Duration (3.5 minutes)"
Write-Host "-" * 70

$body3 = @{ task = "Test 3.5min" } | ConvertTo-Json
$response3 = Invoke-WebRequest -Uri "http://localhost:3000/api/time-entries" -Method Post -ContentType "application/json" -Body $body3
$entry3 = $response3.Content | ConvertFrom-Json
$entry3Id = $entry3.id

Write-Host "[19:05:53] Created: ID=$entry3Id, Task=$($entry3.task)"
Write-Host "[19:05:53] Start Time: $($entry3.startTime)"
Write-Host "[19:05:53] Waiting 210 seconds..."

Start-Sleep -Seconds 210

$stop3 = Invoke-WebRequest -Uri "http://localhost:3000/api/time-entries/$entry3Id/stop" -Method Post
$stopped3 = $stop3.Content | ConvertFrom-Json

Write-Host "[19:05:53] Stopped"
Write-Host "[19:05:53] End Time: $($stopped3.endTime)"
Write-Host "[19:05:53] Duration: $($stopped3.durationMinutes) minutes"
Write-Host ""

# Get all entries
Write-Host "FINAL RESULTS - All Entries for Today"
Write-Host "=" * 70

$allEntries = Invoke-WebRequest -Uri "http://localhost:3000/api/time-entries?period=day" -Method Get
$entries = $allEntries.Content | ConvertFrom-Json

if ($entries -is [array]) {
    Write-Host "Total entries: $($entries.Count)"
} else {
    Write-Host "Total entries: 1"
    $entries = @($entries)
}

Write-Host ""
Write-Host "Entry Summary:"
Write-Host "-" * 70

foreach ($e in $entries) {
    if ($e.task -like "Test*") {
        Write-Host ""
        Write-Host "Task: $($e.task)"
        Write-Host "  ID: $($e.id)"
        Write-Host "  Start: $($e.startTime)"
        Write-Host "  End: $($e.endTime)"
        Write-Host "  Duration (minutes): $($e.durationMinutes)"
    }
}

Write-Host ""
Write-Host "=" * 70
Write-Host "Duration Validation:"
Write-Host "-" * 70
Write-Host "Expected: 30sec=0min (or close), 120sec=2min, 210sec=3-4min"
Write-Host "Actual:"

foreach ($e in $entries) {
    if ($e.task -like "Test*") {
        Write-Host "  $($e.task): $($e.durationMinutes) minutes"
    }
}

Write-Host "=" * 70
