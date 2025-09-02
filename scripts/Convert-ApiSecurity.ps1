# API Security Headers Conversion Script for Windows
# Usage: .\Convert-ApiSecurity.ps1 "path\to\api\route.tsx"

param(
    [Parameter(Mandatory=$true)]
    [string]$ApiFile
)

if (-not (Test-Path $ApiFile)) {
    Write-Host "❌ File not found: $ApiFile" -ForegroundColor Red
    exit 1
}

Write-Host "🔧 Converting API security headers in: $ApiFile" -ForegroundColor Yellow

# Backup original file
Copy-Item $ApiFile "$ApiFile.backup"

try {
    $content = Get-Content $ApiFile -Raw
    
    # Step 1: Add import statement
    $importLine = 'import { getDataApiSecurityHeaders, getSubmissionApiSecurityHeaders, getFileApiSecurityHeaders, getCorsPreflightHeaders } from "@/lib/api-security";'
    
    # Find the first existing import and add before it
    if ($content -match '(import.*?from.*?;)') {
        $content = $content -replace '(import.*?from.*?;)', "$importLine`r`n`$1"
    } else {
        $content = "$importLine`r`n$content"
    }
    
    # Step 2: Remove local getSecurityHeaders function
    $content = $content -replace '(?s)\/\/\s*Security headers helper.*?function getSecurityHeaders\(\).*?\n\}', ''
    $content = $content -replace '(?s)function getSecurityHeaders\(\).*?\n\}', ''
    
    # Step 3: Replace basic headers usage
    $content = $content -replace 'headers:\s*getSecurityHeaders\(\)', 'headers: getDataApiSecurityHeaders()'
    
    # Step 4: Replace OPTIONS method headers
    $content = $content -replace 'headers:\s*\{\s*\.\.\.getSecurityHeaders\(\),\s*[''"]Access-Control-Max-Age[''"]:\s*[''"]86400[''"],?\s*\}', 'headers: getCorsPreflightHeaders()'
    
    # Write the modified content back
    Set-Content $ApiFile $content -Encoding UTF8
    
    Write-Host "✅ Basic conversion completed!" -ForegroundColor Green
    Write-Host "📝 Please review and adjust:" -ForegroundColor Cyan
    Write-Host "   - Use getSubmissionApiSecurityHeaders() for POST endpoints" -ForegroundColor White
    Write-Host "   - Use getFileApiSecurityHeaders() for file serving" -ForegroundColor White
    Write-Host "   - Use getCorsPreflightHeaders('METHOD, OPTIONS') for OPTIONS method" -ForegroundColor White
    Write-Host ""
    Write-Host "🔍 Review changes with: git diff $ApiFile" -ForegroundColor Magenta

} catch {
    Write-Host "❌ Error during conversion: $_" -ForegroundColor Red
    # Restore backup
    Copy-Item "$ApiFile.backup" $ApiFile
    exit 1
}