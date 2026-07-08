# Integration API Verification Script

$baseUrl = "http://localhost:8080/api"
$ErrorActionPreference = "Stop"

Write-Host "=============================================" -ForegroundColor Cyan
Write-Host "  Employee Leave Management System API Test  " -ForegroundColor Cyan
Write-Host "=============================================" -ForegroundColor Cyan

# 1. Health check - Wait for backend
Write-Host "Checking if backend is up..."
$retryCount = 0
$maxRetries = 10
$backendReady = $false

while (-not $backendReady -and $retryCount -lt $maxRetries) {
    try {
        $response = Invoke-WebRequest -Uri "$baseUrl/employees" -Method Get -TimeoutSec 2 -UseBasicParsing
        $backendReady = $true
        Write-Host "Backend is online!" -ForegroundColor Green
    } catch {
        Write-Host "Waiting for backend to start (attempt $($retryCount + 1)/$maxRetries)..."
        Start-Sleep -Seconds 3
        $retryCount++
    }
}

if (-not $backendReady) {
    Write-Error "Backend did not start in time. Aborting tests."
}

# Helper to run request and capture error details
function Invoke-TestRequest {
    param(
        [string]$Uri,
        [string]$Method,
        [object]$Body,
        [int]$ExpectedStatus = 200
    )

    $jsonBody = if ($Body) { $Body | ConvertTo-Json } else { $null }
    
    $statusCode = 0
    $content = $null
    
    try {
        $headers = @{ "Content-Type" = "application/json" }
        $response = Invoke-WebRequest -Uri $Uri -Method $Method -Body $jsonBody -Headers $headers -UseBasicParsing
        $statusCode = $response.StatusCode
        if ($response.Content) {
            $content = $response.Content | ConvertFrom-Json
        }
    } catch [System.Net.WebException] {
        $webEx = $_.Exception
        if ($webEx.Response) {
            $statusCode = [int]$webEx.Response.StatusCode
            $reader = New-Object System.IO.StreamReader($webEx.Response.GetResponseStream())
            $responseBody = $reader.ReadToEnd()
            if ($responseBody) {
                try {
                    $content = $responseBody | ConvertFrom-Json
                } catch {
                    $content = $responseBody
                }
            }
        } else {
            Write-Host "[ERROR] WebException with no Response: $_" -ForegroundColor Red
            throw $_
        }
    } catch {
        Write-Host "[ERROR] Request failed: $_" -ForegroundColor Red
        throw $_
    }

    if ($statusCode -eq $ExpectedStatus) {
        Write-Host "[PASS] $Method $Uri - Status $statusCode as expected." -ForegroundColor Green
        return $content
    } else {
        Write-Host "[FAIL] $Method $Uri - Expected $ExpectedStatus, got $statusCode" -ForegroundColor Red
        Write-Host "Response: $content" -ForegroundColor Yellow
        throw "Test failed"
    }
}

Write-Host "`n--- Running test scenarios ---" -ForegroundColor Cyan

# 2. Add Employee 1
$emp1Body = @{
    name = "Rahul Sharma"
    email = "rahul@example.com"
    department = "Engineering"
    designation = "Senior Dev"
    leaveBalance = 20
}
$emp1 = Invoke-TestRequest -Uri "$baseUrl/employees" -Method Post -Body $emp1Body -ExpectedStatus 201
$emp1Id = $emp1.id

# 3. Add Employee 2
$emp2Body = @{
    name = "Priya Patel"
    email = "priya@example.com"
    department = "HR"
    designation = "HR Manager"
    leaveBalance = 15
}
$emp2 = Invoke-TestRequest -Uri "$baseUrl/employees" -Method Post -Body $emp2Body -ExpectedStatus 201
$emp2Id = $emp2.id

# 4. Try adding duplicate email (should fail with 400)
$dupBody = @{
    name = "Rahul Duplicate"
    email = "rahul@example.com"
    department = "Finance"
    designation = "Analyst"
    leaveBalance = 20
}
$null = Invoke-TestRequest -Uri "$baseUrl/employees" -Method Post -Body $dupBody -ExpectedStatus 400

# 5. Apply for leave (3 days, Casual) for Rahul
$leaveBody = @{
    leaveType = "CASUAL"
    startDate = (Get-Date).ToString("yyyy-MM-dd")
    endDate = (Get-Date).AddDays(2).ToString("yyyy-MM-dd")
    reason = "Family vacation"
}
$leave1 = Invoke-TestRequest -Uri "$baseUrl/leaves/employee/$emp1Id" -Method Post -Body $leaveBody -ExpectedStatus 201
$leave1Id = $leave1.id

# 6. Apply for leave with insufficient balance (should fail with 400)
$hugeLeaveBody = @{
    leaveType = "SICK"
    startDate = (Get-Date).ToString("yyyy-MM-dd")
    endDate = (Get-Date).AddDays(30).ToString("yyyy-MM-dd")
    reason = "Long sick leave"
}
$null = Invoke-TestRequest -Uri "$baseUrl/leaves/employee/$emp1Id" -Method Post -Body $hugeLeaveBody -ExpectedStatus 400

# 7. Approve leave request
$approveBody = @{ status = "APPROVED" }
$approvedLeave = Invoke-TestRequest -Uri "$baseUrl/leaves/$leave1Id/status" -Method Put -Body $approveBody -ExpectedStatus 200

# 8. Check that Rahul's leave balance updated (should be 20 - 3 = 17)
$balanceCheck = Invoke-TestRequest -Uri "$baseUrl/employees/$emp1Id/leave-balance" -Method Get -ExpectedStatus 200
if ($balanceCheck.leaveBalance -eq 17) {
    Write-Host "[PASS] Employee balance correctly updated to 17." -ForegroundColor Green
} else {
    Write-Host "[FAIL] Expected balance 17, got $($balanceCheck.leaveBalance)" -ForegroundColor Red
    throw "Balance mismatch"
}

# 9. Apply and Cancel another request for Priya
$priyaLeaveBody = @{
    leaveType = "SICK"
    startDate = (Get-Date).AddDays(10).ToString("yyyy-MM-dd")
    endDate = (Get-Date).AddDays(11).ToString("yyyy-MM-dd")
    reason = "Medical checkup"
}
$leave2 = Invoke-TestRequest -Uri "$baseUrl/leaves/employee/$emp2Id" -Method Post -Body $priyaLeaveBody -ExpectedStatus 201
$leave2Id = $leave2.id

# Cancel it
$cancelledLeave = Invoke-TestRequest -Uri "$baseUrl/leaves/$leave2Id/cancel" -Method Put -ExpectedStatus 200
if ($cancelledLeave.status -eq "CANCELLED") {
    Write-Host "[PASS] Leave request successfully cancelled." -ForegroundColor Green
} else {
    Write-Host "[FAIL] Status not CANCELLED, got $($cancelledLeave.status)" -ForegroundColor Red
    throw "Cancel failed"
}

Write-Host "`n=============================================" -ForegroundColor Cyan
Write-Host "  API Integration Verification PASSED!       " -ForegroundColor Green
Write-Host "=============================================" -ForegroundColor Cyan
