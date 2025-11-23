#!/bin/bash

# Test script untuk Gemini API
# Usage: ./test-gemini.sh

API_URL="http://localhost:3002"

echo "======================================"
echo "Testing Gemini API Endpoints"
echo "======================================"
echo ""

# Test 1: Public Chat Endpoint
echo "1. Testing Public Chat Endpoint (No Auth)"
echo "--------------------------------------"
curl -X POST ${API_URL}/api/gemini/chat/public \
  -H 'Content-Type: application/json' \
  -d '{
    "message": "Jelaskan singkat apa itu kecerdasan buatan"
  }' | jq '.'

echo -e "\n\n"

# Test 2: Invalid Request (Empty Message)
echo "2. Testing Validation (Empty Message)"
echo "--------------------------------------"
curl -X POST ${API_URL}/api/gemini/chat/public \
  -H 'Content-Type: application/json' \
  -d '{
    "message": ""
  }' | jq '.'

echo -e "\n\n"

# Test 3: Invalid Request (Missing Message)
echo "3. Testing Validation (Missing Message)"
echo "--------------------------------------"
curl -X POST ${API_URL}/api/gemini/chat/public \
  -H 'Content-Type: application/json' \
  -d '{}' | jq '.'

echo -e "\n\n"

# Test 4: Protected Endpoint without Auth
echo "4. Testing Protected Endpoint (No Auth - Should Fail)"
echo "--------------------------------------"
curl -X POST ${API_URL}/api/gemini/chat \
  -H 'Content-Type: application/json' \
  -d '{
    "message": "Test"
  }' | jq '.'

echo -e "\n\n"

# Note: For protected endpoints, you need JWT token
echo "======================================"
echo "To test protected endpoints, use:"
echo "  1. Login first to get JWT token"
echo "  2. Use token in Authorization header"
echo "======================================"
echo ""
echo "Example with token:"
echo "curl -X POST ${API_URL}/api/gemini/chat \\"
echo "  -H 'Content-Type: application/json' \\"
echo "  -H 'Authorization: Bearer YOUR_JWT_TOKEN' \\"
echo "  -d '{\"message\": \"Your question\"}'"
