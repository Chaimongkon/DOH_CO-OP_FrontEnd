#!/bin/bash

# API Security Headers Conversion Script
# Usage: ./convert-api-security.sh path/to/api/route.tsx

API_FILE="$1"

if [ ! -f "$API_FILE" ]; then
    echo "❌ File not found: $API_FILE"
    exit 1
fi

echo "🔧 Converting API security headers in: $API_FILE"

# Backup original file
cp "$API_FILE" "$API_FILE.backup"

# Step 1: Add import statement at the top
sed -i '1i import { getDataApiSecurityHeaders, getSubmissionApiSecurityHeaders, getFileApiSecurityHeaders, getCorsPreflightHeaders } from "@/lib/api-security";' "$API_FILE"

# Step 2: Remove local getSecurityHeaders function (basic pattern)
sed -i '/function getSecurityHeaders/,/^}/d' "$API_FILE"
sed -i '/Security headers helper/,/^}/d' "$API_FILE"

# Step 3: Replace headers usage patterns
sed -i 's/headers: getSecurityHeaders()/headers: getDataApiSecurityHeaders()/g' "$API_FILE"
sed -i 's/headers: {[[:space:]]*\.\.\.getSecurityHeaders()/headers: getCorsPreflightHeaders/g' "$API_FILE"

echo "✅ Basic conversion completed!"
echo "📝 Please review and adjust:"
echo "   - Use getSubmissionApiSecurityHeaders() for POST endpoints"
echo "   - Use getFileApiSecurityHeaders() for file serving"
echo "   - Use getCorsPreflightHeaders('METHOD, OPTIONS') for OPTIONS method"
echo ""
echo "🔍 Review changes:"
echo "   diff $API_FILE.backup $API_FILE"